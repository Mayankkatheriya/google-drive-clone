import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import { createDownloadUrl } from "./cloudfront";
import { assertUserOwnsKey, getObjectStream } from "./s3";

const COLLECTION = "shareLinks";
const SIGNED_TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_FAILED_UNLOCKS = 5;
const UNLOCK_LOCKOUT_MS = 15 * 60 * 1000;

function shareLinkRef(token) {
  return getAdminFirestore().collection(COLLECTION).doc(token);
}

function assertValidToken(token) {
  if (!token || typeof token !== "string" || token.length < 16) {
    const error = new Error("Invalid share link");
    error.statusCode = 400;
    throw error;
  }
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !password) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
  } catch {
    return false;
  }
}

function signingSecret() {
  const secret =
    process.env.SHARE_LINK_UNLOCK_SECRET || process.env.FIREBASE_PRIVATE_KEY;
  if (!secret) {
    throw new Error("Missing SHARE_LINK_UNLOCK_SECRET");
  }
  return secret;
}

function signShareToken(purpose, shareToken, exp) {
  return createHmac("sha256", signingSecret())
    .update(`${purpose}:${shareToken}:${exp}`)
    .digest("hex");
}

function createSignedToken(purpose, shareToken) {
  const exp = Date.now() + SIGNED_TOKEN_TTL_MS;
  return `${exp}.${signShareToken(purpose, shareToken, exp)}`;
}

function verifySignedToken(purpose, shareToken, signedToken) {
  if (!signedToken || typeof signedToken !== "string") return false;
  const [expStr, sig] = signedToken.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = signShareToken(purpose, shareToken, exp);
  try {
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** Proves the password was entered; does not count a view. */
export function createUnlockToken(shareToken) {
  return createSignedToken("unlock", shareToken);
}

export function verifyUnlockToken(shareToken, unlockToken) {
  return verifySignedToken("unlock", shareToken, unlockToken);
}

/** Issued only when a view is redeemed; required to stream content. */
function createAccessToken(shareToken) {
  return createSignedToken("access", shareToken);
}

function verifyAccessToken(shareToken, accessToken) {
  return verifySignedToken("access", shareToken, accessToken);
}

function toMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return null;
}

function linkUnavailableReason(data) {
  if (!data) return { statusCode: 404, message: "Share link not found" };
  if (data.revoked) return { statusCode: 410, message: "This link has been revoked" };

  if (data.expiresAt) {
    const ms =
      typeof data.expiresAt.toMillis === "function"
        ? data.expiresAt.toMillis()
        : data.expiresAt.seconds
          ? data.expiresAt.seconds * 1000
          : null;
    if (ms && Date.now() > ms) {
      return { statusCode: 410, message: "This link has expired" };
    }
  }

  const maxViews = data.maxViews ?? (data.redeemed ? 1 : null);
  const viewCount = data.viewCount ?? (data.redeemed ? 1 : 0);
  if (maxViews != null && viewCount >= maxViews) {
    return {
      statusCode: 410,
      message:
        maxViews === 1
          ? "This one-time link has already been used"
          : "This link has reached its view limit",
    };
  }

  return null;
}

export async function getShareLinkRecord(token) {
  assertValidToken(token);
  const snap = await shareLinkRef(token).get();
  if (!snap.exists) return null;
  return snap.data();
}

async function getOwnedFile(fileId, userId) {
  const db = getAdminFirestore();
  const snap = await db.collection("myfiles").doc(fileId).get();

  if (!snap.exists) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  const data = snap.data();
  if (data.userId !== userId) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (data.type === "folder" || !data.s3Key) {
    const error = new Error("File is not available to share");
    error.statusCode = 400;
    throw error;
  }

  // File docs are client-written; never trust an s3Key outside the owner's prefix.
  assertUserOwnsKey(userId, data.s3Key);

  return { id: snap.id, ...data };
}

export async function createShareLink({
  fileId,
  userId,
  origin,
  expiresInHours,
  password,
  maxViews,
  allowDownload = true,
}) {
  const file = await getOwnedFile(fileId, userId);
  const token = randomBytes(24).toString("hex");

  const doc = {
    userId,
    fileId,
    s3Key: file.s3Key,
    filename: file.filename,
    contentType: file.contentType || "application/octet-stream",
    size: file.size || 0,
    redeemed: false,
    revoked: false,
    viewCount: 0,
    allowDownload: allowDownload !== false,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (maxViews != null && maxViews !== "") {
    const n = Number(maxViews);
    if (!Number.isFinite(n) || n < 1) {
      const error = new Error("maxViews must be a positive number");
      error.statusCode = 400;
      throw error;
    }
    doc.maxViews = Math.floor(n);
  }

  if (expiresInHours != null && expiresInHours !== "") {
    const hours = Number(expiresInHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      const error = new Error("expiresInHours must be positive");
      error.statusCode = 400;
      throw error;
    }
    doc.expiresAt = Timestamp.fromMillis(Date.now() + hours * 3600 * 1000);
  }

  if (password) {
    if (typeof password !== "string" || password.length < 4) {
      const error = new Error("Password must be at least 4 characters");
      error.statusCode = 400;
      throw error;
    }
    doc.passwordHash = hashPassword(password);
  }

  await shareLinkRef(token).set(doc);

  const baseOrigin = origin?.replace(/\/$/, "") || "";
  return {
    token,
    url: `${baseOrigin}/share/${token}`,
    filename: file.filename,
    maxViews: doc.maxViews ?? null,
    allowDownload: doc.allowDownload,
    hasPassword: Boolean(doc.passwordHash),
    expiresInHours: expiresInHours ? Number(expiresInHours) : null,
  };
}

export async function listShareLinksForFile({ fileId, userId }) {
  const snap = await getAdminFirestore()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .where("fileId", "==", fileId)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      token: d.id,
      filename: data.filename,
      createdAt: data.createdAt?.toMillis?.() ?? null,
      expiresAt: data.expiresAt?.toMillis?.() ?? null,
      maxViews: data.maxViews ?? null,
      viewCount: data.viewCount ?? (data.redeemed ? 1 : 0),
      allowDownload: data.allowDownload !== false,
      hasPassword: Boolean(data.passwordHash),
      revoked: Boolean(data.revoked),
      redeemed: Boolean(data.redeemed),
    };
  });
}

export async function listShareLinksForUser(userId) {
  const snap = await getAdminFirestore()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      token: d.id,
      fileId: data.fileId,
      filename: data.filename,
      createdAt: data.createdAt?.toMillis?.() ?? null,
      expiresAt: data.expiresAt?.toMillis?.() ?? null,
      maxViews: data.maxViews ?? null,
      viewCount: data.viewCount ?? (data.redeemed ? 1 : 0),
      revoked: Boolean(data.revoked),
      redeemed: Boolean(data.redeemed),
    };
  });
}

export async function revokeShareLink({ token, userId }) {
  assertValidToken(token);
  const ref = shareLinkRef(token);
  const snap = await ref.get();
  if (!snap.exists) {
    const error = new Error("Share link not found");
    error.statusCode = 404;
    throw error;
  }
  if (snap.data().userId !== userId) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
  // Hard-delete so the token stops working and disappears from all lists/cleanup.
  await ref.delete();
  return { ok: true };
}

export async function deleteShareLink({ token, userId }) {
  assertValidToken(token);
  const ref = shareLinkRef(token);
  const snap = await ref.get();
  if (!snap.exists) {
    const error = new Error("Share link not found");
    error.statusCode = 404;
    throw error;
  }
  if (snap.data().userId !== userId) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
  await ref.delete();
  return { ok: true };
}

export async function unlockShareLink(token, password) {
  assertValidToken(token);
  const ref = shareLinkRef(token);
  let failure = null;

  await getAdminFirestore().runTransaction(async (tx) => {
    failure = null;
    const snap = await tx.get(ref);
    if (!snap.exists) {
      const error = new Error("Share link not found");
      error.statusCode = 404;
      throw error;
    }
    const data = snap.data();
    const unavailable = linkUnavailableReason(data);
    if (unavailable) {
      const error = new Error(unavailable.message);
      error.statusCode = unavailable.statusCode;
      throw error;
    }
    if (!data.passwordHash) return;

    const now = Date.now();
    const lockedUntil = toMillis(data.unlockLockedUntil);
    if (lockedUntil && now < lockedUntil) {
      const error = new Error("Too many attempts. Try again later.");
      error.statusCode = 429;
      throw error;
    }

    if (verifyPassword(password, data.passwordHash)) {
      if (data.failedUnlocks) {
        tx.update(ref, {
          failedUnlocks: 0,
          unlockLockedUntil: FieldValue.delete(),
        });
      }
      return;
    }

    const failedUnlocks = (data.failedUnlocks || 0) + 1;
    if (failedUnlocks >= MAX_FAILED_UNLOCKS) {
      tx.update(ref, {
        failedUnlocks: 0,
        unlockLockedUntil: Timestamp.fromMillis(now + UNLOCK_LOCKOUT_MS),
      });
      failure = { statusCode: 429, message: "Too many attempts. Try again later." };
    } else {
      tx.update(ref, { failedUnlocks });
      failure = { statusCode: 401, message: "Incorrect password" };
    }
  });

  if (failure) {
    const error = new Error(failure.message);
    error.statusCode = failure.statusCode;
    throw error;
  }
  return { unlockToken: createUnlockToken(token) };
}

export function getShareLinkPublicMeta(data) {
  if (!data) return null;
  const unavailable = linkUnavailableReason(data);
  return {
    filename: data.filename,
    contentType: data.contentType,
    size: data.size || 0,
    requiresPassword: Boolean(data.passwordHash),
    allowDownload: data.allowDownload !== false,
    maxViews: data.maxViews ?? null,
    viewCount: data.viewCount ?? (data.redeemed ? 1 : 0),
    unavailable: unavailable
      ? { status: unavailable.statusCode === 404 ? "missing" : "used", message: unavailable.message }
      : null,
  };
}

export async function redeemShareLink(token, { unlockToken } = {}) {
  assertValidToken(token);
  const ref = shareLinkRef(token);
  let fileMeta = null;

  await getAdminFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      const error = new Error("Share link not found");
      error.statusCode = 404;
      throw error;
    }

    const data = snap.data();
    const unavailable = linkUnavailableReason(data);
    if (unavailable) {
      const error = new Error(unavailable.message);
      error.statusCode = unavailable.statusCode;
      throw error;
    }

    if (data.passwordHash) {
      if (!verifyUnlockToken(token, unlockToken)) {
        const error = new Error("Password required");
        error.statusCode = 401;
        error.code = "PASSWORD_REQUIRED";
        throw error;
      }
    }

    const nextCount = (data.viewCount ?? (data.redeemed ? 1 : 0)) + 1;
    tx.update(ref, {
      viewCount: nextCount,
      redeemed: true,
      redeemedAt: FieldValue.serverTimestamp(),
      lastViewedAt: FieldValue.serverTimestamp(),
    });

    fileMeta = { ...data, viewCount: nextCount };
  });

  const downloadUrl =
    fileMeta.allowDownload === false
      ? null
      : await createDownloadUrl(fileMeta.s3Key, {
          filename: fileMeta.filename,
          disposition: "inline",
        });

  return {
    token,
    filename: fileMeta.filename,
    contentType: fileMeta.contentType,
    size: fileMeta.size,
    downloadUrl,
    allowDownload: fileMeta.allowDownload !== false,
    accessToken: createAccessToken(token),
  };
}

export async function streamShareLinkContent(token, { range, accessToken } = {}) {
  assertValidToken(token);

  if (!verifyAccessToken(token, accessToken)) {
    const error = new Error("Open the share link to view this file");
    error.statusCode = 403;
    throw error;
  }

  const snap = await shareLinkRef(token).get();
  if (!snap.exists) {
    const error = new Error("Share link not found");
    error.statusCode = 404;
    throw error;
  }

  const data = snap.data();
  if (data.revoked) {
    const error = new Error("This link has been revoked");
    error.statusCode = 410;
    throw error;
  }

  const expiresAt = toMillis(data.expiresAt);
  if (expiresAt && Date.now() > expiresAt) {
    const error = new Error("This link has expired");
    error.statusCode = 410;
    throw error;
  }

  const stream = await getObjectStream(data.s3Key, { range });

  return {
    ...stream,
    filename: data.filename,
    allowDownload: data.allowDownload !== false,
  };
}

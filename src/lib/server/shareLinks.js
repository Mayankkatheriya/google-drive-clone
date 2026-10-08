import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import { createDownloadUrl } from "./cloudfront";
import { getObjectStream } from "./s3";

const COLLECTION = "shareLinks";

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

function unlockSecret() {
  return (
    process.env.SHARE_LINK_UNLOCK_SECRET ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    "disk-drive-share-unlock"
  );
}

export function createUnlockToken(shareToken) {
  const exp = Date.now() + 60 * 60 * 1000;
  const sig = createHash("sha256")
    .update(`${shareToken}:${exp}:${unlockSecret()}`)
    .digest("hex");
  return `${exp}.${sig}`;
}

export function verifyUnlockToken(shareToken, unlockToken) {
  if (!unlockToken || typeof unlockToken !== "string") return false;
  const [expStr, sig] = unlockToken.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = createHash("sha256")
    .update(`${shareToken}:${exp}:${unlockSecret()}`)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
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
  const snap = await shareLinkRef(token).get();
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
  if (!data.passwordHash) {
    return { unlockToken: createUnlockToken(token) };
  }
  if (!verifyPassword(password, data.passwordHash)) {
    const error = new Error("Incorrect password");
    error.statusCode = 401;
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

export async function redeemShareLink(token, { unlockToken, password } = {}) {
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
      const unlocked =
        verifyUnlockToken(token, unlockToken) ||
        verifyPassword(password, data.passwordHash);
      if (!unlocked) {
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
    viewUrl: `/api/share-link/${token}/content`,
    allowDownload: fileMeta.allowDownload !== false,
    unlockToken:
      fileMeta.passwordHash && !unlockToken
        ? createUnlockToken(token)
        : unlockToken || null,
  };
}

export async function streamShareLinkContent(token, { range, unlockToken } = {}) {
  assertValidToken(token);

  const snap = await shareLinkRef(token).get();
  if (!snap.exists) {
    const error = new Error("Share link not found");
    error.statusCode = 404;
    throw error;
  }

  const data = snap.data();
  if (!data.redeemed && !(data.viewCount > 0)) {
    const error = new Error("Share link has not been opened yet");
    error.statusCode = 403;
    throw error;
  }

  if (data.revoked) {
    const error = new Error("This link has been revoked");
    error.statusCode = 410;
    throw error;
  }

  if (data.passwordHash && !verifyUnlockToken(token, unlockToken)) {
    const error = new Error("Password required");
    error.statusCode = 401;
    throw error;
  }

  const stream = await getObjectStream(data.s3Key, { range });

  return {
    ...stream,
    filename: data.filename,
    allowDownload: data.allowDownload !== false,
  };
}

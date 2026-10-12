import { randomBytes } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import {
  buildObjectKey,
  createPresignedUploadUrl,
  deleteObject,
  getObjectSize,
} from "./s3";
import { getUserStorageUsageBytes } from "./userStorage";
import {
  createSignedToken,
  hashPassword,
  verifyPassword,
  verifySignedToken,
} from "./shareLinks";
import { canAddToUserStorage, isFileWithinUploadLimit } from "../uploadLimits";

const COLLECTION = "fileRequests";
const MAX_FILES_CAP = 100;
const MAX_FAILED_UNLOCKS = 5;
const UNLOCK_LOCKOUT_MS = 15 * 60 * 1000;
const BLOCKED_EXTENSIONS = new Set([
  "html", "htm", "xhtml", "js", "mjs", "exe", "msi", "bat", "cmd", "com",
  "scr", "sh", "ps1", "jar", "apk", "app", "dmg", "vbs", "php",
]);

function requestRef(token) {
  return getAdminFirestore().collection(COLLECTION).doc(token);
}

function httpError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

function assertValidToken(token) {
  if (!token || typeof token !== "string" || token.length < 16) {
    throw httpError("Invalid file request link", 400);
  }
}

function toMillis(value) {
  return value?.toMillis?.() ?? null;
}

function cleanText(value, max) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function cleanFilename(value) {
  const name = cleanText(value, 200).replace(/[\\/]/g, "_");
  return name && name !== "." && name !== ".." ? name : "";
}

function extensionOf(filename) {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function requestUnavailableReason(data) {
  if (!data) return { statusCode: 404, message: "This file request link doesn't exist" };
  const expiresAt = toMillis(data.expiresAt);
  if (expiresAt && Date.now() > expiresAt) {
    return { statusCode: 410, message: "This file request has expired" };
  }
  if ((data.uploadCount || 0) >= (data.maxFiles || MAX_FILES_CAP)) {
    return { statusCode: 410, message: "This file request has received all the files it can accept" };
  }
  return null;
}

async function assertFolderStillExists(data) {
  if (!data.folderId) return;
  const snap = await getAdminFirestore().collection("myfiles").doc(data.folderId).get();
  if (!snap.exists || snap.data().userId !== data.userId) {
    throw httpError("This file request is no longer accepting files", 410);
  }
}

function unlockSubject(token) {
  return `request:${token}`;
}

function assertUnlocked(token, data, unlockToken) {
  if (!data.passwordHash) return;
  if (!verifySignedToken("request-unlock", unlockSubject(token), unlockToken)) {
    throw httpError("Password required", 401, "PASSWORD_REQUIRED");
  }
}

function uploadSubject(token, s3Key, fileSize) {
  return `${token}|${s3Key}|${fileSize}`;
}

export async function createFileRequest({
  userId,
  ownerName,
  folderId,
  title,
  expiresInHours,
  password,
  maxFiles,
  origin,
}) {
  const db = getAdminFirestore();
  const cleanTitle = cleanText(title, 120);
  if (!cleanTitle) throw httpError("Give your request a title", 400);

  let folderName = "My Drive";
  if (folderId) {
    const folder = await db.collection("myfiles").doc(folderId).get();
    if (!folder.exists || folder.data().userId !== userId || folder.data().type !== "folder") {
      throw httpError("Folder not found", 404);
    }
    folderName = folder.data().filename || "Folder";
  }

  const doc = {
    userId,
    ownerName: cleanText(ownerName, 60) || "Someone",
    folderId: folderId || null,
    folderName,
    title: cleanTitle,
    uploadCount: 0,
    createdAt: FieldValue.serverTimestamp(),
  };

  if (maxFiles != null && maxFiles !== "") {
    const n = Math.floor(Number(maxFiles));
    if (!Number.isFinite(n) || n < 1 || n > MAX_FILES_CAP) {
      throw httpError(`Max files must be between 1 and ${MAX_FILES_CAP}`, 400);
    }
    doc.maxFiles = n;
  }

  if (expiresInHours != null && expiresInHours !== "") {
    const hours = Number(expiresInHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      throw httpError("expiresInHours must be positive", 400);
    }
    doc.expiresAt = Timestamp.fromMillis(Date.now() + hours * 3600 * 1000);
  }

  if (password) {
    if (typeof password !== "string" || password.length < 4) {
      throw httpError("Password must be at least 4 characters", 400);
    }
    doc.passwordHash = hashPassword(password);
  }

  const token = randomBytes(24).toString("hex");
  await requestRef(token).set(doc);

  return {
    token,
    url: `${origin?.replace(/\/$/, "") || ""}/request/${token}`,
  };
}

export async function listFileRequestsForUser(userId) {
  const snap = await getAdminFirestore()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        token: d.id,
        title: data.title,
        folderId: data.folderId,
        folderName: data.folderName,
        uploadCount: data.uploadCount || 0,
        maxFiles: data.maxFiles ?? null,
        hasPassword: Boolean(data.passwordHash),
        createdAt: toMillis(data.createdAt),
        expiresAt: toMillis(data.expiresAt),
        lastUploadAt: toMillis(data.lastUploadAt),
        available: !requestUnavailableReason(data),
      };
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function deleteFileRequest({ token, userId }) {
  assertValidToken(token);
  const ref = requestRef(token);
  const snap = await ref.get();
  if (!snap.exists) throw httpError("File request not found", 404);
  if (snap.data().userId !== userId) throw httpError("Forbidden", 403);
  await ref.delete();
  return { ok: true };
}

export async function getFileRequestRecord(token) {
  assertValidToken(token);
  const snap = await requestRef(token).get();
  return snap.exists ? snap.data() : null;
}

export function getFileRequestPublicMeta(data) {
  const unavailable = requestUnavailableReason(data);
  return {
    title: data?.title || "",
    ownerName: data?.ownerName || "Someone",
    requiresPassword: Boolean(data?.passwordHash),
    remaining: data
      ? Math.max(0, (data.maxFiles || MAX_FILES_CAP) - (data.uploadCount || 0))
      : 0,
    unavailable: unavailable
      ? { status: unavailable.statusCode === 404 ? "missing" : "closed", message: unavailable.message }
      : null,
  };
}

export async function unlockFileRequest(token, password) {
  assertValidToken(token);
  const ref = requestRef(token);
  let failure = null;

  await getAdminFirestore().runTransaction(async (tx) => {
    failure = null;
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    const unavailable = requestUnavailableReason(data);
    if (unavailable) throw httpError(unavailable.message, unavailable.statusCode);
    if (!data.passwordHash) return;

    const now = Date.now();
    const lockedUntil = toMillis(data.unlockLockedUntil);
    if (lockedUntil && now < lockedUntil) {
      throw httpError("Too many attempts. Try again later.", 429);
    }

    if (verifyPassword(password, data.passwordHash)) {
      if (data.failedUnlocks) {
        tx.update(ref, { failedUnlocks: 0, unlockLockedUntil: FieldValue.delete() });
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

  if (failure) throw httpError(failure.message, failure.statusCode);
  return { unlockToken: createSignedToken("request-unlock", unlockSubject(token)) };
}

export async function createFileRequestUpload(token, { filename, contentType, fileSize, unlockToken }) {
  assertValidToken(token);
  const data = await getFileRequestRecord(token);
  const unavailable = requestUnavailableReason(data);
  if (unavailable) throw httpError(unavailable.message, unavailable.statusCode);
  assertUnlocked(token, data, unlockToken);

  const name = cleanFilename(filename);
  if (!name) throw httpError("Invalid file name", 400);
  if (BLOCKED_EXTENSIONS.has(extensionOf(name))) {
    throw httpError("This file type isn't allowed", 415);
  }
  if (!Number.isInteger(fileSize) || fileSize <= 0) {
    throw httpError("Invalid file size", 400);
  }
  if (!isFileWithinUploadLimit(fileSize)) {
    throw httpError("File exceeds the 5 MB upload limit.", 413);
  }

  await assertFolderStillExists(data);

  const usage = await getUserStorageUsageBytes(data.userId);
  if (!canAddToUserStorage(usage, fileSize)) {
    throw httpError("The recipient's storage is full, so this file can't be sent.", 413);
  }

  const type =
    typeof contentType === "string" && contentType && contentType.length <= 120
      ? contentType
      : "application/octet-stream";
  const s3Key = buildObjectKey(data.userId, name);
  const uploadUrl = await createPresignedUploadUrl(s3Key, type, fileSize);

  return {
    uploadUrl,
    s3Key,
    contentType: type,
    ticket: createSignedToken("request-upload", uploadSubject(token, s3Key, fileSize)),
  };
}

export async function completeFileRequestUpload(
  token,
  { s3Key, ticket, filename, contentType, fileSize, uploaderName },
) {
  assertValidToken(token);
  if (!verifySignedToken("request-upload", uploadSubject(token, s3Key, fileSize), ticket)) {
    throw httpError("Upload session expired. Please try again.", 403);
  }

  const actualSize = await getObjectSize(s3Key);
  if (actualSize == null || actualSize !== fileSize) {
    throw httpError("Upload didn't finish. Please try again.", 400);
  }

  const db = getAdminFirestore();
  const ref = requestRef(token);
  const name = cleanFilename(filename) || "Untitled";
  const from = cleanText(uploaderName, 40) || "Anonymous";
  let rejected = null;

  try {
    await db.runTransaction(async (tx) => {
      rejected = null;
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const unavailable = requestUnavailableReason(data);
      if (unavailable) {
        rejected = httpError(unavailable.message, unavailable.statusCode);
        return;
      }
      if (!s3Key.startsWith(`files/${data.userId}/`)) {
        rejected = httpError("Forbidden", 403);
        return;
      }

      tx.update(ref, {
        uploadCount: FieldValue.increment(1),
        lastUploadAt: FieldValue.serverTimestamp(),
      });
      tx.create(db.collection("myfiles").doc(), {
        userId: data.userId,
        timestamp: FieldValue.serverTimestamp(),
        filename: name,
        s3Key,
        size: fileSize,
        contentType:
          typeof contentType === "string" && contentType ? contentType : "application/octet-stream",
        starred: false,
        type: "file",
        parentId: data.folderId || null,
        versionsBytes: 0,
        uploadedBy: from,
        fileRequestId: token,
      });
    });
  } catch (error) {
    rejected = error;
  }

  if (rejected) {
    await deleteObject(s3Key).catch(() => {});
    throw rejected;
  }

  return { ok: true, filename: name };
}

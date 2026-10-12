import { createHash } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import { assertUserOwnsKey } from "./s3";

const COLLECTION = "timeCapsules";
const MIN_SEAL_MS = 5 * 60 * 1000;
const MAX_SEAL_MS = 10 * 365 * 24 * 60 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 280;

/** Keyed by S3 object so the seal holds even if client-written file docs are copied or edited. */
function capsuleRef(s3Key) {
  const id = createHash("sha256").update(s3Key).digest("hex");
  return getAdminFirestore().collection(COLLECTION).doc(id);
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function formatUnlockDate(ms) {
  return new Date(ms).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";
}

/** Active capsule for the object, or null if it is not sealed (or already open). */
async function getActiveCapsule(s3Key) {
  if (!s3Key) return null;
  const snap = await capsuleRef(s3Key).get();
  if (!snap.exists) return null;
  const data = snap.data();
  const unlockAt = data.unlockAt?.toMillis?.() ?? null;
  if (!unlockAt || unlockAt <= Date.now()) return null;
  return { unlockAt, ownerAccess: data.ownerAccess === true };
}

/** Millis the object unlocks at for share-link recipients, or null if it is open. */
export async function getCapsuleUnlockAt(s3Key) {
  const capsule = await getActiveCapsule(s3Key);
  return capsule?.unlockAt ?? null;
}

/** `owner: true` lets the owner through when the capsule was sealed with owner access. */
export async function assertNotSealed(s3Key, { owner = false } = {}) {
  const capsule = await getActiveCapsule(s3Key);
  if (!capsule || (owner && capsule.ownerAccess)) return;
  const error = httpError(
    `This time capsule is sealed until ${formatUnlockDate(capsule.unlockAt)}`,
    423,
  );
  error.code = "SEALED";
  error.unlockAt = capsule.unlockAt;
  throw error;
}

export async function sealFile({ fileId, userId, unlockAt, message, ownerAccess }) {
  const unlockMs = Number(unlockAt);
  const now = Date.now();
  if (!Number.isFinite(unlockMs) || unlockMs < now + MIN_SEAL_MS) {
    throw httpError("Pick a time at least 5 minutes from now", 400);
  }
  if (unlockMs > now + MAX_SEAL_MS) {
    throw httpError("Time capsules can be sealed for up to 10 years", 400);
  }

  const note = typeof message === "string" ? message.trim() : "";
  if (note.length > MAX_MESSAGE_LENGTH) {
    throw httpError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`, 400);
  }

  const db = getAdminFirestore();
  const fileRef = db.collection("myfiles").doc(fileId);
  const fileSnap = await fileRef.get();
  if (!fileSnap.exists) throw httpError("File not found", 404);

  const file = fileSnap.data();
  if (file.userId !== userId) throw httpError("Forbidden", 403);
  if (file.type === "folder" || !file.s3Key) {
    throw httpError("Only files can be sealed", 400);
  }
  assertUserOwnsKey(userId, file.s3Key);

  if (await getCapsuleUnlockAt(file.s3Key)) {
    throw httpError("This file is already sealed", 409);
  }

  const unlockTs = Timestamp.fromMillis(unlockMs);
  const allowOwner = ownerAccess === true;
  const batch = db.batch();
  batch.set(capsuleRef(file.s3Key), {
    userId,
    fileId,
    s3Key: file.s3Key,
    unlockAt: unlockTs,
    ownerAccess: allowOwner,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.update(fileRef, {
    unlockAt: unlockTs,
    capsuleOwnerAccess: allowOwner,
    sealedAt: FieldValue.serverTimestamp(),
    capsuleMessage: note || FieldValue.delete(),
  });
  await batch.commit();

  return { unlockAt: unlockMs, ownerAccess: allowOwner };
}

export async function deleteCapsuleForKey(s3Key) {
  if (!s3Key) return;
  await capsuleRef(s3Key).delete();
}

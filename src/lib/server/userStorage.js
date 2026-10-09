import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "./firebaseAdmin";
import { getUserObjectsBytes } from "./s3";

async function sumCollectionBytes(collectionName, userId) {
  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection(collectionName)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data();
    return total + (data.size || 0) + (data.versionsBytes || 0);
  }, 0);
}

async function getFirestoreUsageBytes(userId) {
  const [myFilesBytes, trashBytes] = await Promise.all([
    sumCollectionBytes("myfiles", userId),
    sumCollectionBytes("trash", userId),
  ]);

  return myFilesBytes + trashBytes;
}

/**
 * S3 is the source of truth: Firestore sizes are client-written and skip
 * objects uploaded without a metadata doc.
 */
export async function getUserStorageUsageBytes(userId) {
  try {
    return await getUserObjectsBytes(userId);
  } catch (error) {
    if (error?.name !== "AccessDenied" && error?.$metadata?.httpStatusCode !== 403) {
      throw error;
    }
    console.warn(
      "S3 ListBucket denied; falling back to Firestore sizes for quota. Grant s3:ListBucket to enforce quota from S3."
    );
    return getFirestoreUsageBytes(userId);
  }
}

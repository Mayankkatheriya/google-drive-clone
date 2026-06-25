import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "./firebaseAdmin";

async function sumCollectionBytes(collectionName, userId) {
  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection(collectionName)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.reduce(
    (total, doc) => total + (doc.data().size || 0),
    0
  );
}

export async function getUserStorageUsageBytes(userId) {
  const [myFilesBytes, trashBytes] = await Promise.all([
    sumCollectionBytes("myfiles", userId),
    sumCollectionBytes("trash", userId),
  ]);

  return myFilesBytes + trashBytes;
}

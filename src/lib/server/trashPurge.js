import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "./firebaseAdmin";
import { assertUserOwnsKey, deleteObject } from "./s3";
import { isTrashExpired } from "../trashRetention";

async function deleteTrashDoc(docSnap) {
  const data = docSnap.data();

  if (data.s3Key) {
    assertUserOwnsKey(data.userId, data.s3Key);
    await deleteObject(data.s3Key);
  }

  await docSnap.ref.delete();
}

export async function purgeExpiredTrashForUser(userId) {
  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db
    .collection("trash")
    .where("userId", "==", userId)
    .get();

  const now = Date.now();
  let deletedCount = 0;

  for (const docSnap of snapshot.docs) {
    if (!isTrashExpired(docSnap.data(), now)) {
      continue;
    }

    await deleteTrashDoc(docSnap);
    deletedCount += 1;
  }

  return deletedCount;
}

export async function purgeAllExpiredTrash() {
  const db = getFirestore(getFirebaseAdminApp());
  const snapshot = await db.collection("trash").get();
  const now = Date.now();
  let deletedCount = 0;

  for (const docSnap of snapshot.docs) {
    if (!isTrashExpired(docSnap.data(), now)) {
      continue;
    }

    await deleteTrashDoc(docSnap);
    deletedCount += 1;
  }

  return deletedCount;
}

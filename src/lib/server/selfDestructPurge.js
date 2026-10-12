import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import { isSelfDestructExpired } from "../selfDestruct";

async function moveExpiredFileToTrash(db, fileRef) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(fileRef);
    // The owner's browser may have trashed it or cleared the timer since the query ran.
    if (!snap.exists || !isSelfDestructExpired(snap.data())) return false;

    const { selfDestructAt, ...rest } = snap.data();
    tx.create(db.collection("trash").doc(), {
      ...rest,
      trashedAt: FieldValue.serverTimestamp(),
    });
    tx.delete(fileRef);
    return true;
  });
}

export async function purgeAllSelfDestructedFiles() {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("myfiles")
    .where("selfDestructAt", "<=", Timestamp.now())
    .get();

  let movedCount = 0;
  for (const docSnap of snapshot.docs) {
    if (await moveExpiredFileToTrash(db, docSnap.ref)) {
      movedCount += 1;
    }
  }

  return movedCount;
}

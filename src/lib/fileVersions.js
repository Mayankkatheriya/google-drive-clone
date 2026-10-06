import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { deleteFileFromS3 } from "@/lib/fileAccess";

export const MAX_FILE_VERSIONS = 5;

export async function listFileVersions(fileId) {
  const snap = await getDocs(
    query(
      collection(db, "myfiles", fileId, "versions"),
      orderBy("createdAt", "desc"),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

async function archiveCurrentAsVersion(fileId, fileData) {
  if (!fileData?.s3Key) return null;

  const versions = await listFileVersions(fileId);
  let versionsBytes = fileData.versionsBytes || 0;

  while (versions.length >= MAX_FILE_VERSIONS) {
    const oldest = versions[versions.length - 1];
    versionsBytes = Math.max(0, versionsBytes - (oldest.data?.size || 0));
    if (oldest.data?.s3Key) {
      try {
        await deleteFileFromS3(oldest.data.s3Key);
      } catch {
        /* continue */
      }
    }
    await deleteDoc(doc(db, "myfiles", fileId, "versions", oldest.id));
    versions.pop();
  }

  const ref = await addDoc(collection(db, "myfiles", fileId, "versions"), {
    s3Key: fileData.s3Key,
    size: fileData.size || 0,
    contentType: fileData.contentType || "application/octet-stream",
    filename: fileData.filename,
    createdAt: serverTimestamp(),
  });

  versionsBytes += fileData.size || 0;
  await updateDoc(doc(db, "myfiles", fileId), { versionsBytes });

  return ref.id;
}

export async function applyNewFileVersion(fileId, fileData, next) {
  await archiveCurrentAsVersion(fileId, fileData);

  await updateDoc(doc(db, "myfiles", fileId), {
    s3Key: next.s3Key,
    size: next.size,
    contentType: next.contentType,
    filename: next.filename || fileData.filename,
    timestamp: serverTimestamp(),
  });
}

export async function restoreFileVersion(fileId, fileData, version) {
  if (!version?.data?.s3Key) return false;

  await archiveCurrentAsVersion(fileId, fileData);

  const v = version.data;
  const versionsBytes = Math.max(
    0,
    (fileData.versionsBytes || 0) + (fileData.size || 0) - (v.size || 0),
  );

  await updateDoc(doc(db, "myfiles", fileId), {
    s3Key: v.s3Key,
    size: v.size || 0,
    contentType: v.contentType || fileData.contentType,
    filename: v.filename || fileData.filename,
    versionsBytes,
    timestamp: serverTimestamp(),
  });

  await deleteDoc(doc(db, "myfiles", fileId, "versions", version.id));
  return true;
}

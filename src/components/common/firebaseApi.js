import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { deleteFileFromS3 } from "../../lib/fileAccess";
import { resolveDisplayFilename } from "../../lib/fileNames";
import { filesSnapshotEqual } from "../../lib/filesSnapshotEqual";

const applySnapshot = (setFiles, buildNext) => {
  setFiles((prev) => {
    const next = buildNext();
    return filesSnapshotEqual(prev, next) ? prev : next;
  });
};

const getTrashFiles = (userId, setFiles) => {
  const filesData = collection(db, "trash");
  const unsubscribeFiles = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      applySnapshot(setFiles, () =>
        snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
          .sort((a, b) => {
            const aSec =
              a.data.trashedAt?.seconds ?? a.data.timestamp?.seconds ?? 0;
            const bSec =
              b.data.trashedAt?.seconds ?? b.data.timestamp?.seconds ?? 0;
            return bSec - aSec;
          })
      );
    }
  );

  return unsubscribeFiles;
};

const permanentDeleteFromTrash = async (id, fileData) => {
  try {
    if (fileData?.s3Key) {
      await deleteFileFromS3(fileData.s3Key);
    }

    const docRef = doc(db, "trash", id);

    await deleteDoc(docRef);
    toast.error("Permanently Deleted");
  } catch (error) {
    console.error("Error deleting document: ", error);
    toast.error("Failed to delete file");
  }
};

const handleRestoreFromTrash = async (id, fileData) => {
  try {
    await addDoc(collection(db, "myfiles"), { ...fileData });
    await deleteDoc(doc(db, "trash", id));
    toast.success("File restored to My Drive");
  } catch (error) {
    console.error("Error restoring file: ", error);
    toast.error("Failed to restore file");
  }
};

const moveToTrash = async (id, fileData, { silent = false } = {}) => {
  try {
    const { selfDestructAt, ...rest } = fileData || {};
    await addDoc(collection(db, "trash"), {
      ...rest,
      trashedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, "myfiles", id));
    if (!silent) toast.warn("File moved to trash");
    return true;
  } catch (error) {
    console.error("Error moving file to trash: ", error);
    if (!silent) toast.error("Failed to move file to trash");
    return false;
  }
};

const setSelfDestruct = async (id, expiresAtMs) => {
  try {
    await updateDoc(doc(db, "myfiles", id), {
      selfDestructAt: Timestamp.fromMillis(expiresAtMs),
    });
    toast.success("Self-destruct timer set");
    return true;
  } catch (error) {
    console.error("Error setting self-destruct timer: ", error);
    toast.error("Failed to set self-destruct timer");
    return false;
  }
};

const clearSelfDestruct = async (id) => {
  try {
    await updateDoc(doc(db, "myfiles", id), {
      selfDestructAt: deleteField(),
    });
    toast.success("Self-destruct timer removed");
    return true;
  } catch (error) {
    console.error("Error removing self-destruct timer: ", error);
    toast.error("Failed to remove self-destruct timer");
    return false;
  }
};

const handleRenameFile = async (id, currentFilename, newName) => {
  const finalName = resolveDisplayFilename(newName, currentFilename);

  if (!finalName) {
    toast.error("Please enter a valid file name.");
    return false;
  }

  if (finalName === currentFilename) {
    return true;
  }

  try {
    await updateDoc(doc(db, "myfiles", id), { filename: finalName });
    toast.success("File renamed");
    return true;
  } catch (error) {
    console.error("Error renaming file: ", error);
    toast.error("Failed to rename file");
    return false;
  }
};

const OPENED_FLUSH_MS = 2500;
const pendingOpenedIds = new Set();
let openedFlushTimer = null;

const flushOpenedUpdates = () => {
  openedFlushTimer = null;
  const ids = [...pendingOpenedIds];
  pendingOpenedIds.clear();

  ids.forEach((id) => {
    updateDoc(doc(db, "myfiles", id), {
      lastOpenedAt: serverTimestamp(),
    }).catch(() => {});
  });
};

const markFileOpened = (id) => {
  if (!id) return;

  pendingOpenedIds.add(id);

  if (openedFlushTimer) {
    clearTimeout(openedFlushTimer);
  }

  openedFlushTimer = setTimeout(flushOpenedUpdates, OPENED_FLUSH_MS);
};

const getFilesForUser = (userId, setFiles) => {
  const filesData = collection(db, "myfiles");
  const unsubscribeFiles = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      applySnapshot(setFiles, () =>
        snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
          .sort(
            (a, b) =>
              (b.data.timestamp?.seconds ?? 0) -
              (a.data.timestamp?.seconds ?? 0)
          )
      );
    }
  );

  return unsubscribeFiles;
};

const handleStarred = async (id) => {
  try {
    const docRef = doc(db, "myfiles", id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const currentStarredStatus = docSnapshot.data().starred || false;
      if (currentStarredStatus) {
        toast.error("Removed from starred");
      } else {
        toast.success("Added to starred");
      }
      await updateDoc(docRef, { starred: !currentStarredStatus });
    } else {
      console.error("Document does not exist.");
    }
  } catch (error) {
    console.error("Error updating starred status: ", error);
  }
};

export {
  getFilesForUser,
  handleStarred,
  getTrashFiles,
  moveToTrash,
  permanentDeleteFromTrash,
  handleRestoreFromTrash,
  handleRenameFile,
  markFileOpened,
  setSelfDestruct,
  clearSelfDestruct,
};

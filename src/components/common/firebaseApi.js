import { db, auth } from "../../firebase";
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
import {
  getDescendantIds,
  isFolder,
  resolveFolderName,
  canMoveToFolder,
} from "../../lib/folders";

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
    if (!silent) {
      toast.warn(
        isFolder({ data: fileData }) ? "Folder moved to trash" : "File moved to trash",
      );
    }
    return true;
  } catch (error) {
    console.error("Error moving file to trash: ", error);
    if (!silent) toast.error("Failed to move file to trash");
    return false;
  }
};

/** Cascade: folder + all descendants → trash. `allFiles` is full myfiles list. */
const moveFolderToTrash = async (id, fileData, allFiles = [], { silent = false } = {}) => {
  try {
    const descendantIds = getDescendantIds(allFiles, id);
    const ids = [id, ...descendantIds];
    const byId = new Map(allFiles.map((f) => [f.id, f]));

    for (const itemId of ids) {
      const item = byId.get(itemId);
      const data = itemId === id ? fileData : item?.data;
      if (!data) continue;
      const { selfDestructAt, ...rest } = data;
      await addDoc(collection(db, "trash"), {
        ...rest,
        trashedAt: serverTimestamp(),
      });
      await deleteDoc(doc(db, "myfiles", itemId));
    }

    if (!silent) {
      const extra = descendantIds.length;
      toast.warn(
        extra > 0
          ? `Folder and ${extra} item${extra === 1 ? "" : "s"} moved to trash`
          : "Folder moved to trash",
      );
    }
    return true;
  } catch (error) {
    console.error("Error moving folder to trash: ", error);
    if (!silent) toast.error("Failed to move folder to trash");
    return false;
  }
};

const createFolder = async (name, parentId = null) => {
  const folderName = resolveFolderName(name);
  if (!folderName) {
    toast.error("Please enter a valid folder name.");
    return null;
  }

  const user = auth.currentUser;
  if (!user) {
    toast.error("Not signed in");
    return null;
  }

  try {
    const ref = await addDoc(collection(db, "myfiles"), {
      userId: user.uid,
      timestamp: serverTimestamp(),
      filename: folderName,
      type: "folder",
      parentId: parentId || null,
      starred: false,
    });
    toast.success("Folder created");
    return ref.id;
  } catch (error) {
    console.error("Error creating folder: ", error);
    toast.error("Failed to create folder");
    return null;
  }
};

const handleRenameFolder = async (id, currentName, newName) => {
  const folderName = resolveFolderName(newName);
  if (!folderName) {
    toast.error("Please enter a valid folder name.");
    return false;
  }
  if (folderName === currentName) return true;

  try {
    await updateDoc(doc(db, "myfiles", id), { filename: folderName });
    toast.success("Folder renamed");
    return true;
  } catch (error) {
    console.error("Error renaming folder: ", error);
    toast.error("Failed to rename folder");
    return false;
  }
};

const moveItemsToFolder = async (itemIds, targetFolderId, allFiles = []) => {
  const check = canMoveToFolder(allFiles, itemIds, targetFolderId);
  if (!check.ok) {
    toast.error(check.reason);
    return false;
  }

  try {
    const parentId = targetFolderId || null;
    await Promise.all(
      itemIds.map((id) => updateDoc(doc(db, "myfiles", id), { parentId })),
    );
    const n = itemIds.length;
    toast.success(
      n === 1 ? "Moved successfully" : `${n} items moved`,
    );
    return true;
  } catch (error) {
    console.error("Error moving items: ", error);
    toast.error("Failed to move items");
    return false;
  }
};

const batchStarFiles = async (ids, starred) => {
  try {
    await Promise.all(
      ids.map((id) => updateDoc(doc(db, "myfiles", id), { starred: Boolean(starred) })),
    );
    toast.success(starred ? "Added to starred" : "Removed from starred");
    return true;
  } catch (error) {
    console.error("Error updating starred status: ", error);
    toast.error("Failed to update starred");
    return false;
  }
};

const batchMoveToTrash = async (items, allFiles = []) => {
  let ok = 0;
  for (const item of items) {
    if (isFolder(item)) {
      const success = await moveFolderToTrash(item.id, item.data, allFiles, {
        silent: true,
      });
      if (success) ok += 1;
    } else {
      const success = await moveToTrash(item.id, item.data, { silent: true });
      if (success) ok += 1;
    }
  }
  if (ok > 0) {
    toast.warn(
      ok === 1 ? "Item moved to trash" : `${ok} items moved to trash`,
    );
  }
  return ok;
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

const handleRenameFile = async (id, currentFilename, newName, { folder = false } = {}) => {
  if (folder) {
    return handleRenameFolder(id, currentFilename, newName);
  }

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
  moveFolderToTrash,
  permanentDeleteFromTrash,
  handleRestoreFromTrash,
  handleRenameFile,
  createFolder,
  moveItemsToFolder,
  batchStarFiles,
  batchMoveToTrash,
  markFileOpened,
  setSelfDestruct,
  clearSelfDestruct,
};

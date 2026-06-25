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
} from "firebase/firestore";
import { toast } from "react-toastify";
import { deleteFileFromS3 } from "../../lib/fileAccess";
import { resolveDisplayFilename } from "../../lib/fileNames";

let trashRef = collection(db, "trash");

export const postTrashCollection = (object) => {
  addDoc(trashRef, object)
    .then(() => {})
    .catch((err) => {
      console.error(err);
    });
};

const getTrashFiles = (userId, setFiles) => {
  const filesData = collection(db, "trash");
  const unsubscribeFiles = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      setFiles(() => {
        const fileArr = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
          .sort(
            (a, b) => b.data.timestamp?.seconds - a.data.timestamp?.seconds
          );
        return fileArr;
      });
    }
  );

  return unsubscribeFiles;
};

const handleDeleteFromTrash = async (id, fileData) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (confirmed) {
      if (fileData?.s3Key) {
        await deleteFileFromS3(fileData.s3Key);
      }

      const docRef = doc(db, "trash", id);

      await deleteDoc(docRef);
      toast.error("Permanently Deleted");
    }
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

const handleMoveToTrash = async (id, fileData) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to move this file to trash?"
    );

    if (!confirmed) return;

    await postTrashCollection(fileData);
    await deleteDoc(doc(db, "myfiles", id));
    toast.warn("File moved to trash");
  } catch (error) {
    console.error("Error moving file to trash: ", error);
    toast.error("Failed to move file to trash");
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

const markFileOpened = (id) => {
  updateDoc(doc(db, "myfiles", id), {
    lastOpenedAt: serverTimestamp(),
  }).catch(() => {});
};

const getFilesForUser = (userId, setFiles) => {
  const filesData = collection(db, "myfiles");
  const unsubscribeFiles = onSnapshot(
    query(filesData, where("userId", "==", userId)),
    (snapshot) => {
      setFiles(() => {
        const fileArr = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
          .sort(
            (a, b) => b.data.timestamp?.seconds - a.data.timestamp?.seconds
          );
        return fileArr;
      });
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
  handleDeleteFromTrash,
  handleRestoreFromTrash,
  handleMoveToTrash,
  handleRenameFile,
  markFileOpened,
};

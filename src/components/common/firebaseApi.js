// firebaseApi.js

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
} from "firebase/firestore";
import { toast } from "react-toastify";

// Collection reference for the 'trash' collection
let trashRef = collection(db, "trash");

/**
 * Adds a document to the 'trash' collection
 * @param {Object} object - File data to be added to the 'trash' collection
 */
export const postTrashCollection = (object) => {
  addDoc(trashRef, object)
    .then(() => {})
    .catch((err) => {
      console.error(err);
    });
};

/**
 * Retrieves the files from the 'trash' collection for a specific user
 * @param {string} userId - User ID
 * @param {function} setFiles - State setter function for files
 * @returns {function} - Unsubscribe function to clean up the subscription
 */
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
  // Cleanup the files subscription when the component unmounts
  return unsubscribeFiles;
};

/**
 * Handles the permanent deletion of a file from the 'trash' collection
 * @param {string} id - Document ID of the file
 */
const handleDeleteFromTrash = async (id) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?"
    );

    if (confirmed) {
      // Reference to the document in Firestore
      const docRef = doc(db, "trash", id);

      // Delete the document
      await deleteDoc(docRef);
      toast.error("Permanently Deleted");
    }
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
};

/**
 * Retrieves the files from the 'myfiles' collection for a specific user
 * @param {string} userId - User ID
 * @param {function} setFiles - State setter function for files
 * @returns {function} - Unsubscribe function to clean up the subscription
 */
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
  // Cleanup the files subscription when the component unmounts
  return unsubscribeFiles;
};

/**
 * Handles toggling the 'starred' status of a file in the 'myfiles' collection
 * @param {string} id - Document ID of the file
 */
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

export { getFilesForUser, handleStarred, getTrashFiles, handleDeleteFromTrash };

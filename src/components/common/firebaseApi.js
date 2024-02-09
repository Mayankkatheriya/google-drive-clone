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
import { toast } from  "react-toastify";

let trashRef = collection(db, "trash");

export const postTrashCollection = (object) => {
  addDoc(trashRef, object)
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
};

const getTrashFiles = (userId, setFiles,) => {
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
      toast.error("Permanently Deleted")
    }
  } catch (error) {
    console.error("Error deleting document: ", error);
  } etOptionsVisible(id);
};

const getFilesForUser = (userId, setFiles,) => {
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

const handleStarred = async (id) => {
  try {
    const docRef = doc(db, "myfiles", id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const currentStarredStatus = docSnapshot.data().starred || false;
      if(currentStarredStatus){
        toast.error("Removed from starred");
      }
      else {
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

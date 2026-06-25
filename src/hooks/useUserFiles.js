"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { getFilesForUser, getTrashFiles } from "@/components/common/firebaseApi";

export function useUserFiles(collection) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    let unsubscribeFiles;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeFiles) {
        unsubscribeFiles();
        unsubscribeFiles = undefined;
      }

      if (user) {
        unsubscribeFiles =
          collection === "trash"
            ? getTrashFiles(user.uid, setFiles)
            : getFilesForUser(user.uid, setFiles);
      } else {
        setFiles([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFiles) {
        unsubscribeFiles();
      }
    };
  }, [collection]);

  return files;
}

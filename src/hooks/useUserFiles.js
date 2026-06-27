"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { getFilesForUser, getTrashFiles } from "@/components/common/firebaseApi";

export function useUserFiles(collection) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFiles;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeFiles) {
        unsubscribeFiles();
        unsubscribeFiles = undefined;
      }

      if (user) {
        setLoading(true);
        const onFilesUpdate = (updater) => {
          setFiles(updater);
          setLoading(false);
        };

        unsubscribeFiles =
          collection === "trash"
            ? getTrashFiles(user.uid, onFilesUpdate)
            : getFilesForUser(user.uid, onFilesUpdate);
      } else {
        setFiles([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFiles) {
        unsubscribeFiles();
      }
    };
  }, [collection]);

  return { files, loading };
}

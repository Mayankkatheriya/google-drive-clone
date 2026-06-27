"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getFilesForUser, getTrashFiles } from "@/components/common/firebaseApi";

export function useUserFiles(collection) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.uid ?? null;

  useEffect(() => {
    let unsubscribeFiles;

    if (userId) {
      setLoading(true);

      const onFilesUpdate = (updater) => {
        setFiles(updater);
        setLoading(false);
      };

      unsubscribeFiles =
        collection === "trash"
          ? getTrashFiles(userId, onFilesUpdate)
          : getFilesForUser(userId, onFilesUpdate);
    } else {
      setFiles([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribeFiles) {
        unsubscribeFiles();
      }
    };
  }, [collection, userId]);

  return { files, loading };
}

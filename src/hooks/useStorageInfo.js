"use client";

import { useEffect, useState } from "react";
import { useMyFiles, useTrashFiles } from "@/context/FilesContext";
import { changeBytes } from "@/components/common/common";
import {
  getTotalStorageBytes,
  getUserStorageLimitLabel,
  MAX_USER_STORAGE_BYTES,
} from "@/lib/uploadLimits";

export function useStorageInfo() {
  const files = useMyFiles();
  const trashFiles = useTrashFiles();
  const [storage, setStorage] = useState("0 Bytes");
  const [size, setSize] = useState(0);
  const storageLimitLabel = getUserStorageLimitLabel();
  const storagePercent = Math.min(100, (size / MAX_USER_STORAGE_BYTES) * 100);

  useEffect(() => {
    const totalSize = getTotalStorageBytes(files, trashFiles);
    setSize(totalSize);
    setStorage(changeBytes(totalSize));
  }, [files, trashFiles]);

  return { storage, storageLimitLabel, storagePercent };
}

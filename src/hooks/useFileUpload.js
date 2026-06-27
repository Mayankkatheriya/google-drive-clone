"use client";

import { useState, useCallback, useMemo } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { uploadFileToS3 } from "../lib/awsStorage";
import { useMyFiles, useTrashFiles } from "@/context/FilesContext";
import {
  canAddToUserStorage,
  getStorageQuotaError,
  getTotalStorageBytes,
  getUploadLimitLabel,
  isFileWithinUploadLimit,
} from "../lib/uploadLimits";
import { resolveDisplayFilename } from "../lib/fileNames";

export function useFileUpload() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const myFiles = useMyFiles();
  const trashFiles = useTrashFiles();

  const currentStorageBytes = getTotalStorageBytes(myFiles, trashFiles);

  const resetFileSelection = useCallback(() => {
    setSelectedFile("");
    setFile(null);
    setFileName("");
  }, []);

  const rejectIfStorageFull = useCallback(
    (newFileBytes) => {
      if (!canAddToUserStorage(currentStorageBytes, newFileBytes)) {
        toast.error(getStorageQuotaError());
        return true;
      }
      return false;
    },
    [currentStorageBytes],
  );

  const stageFile = useCallback(
    (selected) => {
      if (!selected) return false;

      if (!isFileWithinUploadLimit(selected.size)) {
        toast.error(
          `File is too large. Maximum size is ${getUploadLimitLabel()}.`,
        );
        return false;
      }

      if (rejectIfStorageFull(selected.size)) {
        return false;
      }

      setSelectedFile(selected.name);
      setFile(selected);
      setFileName(selected.name);
      return true;
    },
    [rejectIfStorageFull],
  );

  const handleFile = useCallback(
    (e) => {
      const selected = e.target.files[0];
      if (!selected) return;

      if (!stageFile(selected)) {
        e.target.value = "";
        resetFileSelection();
      }
    },
    [stageFile, resetFileSelection],
  );

  const handleUpload = useCallback(
    async (e) => {
      e.preventDefault();

      if (!file) {
        toast.error("Please choose a file first.");
        return;
      }

      const finalName = resolveDisplayFilename(fileName, file.name);
      if (!finalName) {
        toast.error("Please enter a valid file name.");
        return;
      }

      if (!isFileWithinUploadLimit(file.size)) {
        toast.error(
          `File is too large. Maximum size is ${getUploadLimitLabel()}.`,
        );
        return;
      }

      if (rejectIfStorageFull(file.size)) {
        return;
      }

      setSelectedFile("");
      setUploading(true);
      setProgress(0);

      try {
        const { s3Key, size, contentType } = await uploadFileToS3(
          file,
          (value) => setProgress(value),
          finalName,
        );

        await addDoc(collection(db, "myfiles"), {
          userId: auth.currentUser.uid,
          timestamp: serverTimestamp(),
          filename: finalName,
          s3Key,
          size,
          contentType,
          starred: false,
        });

        toast.success("File Uploaded Successfully");
        setUploading(false);
        resetFileSelection();
        setOpen(false);
        setProgress(0);
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploading(false);
        toast.error(error.message || "Error uploading file. Please try again.");
      }
    },
    [file, fileName, rejectIfStorageFull, resetFileSelection],
  );

  return useMemo(
    () => ({
      open,
      setOpen,
      uploading,
      progress,
      selectedFile,
      fileName,
      setFileName,
      handleFile,
      stageFile,
      handleUpload,
    }),
    [
      open,
      uploading,
      progress,
      selectedFile,
      fileName,
      handleFile,
      stageFile,
      handleUpload,
    ],
  );
}

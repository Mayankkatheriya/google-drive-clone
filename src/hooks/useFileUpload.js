"use client";

import { useState } from "react";
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

  const resetFileSelection = () => {
    setSelectedFile("");
    setFile(null);
    setFileName("");
  };

  const rejectIfStorageFull = (newFileBytes) => {
    if (!canAddToUserStorage(currentStorageBytes, newFileBytes)) {
      toast.error(getStorageQuotaError());
      return true;
    }
    return false;
  };

  const resolveUploadFilename = (customName, originalFile) => {
    const trimmed = customName.trim();
    if (!trimmed) return null;
    if (/[/\\]/.test(trimmed)) return null;

    const originalExt = originalFile.name.includes(".")
      ? originalFile.name.slice(originalFile.name.lastIndexOf("."))
      : "";

    const hasExtension =
      trimmed.includes(".") && trimmed.lastIndexOf(".") > 0;

    return hasExtension ? trimmed : `${trimmed}${originalExt}`;
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!isFileWithinUploadLimit(selected.size)) {
      toast.error(`File is too large. Maximum size is ${getUploadLimitLabel()}.`);
      e.target.value = "";
      resetFileSelection();
      return;
    }

    if (rejectIfStorageFull(selected.size)) {
      e.target.value = "";
      resetFileSelection();
      return;
    }

    setSelectedFile(selected.name);
    setFile(selected);
    setFileName(selected.name);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please choose a file first.");
      return;
    }

    const finalName = resolveUploadFilename(fileName, file);
    if (!finalName) {
      toast.error("Please enter a valid file name.");
      return;
    }

    if (!isFileWithinUploadLimit(file.size)) {
      toast.error(`File is too large. Maximum size is ${getUploadLimitLabel()}.`);
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
        finalName
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
  };

  return {
    open,
    setOpen,
    uploading,
    progress,
    selectedFile,
    fileName,
    setFileName,
    handleFile,
    handleUpload,
  };
}

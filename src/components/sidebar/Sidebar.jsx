"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { db, auth } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { uploadFileToS3 } from "../../lib/awsStorage";
import { useMyFiles, useTrashFiles } from "@/context/FilesContext";
import {
  canAddToUserStorage,
  getStorageQuotaError,
  getTotalStorageBytes,
  getUploadLimitLabel,
  isFileWithinUploadLimit,
} from "../../lib/uploadLimits";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import FileUploadModal from "./FileUploadModal";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";
import { toast } from "react-toastify";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const sidebarBool = useSelector(selectSidebarBool);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const myFiles = useMyFiles();
  const trashFiles = useTrashFiles();

  const currentStorageBytes = getTotalStorageBytes(myFiles, trashFiles);

  const rejectIfStorageFull = (newFileBytes) => {
    if (!canAddToUserStorage(currentStorageBytes, newFileBytes)) {
      toast.error(getStorageQuotaError());
      return true;
    }
    return false;
  };

  const resetFileSelection = () => {
    setSelectedFile("");
    setFile(null);
    setFileName("");
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

  return (
    <>
      <FileUploadModal
        open={open}
        setOpen={setOpen}
        handleUpload={handleUpload}
        uploading={uploading}
        handleFile={handleFile}
        selectedFile={selectedFile}
        fileName={fileName}
        onFileNameChange={setFileName}
        progress={progress}
      />

      <SidebarContainer $open={sidebarBool}>
        <AddFile onClick={() => setOpen(true)} />
        <SidebarTabs />
      </SidebarContainer>
    </>
  );
};

const SidebarContainer = styled.div`
  width: 256px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 8px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  /* stretch fills full height via parent align-items: stretch */
  align-self: stretch;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: ${(props) => (props.$open ? "relative" : "absolute")};
  left: ${(props) => (props.$open ? "0" : "-256px")};
  overflow: hidden;
  z-index: 10;

  @media (max-width: 768px) {
    width: 68px;
    position: relative;
    left: 0;
  }
`;

export default Sidebar;

"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";

const FileUploadModal = dynamic(
  () => import("@/components/sidebar/FileUploadModal"),
  { ssr: false }
);

const FileUploadContext = createContext(null);

export function FileUploadProvider({ children }) {
  const upload = useFileUpload();

  return (
    <FileUploadContext.Provider value={upload}>
      {upload.open && (
        <FileUploadModal
          open={upload.open}
          setOpen={upload.setOpen}
          handleUpload={upload.handleUpload}
          uploading={upload.uploading}
          handleFile={upload.handleFile}
          stageFile={upload.stageFile}
          selectedFile={upload.selectedFile}
          fileName={upload.fileName}
          onFileNameChange={upload.setFileName}
          progress={upload.progress}
        />
      )}
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUploadContext() {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error("useFileUploadContext must be used within FileUploadProvider");
  }
  return context;
}

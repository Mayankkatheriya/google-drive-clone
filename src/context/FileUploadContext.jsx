"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useMemo } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useVoiceMemo } from "@/hooks/useVoiceMemo";

const FileUploadModal = dynamic(
  () => import("@/components/sidebar/FileUploadModal"),
  { ssr: false },
);

const VoiceMemoModal = dynamic(
  () => import("@/components/common/VoiceMemoModal"),
  { ssr: false },
);

const FileUploadContext = createContext(null);

export function FileUploadProvider({ children }) {
  const upload = useFileUpload();
  const voiceMemo = useVoiceMemo({ uploadFileDirect: upload.uploadFileDirect });

  const value = useMemo(
    () => ({
      ...upload,
      openVoiceMemo: voiceMemo.openModal,
      closeVoiceMemo: voiceMemo.close,
    }),
    [upload, voiceMemo.openModal, voiceMemo.close],
  );

  return (
    <FileUploadContext.Provider value={value}>
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
          onOpenVoiceMemo={() => {
            upload.setOpen(false);
            voiceMemo.openModal();
          }}
        />
      )}
      {voiceMemo.open && (
        <VoiceMemoModal
          open={voiceMemo.open}
          onClose={voiceMemo.close}
          status={voiceMemo.status}
          durationLabel={voiceMemo.durationLabel}
          fileName={voiceMemo.fileName}
          onFileNameChange={voiceMemo.setFileName}
          error={voiceMemo.error}
          previewUrl={voiceMemo.previewUrl}
          uploading={upload.uploading}
          progress={upload.progress}
          onStart={voiceMemo.startRecording}
          onStop={voiceMemo.stopRecording}
          onDiscard={voiceMemo.discardRecording}
          onUpload={voiceMemo.uploadRecording}
        />
      )}
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUploadContext() {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(
      "useFileUploadContext must be used within FileUploadProvider",
    );
  }
  return context;
}

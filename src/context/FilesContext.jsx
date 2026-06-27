"use client";

import { createContext, useContext } from "react";
import { useUserFiles } from "@/hooks/useUserFiles";
import { useTrashAutoPurge } from "@/hooks/useTrashAutoPurge";

const FilesStateContext = createContext({
  myFiles: [],
  myFilesLoading: true,
  trashFiles: [],
  trashLoading: true,
});

export function FilesProvider({ children }) {
  const { files: myFiles, loading: myFilesLoading } = useUserFiles("myfiles");
  const { files: trashFiles, loading: trashLoading } = useUserFiles("trash");
  useTrashAutoPurge();

  return (
    <FilesStateContext.Provider
      value={{ myFiles, myFilesLoading, trashFiles, trashLoading }}
    >
      {children}
    </FilesStateContext.Provider>
  );
}

export function useMyFiles() {
  return useContext(FilesStateContext).myFiles;
}

export function useMyFilesLoading() {
  return useContext(FilesStateContext).myFilesLoading;
}

export function useTrashFiles() {
  return useContext(FilesStateContext).trashFiles;
}

export function useTrashFilesLoading() {
  return useContext(FilesStateContext).trashLoading;
}

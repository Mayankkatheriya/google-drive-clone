"use client";

import { createContext, useContext } from "react";
import { useUserFiles } from "@/hooks/useUserFiles";
import { useTrashAutoPurge } from "@/hooks/useTrashAutoPurge";

const FilesContext = createContext([]);
const TrashFilesContext = createContext([]);

export function FilesProvider({ children }) {
  const files = useUserFiles("myfiles");
  const trashFiles = useUserFiles("trash");
  useTrashAutoPurge();

  return (
    <FilesContext.Provider value={files}>
      <TrashFilesContext.Provider value={trashFiles}>
        {children}
      </TrashFilesContext.Provider>
    </FilesContext.Provider>
  );
}

export function useMyFiles() {
  return useContext(FilesContext);
}

export function useTrashFiles() {
  return useContext(TrashFilesContext);
}

"use client";

import { createContext, useContext, useMemo } from "react";
import { useUserFiles } from "@/hooks/useUserFiles";
import { useTrashAutoPurge } from "@/hooks/useTrashAutoPurge";

const MyFilesContext = createContext({ files: [], loading: true });
const TrashFilesContext = createContext({ files: [], loading: true });

export function FilesProvider({ children }) {
  const { files: myFiles, loading: myFilesLoading } = useUserFiles("myfiles");
  const { files: trashFiles, loading: trashLoading } = useUserFiles("trash");
  useTrashAutoPurge();

  const myFilesValue = useMemo(
    () => ({ files: myFiles, loading: myFilesLoading }),
    [myFiles, myFilesLoading]
  );

  const trashFilesValue = useMemo(
    () => ({ files: trashFiles, loading: trashLoading }),
    [trashFiles, trashLoading]
  );

  return (
    <MyFilesContext.Provider value={myFilesValue}>
      <TrashFilesContext.Provider value={trashFilesValue}>
        {children}
      </TrashFilesContext.Provider>
    </MyFilesContext.Provider>
  );
}

export function useMyFiles() {
  return useContext(MyFilesContext).files;
}

export function useMyFilesLoading() {
  return useContext(MyFilesContext).loading;
}

export function useTrashFiles() {
  return useContext(TrashFilesContext).files;
}

export function useTrashFilesLoading() {
  return useContext(TrashFilesContext).loading;
}

"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";

const CurrentFolderContext = createContext({
  folderId: null,
  setFolderId: () => {},
});

export function CurrentFolderProvider({ children }) {
  const [folderId, setFolderIdState] = useState(null);

  const setFolderId = useCallback((id) => {
    setFolderIdState(id == null || id === "" ? null : id);
  }, []);

  const value = useMemo(
    () => ({ folderId, setFolderId }),
    [folderId, setFolderId],
  );

  return (
    <CurrentFolderContext.Provider value={value}>
      {children}
    </CurrentFolderContext.Provider>
  );
}

export function useCurrentFolder() {
  return useContext(CurrentFolderContext);
}

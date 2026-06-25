"use client";
import { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext({
  file: null,
  siblings: null,
  open: () => {},
  close: () => {},
});

export function FilePreviewProvider({ children }) {
  const [state, setState] = useState({ file: null, siblings: null });

  const open = useCallback((file, siblings = null) => {
    setState({ file, siblings });
  }, []);

  const close = useCallback(() => {
    setState({ file: null, siblings: null });
  }, []);

  return (
    <Ctx.Provider value={{ ...state, open, close }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFilePreview() {
  return useContext(Ctx);
}

"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";

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

  const value = useMemo(
    () => ({ file: state.file, siblings: state.siblings, open, close }),
    [state.file, state.siblings, open, close]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilePreview() {
  return useContext(Ctx);
}

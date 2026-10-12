"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { isSealed, isLockedForOwner, formatUnlockDate } from "@/lib/timeCapsule";

const Ctx = createContext({
  file: null,
  siblings: null,
  open: () => {},
  close: () => {},
});

export function FilePreviewProvider({ children }) {
  const [state, setState] = useState({ file: null, siblings: null });

  const open = useCallback((file, siblings = null) => {
    if (isLockedForOwner(file)) {
      toast.info(`Time capsule · opens ${formatUnlockDate(file)}`);
      return;
    }
    if (file?.capsuleMessage && !isSealed(file)) {
      toast.info(`Time capsule note: ${file.capsuleMessage}`, { autoClose: 8000 });
    }
    setState({
      file,
      siblings: siblings ? siblings.filter((item) => !isLockedForOwner(item)) : null,
    });
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

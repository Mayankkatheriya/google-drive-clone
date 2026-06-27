"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog(options);
    });
  }, []);

  const close = useCallback((result) => {
    setDialog(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {dialog && (
        <ConfirmDialog
          open
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          tone={dialog.tone}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmDialogContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return confirm;
}

"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { toast } from "react-toastify";
import TimeCapsuleModal from "@/components/common/TimeCapsuleModal";
import { sealTimeCapsule, formatUnlockDate } from "@/lib/timeCapsule";

const TimeCapsuleContext = createContext(null);

export function TimeCapsuleProvider({ children }) {
  const [target, setTarget] = useState(null);

  const openTimeCapsule = useCallback((id, data) => {
    setTarget({ id, data });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const handleSeal = useCallback(
    async (unlockAt, message, ownerAccess) => {
      if (!target) return false;
      try {
        await sealTimeCapsule(target.id, unlockAt, message, ownerAccess);
        toast.success(`Sealed until ${formatUnlockDate(unlockAt)}`);
        setTarget(null);
        return true;
      } catch (error) {
        toast.error(error.message || "Failed to seal file");
        return false;
      }
    },
    [target],
  );

  return (
    <TimeCapsuleContext.Provider value={openTimeCapsule}>
      {children}
      {target && (
        <TimeCapsuleModal
          fileData={target.data}
          onSeal={handleSeal}
          onClose={close}
        />
      )}
    </TimeCapsuleContext.Provider>
  );
}

export function useTimeCapsule() {
  const openTimeCapsule = useContext(TimeCapsuleContext);
  if (!openTimeCapsule) {
    throw new Error("useTimeCapsule must be used within TimeCapsuleProvider");
  }
  return openTimeCapsule;
}

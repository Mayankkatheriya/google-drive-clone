"use client";

import { createContext, useContext, useCallback, useState } from "react";
import SelfDestructModal from "@/components/common/SelfDestructModal";
import {
  setSelfDestruct,
  clearSelfDestruct,
} from "@/components/common/firebaseApi";

const SelfDestructContext = createContext(null);

export function SelfDestructProvider({ children }) {
  const [target, setTarget] = useState(null);

  const openSelfDestruct = useCallback((id, data) => {
    setTarget({ id, data });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  const handleSelect = useCallback(
    async (ms) => {
      if (!target) return;
      const id = target.id;
      setTarget(null);
      await setSelfDestruct(id, Date.now() + ms);
    },
    [target],
  );

  const handleClear = useCallback(async () => {
    if (!target) return;
    const id = target.id;
    setTarget(null);
    await clearSelfDestruct(id);
  }, [target]);

  return (
    <SelfDestructContext.Provider value={openSelfDestruct}>
      {children}
      {target && (
        <SelfDestructModal
          fileData={target.data}
          onSelect={handleSelect}
          onClear={handleClear}
          onClose={close}
        />
      )}
    </SelfDestructContext.Provider>
  );
}

export function useSelfDestruct() {
  const openSelfDestruct = useContext(SelfDestructContext);
  if (!openSelfDestruct) {
    throw new Error(
      "useSelfDestruct must be used within SelfDestructProvider",
    );
  }
  return openSelfDestruct;
}

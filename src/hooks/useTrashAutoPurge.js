"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "@/firebase";
import { purgeExpiredTrash } from "@/lib/fileAccess";

export function useTrashAutoPurge() {
  const ranForUser = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || ranForUser.current === user.uid) {
        return;
      }

      ranForUser.current = user.uid;

      try {
        const { deletedCount } = await purgeExpiredTrash();
        if (deletedCount > 0) {
          toast.info(
            deletedCount === 1
              ? "1 expired item was permanently deleted from trash"
              : `${deletedCount} expired items were permanently deleted from trash`
          );
        }
      } catch {
        // Ignore — purge will retry on next sign-in
      }
    });

    return unsubscribe;
  }, []);
}

"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthProvider";
import { purgeExpiredTrash } from "@/lib/fileAccess";

// Keeps this background cleanup off the critical path of the first page load.
const PURGE_DELAY_MS = 3000;

export function useTrashAutoPurge() {
  const { user, authReady } = useAuth();
  const ranForUser = useRef(null);
  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!authReady) return;

    if (!userId) {
      ranForUser.current = null;
      return;
    }

    if (ranForUser.current === userId) {
      return;
    }

    const timer = setTimeout(async () => {
      ranForUser.current = userId;
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
    }, PURGE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [authReady, userId]);
}

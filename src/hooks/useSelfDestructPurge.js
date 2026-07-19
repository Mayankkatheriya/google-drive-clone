"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { moveToTrash } from "@/components/common/firebaseApi";
import { isSelfDestructExpired } from "@/lib/selfDestruct";

const CHECK_INTERVAL_MS = 60 * 1000;

export function useSelfDestructPurge(files) {
  const processing = useRef(new Set());

  useEffect(() => {
    if (!files || files.length === 0) return undefined;

    let cancelled = false;

    const run = async () => {
      const now = Date.now();
      const expired = files.filter(
        (file) =>
          isSelfDestructExpired(file.data, now) &&
          !processing.current.has(file.id),
      );
      if (expired.length === 0) return;

      expired.forEach((file) => processing.current.add(file.id));

      let moved = 0;
      for (const file of expired) {
        const ok = await moveToTrash(file.id, file.data, { silent: true });
        if (ok) moved += 1;
      }

      if (!cancelled && moved > 0) {
        toast.info(
          moved === 1
            ? "1 file self-destructed and moved to Trash"
            : `${moved} files self-destructed and moved to Trash`,
        );
      }
    };

    run();
    const timer = setInterval(run, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [files]);
}

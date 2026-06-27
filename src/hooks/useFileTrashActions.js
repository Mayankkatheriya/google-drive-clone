"use client";

import { useCallback } from "react";
import { useConfirm } from "@/context/ConfirmDialogProvider";
import {
  moveToTrash,
  permanentDeleteFromTrash,
} from "@/components/common/firebaseApi";
import {
  getMoveToTrashConfirmOptions,
  getPermanentDeleteConfirmOptions,
} from "@/lib/confirmDialog";

export function useFileTrashActions() {
  const confirm = useConfirm();

  const confirmMoveToTrash = useCallback(
    async (id, fileData) => {
      const ok = await confirm(getMoveToTrashConfirmOptions(fileData?.filename));
      if (!ok) return;
      await moveToTrash(id, fileData);
    },
    [confirm]
  );

  const confirmPermanentDelete = useCallback(
    async (id, fileData) => {
      const ok = await confirm(
        getPermanentDeleteConfirmOptions(fileData?.filename)
      );
      if (!ok) return;
      await permanentDeleteFromTrash(id, fileData);
    },
    [confirm]
  );

  return { confirmMoveToTrash, confirmPermanentDelete };
}

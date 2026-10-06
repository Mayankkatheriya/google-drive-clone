"use client";

import { useCallback } from "react";
import { useConfirm } from "@/context/ConfirmDialogProvider";
import {
  moveToTrash,
  moveFolderToTrash,
  permanentDeleteFromTrash,
} from "@/components/common/firebaseApi";
import {
  getMoveToTrashConfirmOptions,
  getPermanentDeleteConfirmOptions,
} from "@/lib/confirmDialog";
import { isFolder, getDescendantIds } from "@/lib/folders";
import { useMyFiles } from "@/context/FilesContext";

export function useFileTrashActions() {
  const confirm = useConfirm();
  const allFiles = useMyFiles();

  const confirmMoveToTrash = useCallback(
    async (id, fileData) => {
      const folder = isFolder({ data: fileData });
      const childCount = folder ? getDescendantIds(allFiles, id).length : 0;
      const message = folder
        ? childCount > 0
          ? `"${fileData?.filename}" and ${childCount} item${childCount === 1 ? "" : "s"} inside will move to trash.`
          : `"${fileData?.filename}" will move to trash.`
        : undefined;
      const ok = await confirm(
        getMoveToTrashConfirmOptions(fileData?.filename, message),
      );
      if (!ok) return;
      if (folder) {
        await moveFolderToTrash(id, fileData, allFiles);
      } else {
        await moveToTrash(id, fileData);
      }
    },
    [confirm, allFiles],
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

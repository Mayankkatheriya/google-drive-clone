"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useSelection } from "@/context/SelectionContext";
import { useMyFiles } from "@/context/FilesContext";
import { useConfirm } from "@/context/ConfirmDialogProvider";
import {
  batchMoveToTrash,
  batchStarFiles,
} from "./firebaseApi";
import { downloadFileWithToast } from "@/lib/fileAccess";
import { createAndCopyShareLinkWithToast } from "@/lib/shareLink";
import { isFolder } from "@/lib/folders";
import { getMoveToTrashConfirmOptions } from "@/lib/confirmDialog";
import MoveToFolderModal from "./MoveToFolderModal";
import { toast } from "react-toastify";

export default function SelectionModeBar() {
  const { active, selected, selectedIds, exitMode, clear } = useSelection();
  const allFiles = useMyFiles();
  const confirm = useConfirm();
  const [moveOpen, setMoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const fileOnly = useMemo(
    () => selected.filter((s) => !isFolder(s)),
    [selected],
  );

  const allStarred =
    selected.length > 0 && selected.every((s) => s.data?.starred);

  if (!active) return null;

  const run = async (fn) => {
    if (busy || selected.length === 0) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Bar>
        <BarInner>
          <BarText>
            <strong>{selected.length}</strong> selected
          </BarText>
          <BarActions>
            <ActionBtn
              type="button"
              disabled={busy || selected.length === 0}
              onClick={() => setMoveOpen(true)}
              title="Move"
            >
              <DriveFileMoveOutlinedIcon />
              <span>Move</span>
            </ActionBtn>
            <ActionBtn
              type="button"
              disabled={busy || selected.length === 0}
              onClick={() =>
                run(async () => {
                  await batchStarFiles(selectedIds, !allStarred);
                  clear();
                })
              }
              title={allStarred ? "Unstar" : "Star"}
            >
              {allStarred ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}
              <span>{allStarred ? "Unstar" : "Star"}</span>
            </ActionBtn>
            <ActionBtn
              type="button"
              disabled={busy || fileOnly.length === 0}
              onClick={() =>
                run(async () => {
                  for (const item of fileOnly) {
                    try {
                      await createAndCopyShareLinkWithToast(item.id);
                    } catch {
                      /* toasted */
                    }
                  }
                })
              }
              title="Share"
            >
              <ShareOutlinedIcon />
              <span>Share</span>
            </ActionBtn>
            <ActionBtn
              type="button"
              disabled={busy || fileOnly.length === 0}
              onClick={() =>
                run(async () => {
                  for (const item of fileOnly) {
                    try {
                      await downloadFileWithToast(item.data);
                    } catch {
                      toast.error("Download failed");
                    }
                  }
                })
              }
              title="Download"
            >
              <DownloadRoundedIcon />
              <span>Download</span>
            </ActionBtn>
            <ActionBtn
              type="button"
              $danger
              disabled={busy || selected.length === 0}
              onClick={() =>
                run(async () => {
                  const ok = await confirm(
                    getMoveToTrashConfirmOptions(
                      null,
                      `${selected.length} item${selected.length === 1 ? "" : "s"} will move to trash.`,
                    ),
                  );
                  if (!ok) return;
                  await batchMoveToTrash(selected, allFiles);
                  exitMode();
                })
              }
              title="Delete"
            >
              <DeleteOutlineRoundedIcon />
              <span>Delete</span>
            </ActionBtn>
            <CancelBtn type="button" onClick={exitMode} aria-label="Exit select">
              <CloseRoundedIcon style={{ fontSize: 18 }} />
            </CancelBtn>
          </BarActions>
        </BarInner>
      </Bar>

      <MoveToFolderModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        itemIds={selectedIds}
        onMoved={() => {
          clear();
          exitMode();
        }}
      />
    </>
  );
}

const Bar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  width: min(720px, calc(100vw - 32px));

  @media (max-width: 768px) {
    bottom: calc(var(--bottom-nav-height) + 12px);
    width: calc(100vw - 24px);
  }
`;

const BarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px 10px 16px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  flex-wrap: wrap;
`;

const BarText = styled.div`
  font-size: 0.82rem;
  color: var(--text-2);

  strong {
    color: var(--primary);
  }
`;

const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: ${(p) => (p.$danger ? "var(--danger)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  svg {
    font-size: 18px;
  }

  &:hover:not(:disabled) {
    background: ${(p) => (p.$danger ? "var(--danger-bg)" : "var(--surface-2)")};
    color: ${(p) => (p.$danger ? "var(--danger)" : "var(--primary)")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    span {
      display: none;
    }
    padding: 0 8px;
  }
`;

const CancelBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

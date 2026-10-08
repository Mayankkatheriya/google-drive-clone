"use client";

import { useMemo, useState } from "react";
import styled from "styled-components";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SelectAllRoundedIcon from "@mui/icons-material/SelectAllRounded";
import DeselectRoundedIcon from "@mui/icons-material/DeselectRounded";
import { useSelection } from "@/context/SelectionContext";
import { useMyFiles } from "@/context/FilesContext";
import { useConfirm } from "@/context/ConfirmDialogProvider";
import {
  batchMoveToTrash,
  batchStarFiles,
} from "./firebaseApi";
import { downloadSelectionAsZipWithToast } from "@/lib/fileAccess";
import { collectZipEntries, isFolder } from "@/lib/folders";
import { getMoveToTrashConfirmOptions } from "@/lib/confirmDialog";
import MoveToFolderModal from "./MoveToFolderModal";
import { toast } from "react-toastify";

export default function SelectionModeBar({ items = [] }) {
  const {
    active,
    selected,
    selectedIds,
    exitMode,
    clear,
    selectAll,
    maxSelection,
  } = useSelection();
  const allFiles = useMyFiles();
  const confirm = useConfirm();
  const [moveOpen, setMoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectable = useMemo(
    () => (items || []).filter((item) => item?.id).slice(0, maxSelection),
    [items, maxSelection],
  );

  const allVisibleSelected = useMemo(() => {
    if (selectable.length === 0) return false;
    const idSet = new Set(selectedIds);
    return selectable.every((item) => idSet.has(item.id));
  }, [selectable, selectedIds]);

  const canDownload = useMemo(() => {
    if (selected.length === 0) return false;
    const entries = collectZipEntries(selected, allFiles);
    return entries.some((e) => e.data?.s3Key || e.emptyFolder);
  }, [selected, allFiles]);

  const downloadIsZip = useMemo(
    () => selected.length > 1 || selected.some((s) => isFolder(s)),
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

  const handleSelectAllToggle = () => {
    if (allVisibleSelected) {
      clear();
      return;
    }
    selectAll(selectable);
    if ((items || []).length > maxSelection) {
      toast.info(`Selected first ${maxSelection} items`);
    }
  };

  return (
    <>
      <Bar>
        <BarInner>
          <Lead>
            <BarText>
              <strong>{selected.length}</strong> selected
              <DesktopHint> · Esc to exit</DesktopHint>
            </BarText>
            <SelectAllBtn
              type="button"
              disabled={busy || selectable.length === 0}
              onClick={handleSelectAllToggle}
              title={allVisibleSelected ? "Deselect all" : "Select all"}
            >
              {allVisibleSelected ? (
                <DeselectRoundedIcon />
              ) : (
                <SelectAllRoundedIcon />
              )}
              <span>{allVisibleSelected ? "Deselect all" : "Select all"}</span>
            </SelectAllBtn>
          </Lead>
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
              disabled={busy || !canDownload}
              onClick={() =>
                run(async () => {
                  await downloadSelectionAsZipWithToast(selected, allFiles);
                })
              }
              title={downloadIsZip ? "Download zip" : "Download"}
            >
              <DownloadRoundedIcon />
              <span>{downloadIsZip ? "Zip" : "Download"}</span>
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
            <DoneBtn type="button" onClick={exitMode} aria-label="Done">
              <CloseRoundedIcon style={{ fontSize: 18 }} />
              <DoneLabel>Done</DoneLabel>
            </DoneBtn>
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
  z-index: 920;
  width: min(780px, calc(100vw - 32px));

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

  @media (max-width: 640px) {
    padding: 10px 10px 10px 12px;
    gap: 8px;
  }
`;

const Lead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
`;

const BarText = styled.div`
  font-size: 0.82rem;
  color: var(--text-2);
  white-space: nowrap;

  strong {
    color: var(--primary);
  }
`;

const DesktopHint = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const SelectAllBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;

  svg {
    font-size: 16px;
  }

  &:hover:not(:disabled) {
    border-color: var(--primary-subtle);
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Keep label on mobile — primary way to select everything */
  @media (max-width: 640px) {
    padding: 0 8px;
    span {
      display: inline;
    }
  }
`;

const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-left: auto;
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

const DoneBtn = styled.button`
  height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

const DoneLabel = styled.span`
  display: none;

  @media (max-width: 768px) {
    display: inline;
  }
`;

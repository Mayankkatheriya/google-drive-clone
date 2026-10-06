"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import {
  buildFolderTree,
  canMoveToFolder,
  getParentId,
} from "@/lib/folders";
import { moveItemsToFolder } from "./firebaseApi";
import { useMyFiles } from "@/context/FilesContext";

function pickDefaultTarget(files, itemIds, tree) {
  const firstItem = files.find((f) => itemIds.includes(f.id));
  const currentParent = firstItem ? getParentId(firstItem) : null;

  // Prefer first root folder that isn't the current location.
  for (const node of tree) {
    const check = canMoveToFolder(files, itemIds, node.id);
    if (check.ok) return node.id;
  }

  // Fall back to My Drive if items aren't already there.
  if (currentParent !== null) {
    const rootCheck = canMoveToFolder(files, itemIds, null);
    if (rootCheck.ok) return null;
  }

  return currentParent;
}

export default function MoveToFolderModal({
  open,
  onClose,
  itemIds = [],
  onMoved,
}) {
  const files = useMyFiles();
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const tree = useMemo(
    () => buildFolderTree(files, { excludeIds: itemIds }),
    [files, itemIds],
  );

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setSelectedId(pickDefaultTarget(files, itemIds, tree));
  }, [open, files, itemIds, tree]);

  const check = useMemo(
    () => canMoveToFolder(files, itemIds, selectedId),
    [files, itemIds, selectedId],
  );

  const handleMove = async () => {
    if (busy || !check.ok) return;
    setBusy(true);
    const ok = await moveItemsToFolder(itemIds, selectedId, files);
    setBusy(false);
    if (ok) {
      onMoved?.();
      onClose?.();
    }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <Box>
        <Header>
          <Title>Move to</Title>
          <CloseBtn type="button" onClick={onClose} disabled={busy} aria-label="Close">
            <CloseRoundedIcon />
          </CloseBtn>
        </Header>

        <HintInfo>
          Choose a destination folder, then click Move here.
        </HintInfo>

        <Tree>
          <FolderRow
            type="button"
            $active={selectedId === null}
            onClick={() => setSelectedId(null)}
          >
            <FolderOutlinedIcon />
            My Drive
          </FolderRow>
          <TreeNodes
            nodes={tree}
            depth={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {tree.length === 0 && (
            <EmptyTree>No other folders yet. Create one first.</EmptyTree>
          )}
        </Tree>

        {!check.ok && <Hint>{check.reason}</Hint>}

        <Actions>
          <Secondary type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Secondary>
          <Primary type="button" onClick={handleMove} disabled={busy || !check.ok}>
            {busy ? "Moving…" : "Move here"}
          </Primary>
        </Actions>
      </Box>
    </Modal>
  );
}

function TreeNodes({ nodes, depth, selectedId, onSelect }) {
  return nodes.map((node) => (
    <div key={node.id}>
      <FolderRow
        type="button"
        $active={selectedId === node.id}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => onSelect(node.id)}
      >
        <FolderOutlinedIcon />
        {node.name}
      </FolderRow>
      {node.children?.length > 0 && (
        <TreeNodes
          nodes={node.children}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </div>
  ));
}

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(440px, calc(100vw - 32px));
  max-height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 20px;
  outline: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;

  &:hover {
    background: var(--surface-2);
  }
`;

const HintInfo = styled.p`
  margin: 0 0 10px;
  font-size: 0.76rem;
  color: var(--text-3);
  line-height: 1.4;
`;

const Tree = styled.div`
  flex: 1;
  min-height: 160px;
  max-height: 320px;
  overflow: auto;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 6px;
  background: var(--surface-2);
`;

const EmptyTree = styled.p`
  padding: 16px 12px;
  font-size: 0.8rem;
  color: var(--text-3);
  text-align: center;
`;

const FolderRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.$active ? "var(--primary-light)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-1)")};
  font-size: 0.86rem;
  font-weight: 550;
  text-align: left;
  cursor: pointer;

  svg {
    font-size: 18px;
    color: var(--primary);
    flex-shrink: 0;
  }

  &:hover {
    background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-3)")};
  }
`;

const Hint = styled.p`
  margin-top: 8px;
  font-size: 0.76rem;
  color: var(--danger);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
`;

const Secondary = styled.button`
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
`;

const Primary = styled.button`
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

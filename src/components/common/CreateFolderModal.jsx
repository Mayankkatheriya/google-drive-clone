"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { createFolder } from "./firebaseApi";
import { useCurrentFolder } from "@/context/CurrentFolderContext";

export default function CreateFolderModal({ open, onClose }) {
  const { folderId } = useCurrentFolder();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setBusy(false);
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const id = await createFolder(name, folderId);
    setBusy(false);
    if (id) onClose?.();
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <Box as="form" onSubmit={handleSubmit}>
        <Header>
          <Title>New folder</Title>
          <CloseBtn type="button" onClick={onClose} disabled={busy} aria-label="Close">
            <CloseRoundedIcon />
          </CloseBtn>
        </Header>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          maxLength={120}
          disabled={busy}
        />
        <Actions>
          <Secondary type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Secondary>
          <Primary type="submit" disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create"}
          </Primary>
        </Actions>
      </Box>
    </Modal>
  );
}

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(400px, calc(100vw - 32px));
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
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

const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
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

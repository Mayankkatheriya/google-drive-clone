"use client";

import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import AddIcon from "@mui/icons-material/Add";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";

export default function NewUploadButton({
  onClick,
  onCreateFolder,
  variant = "sidebar",
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!onCreateFolder) {
    return (
      <Btn
        type="button"
        $variant={variant}
        aria-label="Upload new file"
        onClick={onClick}
      >
        <AddIcon />
        <span>New</span>
      </Btn>
    );
  }

  return (
    <Wrap ref={wrapRef}>
      <Btn
        type="button"
        $variant={variant}
        aria-label="New"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <AddIcon />
        <span>New</span>
      </Btn>
      {open && (
        <Menu>
          <MenuItem
            type="button"
            onClick={() => {
              setOpen(false);
              onClick?.();
            }}
          >
            <UploadFileOutlinedIcon />
            File upload
          </MenuItem>
          <MenuItem
            type="button"
            onClick={() => {
              setOpen(false);
              onCreateFolder?.();
            }}
          >
            <CreateNewFolderOutlinedIcon />
            New folder
          </MenuItem>
        </Menu>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  svg {
    font-size: 22px;
    color: var(--primary);
    flex-shrink: 0;
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-1);
  }

  &:hover {
    border-color: var(--primary);
    background: var(--primary-light);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }

  ${(p) =>
    p.$variant === "sidebar" &&
    css`
      padding: 11px 22px 11px 14px;

      @media (max-width: 768px) {
        padding: 12px;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        justify-content: center;

        span {
          display: none;
        }
      }
    `}

  ${(p) =>
    p.$variant === "header" &&
    css`
      padding: 8px 18px 8px 12px;
      margin-left: 4px;

      @media (max-width: 768px) {
        display: none;
      }
    `}
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 40;
  min-width: 168px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-1);
  font-size: 0.86rem;
  font-weight: 550;
  cursor: pointer;
  text-align: left;

  svg {
    font-size: 18px;
    color: var(--primary);
  }

  &:hover {
    background: var(--surface-2);
  }
`;

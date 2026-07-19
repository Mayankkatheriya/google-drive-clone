"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import AutoDeleteIcon from "@mui/icons-material/AutoDeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  SELF_DESTRUCT_PRESETS,
  hasSelfDestruct,
  getSelfDestructRemainingLabel,
} from "@/lib/selfDestruct";

export default function SelfDestructModal({
  fileData,
  onSelect,
  onClear,
  onClose,
}) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const active = hasSelfDestruct(fileData);
  const remaining = getSelfDestructRemainingLabel(fileData);

  if (typeof document === "undefined") return null;

  return createPortal(
    <Backdrop onMouseDown={onClose}>
      <Card onMouseDown={(event) => event.stopPropagation()}>
        <CloseBtn type="button" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </CloseBtn>

        <IconBadge>
          <AutoDeleteIcon />
        </IconBadge>

        <Title>Self-destruct timer</Title>
        <Sub>
          {fileData?.filename ? (
            <strong title={fileData.filename}>{fileData.filename}</strong>
          ) : (
            "This file"
          )}{" "}
          will automatically move to Trash when the timer ends.
        </Sub>

        {active && (
          <ActiveNote>Currently auto-deletes in {remaining}</ActiveNote>
        )}

        <PresetGrid>
          {SELF_DESTRUCT_PRESETS.map((preset) => (
            <PresetBtn
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.ms)}
            >
              {preset.label}
            </PresetBtn>
          ))}
        </PresetGrid>

        {active && (
          <ClearBtn type="button" onClick={onClear}>
            Remove timer
          </ClearBtn>
        )}
      </Card>
    </Backdrop>,
    document.body,
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
`;

const Card = styled.div`
  position: relative;
  width: min(360px, 100%);
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 26px 24px 22px;
  text-align: center;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--surface-2);
    color: var(--text-1);
  }

  svg {
    font-size: 20px;
  }
`;

const IconBadge = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);

  svg {
    font-size: 24px;
  }
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
`;

const Sub = styled.p`
  margin-top: 6px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-3);

  strong {
    color: var(--text-2);
    word-break: break-word;
  }
`;

const ActiveNote = styled.p`
  margin-top: 12px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--primary);
`;

const PresetGrid = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PresetBtn = styled.button`
  height: 44px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md, 10px);
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--primary-light);
    border-color: var(--primary-subtle);
    color: var(--primary);
  }
`;

const ClearBtn = styled.button`
  margin-top: 14px;
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: transparent;
  color: #ef4444;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--danger-bg, rgba(239, 68, 68, 0.1));
  }
`;

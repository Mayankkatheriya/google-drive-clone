"use client";

import styled, { css } from "styled-components";
import AddIcon from "@mui/icons-material/Add";

export default function NewUploadButton({ onClick, variant = "sidebar" }) {
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

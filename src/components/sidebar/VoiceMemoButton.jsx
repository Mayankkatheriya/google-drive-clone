"use client";

import styled from "styled-components";
import MicRoundedIcon from "@mui/icons-material/MicRounded";

export default function VoiceMemoButton({ onClick }) {
  return (
    <Btn type="button" onClick={onClick} title="Record a voice memo">
      <MicRoundedIcon />
      <span>Voice memo</span>
    </Btn>
  );
}

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 8px);
  margin: 0 4px;
  padding: 10px 16px 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition),
    box-shadow var(--transition);

  svg {
    font-size: 20px;
    color: var(--file-audio);
    flex-shrink: 0;
  }

  span {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--text-1);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--file-audio) 35%, var(--border));
    background: var(--file-audio-bg);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

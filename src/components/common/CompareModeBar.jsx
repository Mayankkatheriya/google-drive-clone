"use client";

import styled from "styled-components";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useCompare } from "@/context/CompareContext";

export default function CompareModeBar() {
  const { active, selected, hint, exitMode, openCompare, canCompareNow } =
    useCompare();

  if (!active) return null;

  return (
    <Bar>
      <BarInner $hasHint={Boolean(hint)}>
        <BarText>
          <CompareArrowsRoundedIcon style={{ fontSize: 18 }} />
          <TextCol>
            <span>
              Select 2 images or PDFs ·{" "}
              <strong>{selected.length}/2</strong> selected
            </span>
            {hint && <HintText>{hint}</HintText>}
          </TextCol>
        </BarText>
        <BarActions>
          <CompareBtn
            type="button"
            disabled={!canCompareNow}
            onClick={openCompare}
          >
            Compare
          </CompareBtn>
          <CancelBtn type="button" onClick={exitMode} aria-label="Exit compare">
            <CloseRoundedIcon style={{ fontSize: 18 }} />
          </CancelBtn>
        </BarActions>
      </BarInner>
    </Bar>
  );
}

const Bar = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  width: min(520px, calc(100vw - 32px));

  @media (max-width: 768px) {
    bottom: calc(var(--bottom-nav-height) + 12px);
    width: calc(100vw - 24px);
  }
`;

const BarInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid
    ${(props) => (props.$hasHint ? "var(--danger)" : "var(--border-light)")};
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  transition: border-color 0.15s ease;
`;

const BarText = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-2);
  min-width: 0;

  strong {
    color: var(--primary);
  }

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const TextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const HintText = styled.span`
  font-size: 0.74rem;
  color: var(--danger);
  line-height: 1.35;
`;

const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const CompareBtn = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: var(--primary-hover);
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

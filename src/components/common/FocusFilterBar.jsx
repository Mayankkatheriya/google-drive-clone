"use client";

import styled from "styled-components";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useFocus } from "@/context/FocusContext";
import { FOCUS_FILTERS } from "@/lib/focusFilter";

export default function FocusFilterBar({ fileCount = 0, totalCount = 0 }) {
  const { active, filter, setFilter, exitMode } = useFocus();

  if (!active) return null;

  return (
    <Bar>
      <BarTop>
        <Lead>
          <IconWrap>
            <CenterFocusStrongRoundedIcon />
          </IconWrap>
          <LeadText>
            <LeadTitle>Focus mode</LeadTitle>
            <LeadSub>
              {fileCount === totalCount
                ? `${fileCount} file${fileCount === 1 ? "" : "s"}`
                : `${fileCount} of ${totalCount} files`}
              <DesktopHint> · Press Esc to exit</DesktopHint>
            </LeadSub>
          </LeadText>
        </Lead>
        <ExitBtn type="button" onClick={exitMode}>
          <CloseRoundedIcon />
          <span>Exit</span>
        </ExitBtn>
      </BarTop>

      <ChipRow role="tablist" aria-label="Focus filters">
        {FOCUS_FILTERS.map((item) => (
          <Chip
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            $active={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </ChipRow>
    </Bar>
  );
}

const Bar = styled.div`
  margin: 0 24px 16px;
  padding: 14px 16px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);

  @media (max-width: 768px) {
    margin: 0 16px 12px;
    padding: 12px 14px;
  }
`;

const BarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const Lead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--primary-light);
  color: var(--primary);

  svg {
    font-size: 20px;
  }
`;

const LeadText = styled.div`
  min-width: 0;
`;

const LeadTitle = styled.p`
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
`;

const LeadSub = styled.p`
  margin-top: 2px;
  font-size: 0.74rem;
  color: var(--text-3);
  line-height: 1.35;
`;

const DesktopHint = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ExitBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--surface);
  color: var(--text-2);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);

  &:hover {
    background: var(--surface-3);
    border-color: var(--border);
    color: var(--text-1);
  }

  svg {
    font-size: 16px;
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Chip = styled.button`
  height: 32px;
  padding: 0 14px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(p) =>
    p.$active ? "var(--primary-light)" : "var(--surface)"};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition),
    box-shadow var(--transition);

  &:hover {
    border-color: var(--primary-subtle);
    color: var(--primary);
  }

  ${(p) =>
    p.$active &&
    `
    box-shadow: 0 0 0 1px var(--primary-subtle);
  `}
`;

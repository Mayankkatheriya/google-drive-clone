"use client";

import React from "react";
import styled from "styled-components";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { ListsIcon, GridIcon } from "./SvgIcons";
import { useCompare } from "@/context/CompareContext";

const PageHeader = ({ pageTitle, subtitle, subtitleMobile, viewMode, onViewModeChange }) => {
  const { active: compareActive, toggleMode } = useCompare();
  const showViewToggle =
    pageTitle === "My Drive" && viewMode && onViewModeChange;
  const showCompareToggle = pageTitle === "My Drive";

  return (
    <Header>
      <TitleBlock>
        <Title>{pageTitle}</Title>
        {subtitle && <Subtitle $hideOnMobile={Boolean(subtitleMobile)}>{subtitle}</Subtitle>}
        {subtitleMobile && <SubtitleMobile>{subtitleMobile}</SubtitleMobile>}
      </TitleBlock>
      {(showViewToggle || showCompareToggle) && (
        <Actions>
          {showCompareToggle && (
            <CompareActions>
              <CompareToggleBtn
                type="button"
                $active={compareActive}
                onClick={toggleMode}
                aria-pressed={compareActive}
                title={
                  compareActive
                    ? "Exit compare mode"
                    : "Pick 2 images or PDFs to view side by side"
                }
              >
                <CompareArrowsRoundedIcon />
                <span>{compareActive ? "Comparing" : "Compare"}</span>
              </CompareToggleBtn>
            </CompareActions>
          )}
          {showViewToggle && (
            <ViewActions>
              <ActionBtn
                title="List view"
                $active={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                aria-pressed={viewMode === "list"}
              >
                <ListsIcon />
              </ActionBtn>
              <ActionBtn
                title="Grid view"
                $active={viewMode === "grid"}
                onClick={() => onViewModeChange("grid")}
                aria-pressed={viewMode === "grid"}
              >
                <GridIcon />
              </ActionBtn>
            </ViewActions>
          )}
        </Actions>
      )}
    </Header>
  );
};

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 12px;

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 1.35rem;
  }
`;

const Subtitle = styled.p`
  margin-top: 4px;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-3);
  max-width: 560px;

  ${(props) =>
    props.$hideOnMobile &&
    `
    @media (max-width: 768px) {
      display: none;
    }
  `}
`;

const SubtitleMobile = styled.p`
  display: none;
  margin-top: 4px;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-3);

  @media (max-width: 768px) {
    display: block;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding-top: 2px;
`;

const CompareActions = styled.div`
  display: flex;
  align-items: center;
`;

const CompareToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px 0 11px;
  border-radius: 999px;
  border: 1px solid
    ${(props) => (props.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(props) =>
    props.$active ? "var(--primary-light)" : "var(--surface-2)"};
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--primary-light)" : "var(--surface-3)"};
    border-color: var(--primary-subtle);
    color: var(--primary);
  }

  svg {
    font-size: 18px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    height: 34px;
    padding: 0 12px 0 10px;
    font-size: 0.78rem;

    svg {
      font-size: 17px;
    }
  }
`;

const ViewActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ActionBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "none")};
  border: none;
  border-radius: 8px;
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-2)")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--primary);
  }

  svg { font-size: 20px; }
`;

export default PageHeader;

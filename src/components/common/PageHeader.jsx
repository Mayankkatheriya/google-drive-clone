"use client";

import React from "react";
import styled from "styled-components";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { ListsIcon, GridIcon } from "./SvgIcons";
import { useCompare } from "@/context/CompareContext";
import { useFocus } from "@/context/FocusContext";
import { useSelection } from "@/context/SelectionContext";
import Tooltip from "./Tooltip";

const PageHeader = ({
  pageTitle,
  folderLabel,
  subtitle,
  subtitleMobile,
  viewMode,
  onViewModeChange,
  breadcrumbs,
  showSelect = true,
}) => {
  const { active: compareActive, toggleMode: toggleCompare, exitMode: exitCompare } =
    useCompare();
  const { active: focusActive, toggleMode: toggleFocus, exitMode: exitFocus } =
    useFocus();
  const {
    active: selectActive,
    toggleMode: toggleSelect,
    exitMode: exitSelect,
  } = useSelection();

  const isMyDrive = pageTitle === "My Drive";
  const showViewToggle = isMyDrive && viewMode && onViewModeChange && !focusActive;
  const showCompareToggle = isMyDrive && !focusActive;
  const showFocusToggle = isMyDrive;
  const showSelectToggle = showSelect && isMyDrive && !focusActive;

  const handleCompareToggle = () => {
    if (focusActive) exitFocus();
    if (selectActive) exitSelect();
    toggleCompare();
  };

  const handleFocusToggle = () => {
    if (compareActive) exitCompare();
    if (selectActive) exitSelect();
    toggleFocus();
  };

  const handleSelectToggle = () => {
    if (focusActive) exitFocus();
    if (compareActive) exitCompare();
    toggleSelect();
  };

  return (
    <Header $focus={focusActive}>
      <TopRow>
        <TitleBlock>
          <Title>
            {focusActive ? "Focus" : pageTitle}
            {folderLabel && folderLabel !== "My Drive" && (
              <FolderHint> / {folderLabel}</FolderHint>
            )}
          </Title>
          {breadcrumbs}
          {focusActive ? (
            <>
              <Subtitle>Distraction-free browsing — sidebar and actions hidden</Subtitle>
              <SubtitleMobile>Clean view for reading and browsing files</SubtitleMobile>
            </>
          ) : (
            <>
              {subtitle && (
                <Subtitle $hideOnMobile={Boolean(subtitleMobile)}>
                  {subtitle}
                </Subtitle>
              )}
              {subtitleMobile && <SubtitleMobile>{subtitleMobile}</SubtitleMobile>}
            </>
          )}
        </TitleBlock>
        {showViewToggle && (
          <ViewActions data-tour="view">
            <Tooltip label="List view" iconOnly>
              <ActionBtn
                $active={viewMode === "list"}
                onClick={() => onViewModeChange("list")}
                aria-pressed={viewMode === "list"}
              >
                <ListsIcon />
              </ActionBtn>
            </Tooltip>
            <Tooltip label="Grid view" iconOnly>
              <ActionBtn
                $active={viewMode === "grid"}
                onClick={() => onViewModeChange("grid")}
                aria-pressed={viewMode === "grid"}
              >
                <GridIcon />
              </ActionBtn>
            </Tooltip>
          </ViewActions>
        )}
      </TopRow>
      {(showCompareToggle || showFocusToggle || showSelectToggle) && (
        <ModeActions data-tour="mode-actions">
          {showFocusToggle && (
            <ModeToggleBtn
              type="button"
              $active={focusActive}
              onClick={handleFocusToggle}
              aria-pressed={focusActive}
              data-tour="focus"
            >
              <CenterFocusStrongRoundedIcon />
              <span>{focusActive ? "Focusing" : "Focus"}</span>
            </ModeToggleBtn>
          )}
          {showSelectToggle && (
            <ModeToggleBtn
              type="button"
              $active={selectActive}
              onClick={handleSelectToggle}
              aria-pressed={selectActive}
              data-tour="select"
            >
              <CheckBoxOutlinedIcon />
              <span>{selectActive ? "Selecting" : "Select"}</span>
            </ModeToggleBtn>
          )}
          {showCompareToggle && (
            <ModeToggleBtn
              type="button"
              $active={compareActive}
              onClick={handleCompareToggle}
              aria-pressed={compareActive}
              data-tour="compare"
            >
              <CompareArrowsRoundedIcon />
              <span>{compareActive ? "Comparing" : "Compare"}</span>
            </ModeToggleBtn>
          )}
        </ModeActions>
      )}
    </Header>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px 12px;

  ${(p) =>
    p.$focus &&
    `
    padding-bottom: 8px;
  `}

  @media (min-width: 769px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
    gap: 10px;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  flex: 1;
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
    font-size: 1.25rem;
  }
`;

const FolderHint = styled.span`
  font-weight: 600;
  color: var(--text-2);
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

const ModeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  @media (min-width: 769px) {
    width: auto;
    margin-left: auto;
    align-self: flex-start;
  }
`;

const ViewActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ModeToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px 0 11px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${(props) => (props.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(props) =>
    props.$active ? "var(--primary-light)" : "var(--surface-2)"};
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);

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
    height: 38px;
    padding: 0 10px;
    font-size: 0.76rem;

    svg {
      font-size: 17px;
    }
  }

  @media (min-width: 769px) {
    flex: 0 0 auto;
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

  svg {
    font-size: 20px;
  }
`;

export default PageHeader;

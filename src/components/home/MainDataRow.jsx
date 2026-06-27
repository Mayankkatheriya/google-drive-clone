"use client";

import React, { memo, useRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  MoreOptionsIcon,
  StarFilledIcon,
  StarBorderIcon,
  DownloadIcon,
  CopyIcon,
  DeleteIcon,
  ShareIcon,
  RenameIcon,
} from "../common/SvgIcons";
import { changeBytes, convertDates } from "../common/common";
import FileIcons from "../common/FileIcons";
import SecureFileLink from "../common/SecureFileLink";
import ShareButtons from "../common/ShareButtons";
import { downloadFile } from "../../lib/fileAccess";
import { useMenuPlacement } from "@/hooks/useMenuPlacement";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import { canCompareFile } from "@/lib/compareFiles";
import CompareSelectMark from "../common/CompareSelectMark";

function FileRowOptionsMenu({
  file,
  isOpen,
  showShareIcons,
  shareUrl,
  onToggle,
  onShareClick,
  onCopyLink,
  onRename,
  onDelete,
  menuRef,
}) {
  const triggerRef = useRef(null);
  const { top, right, flip, ready } = useMenuPlacement(
    triggerRef,
    menuRef,
    isOpen,
  );

  return (
    <>
      <OptionsTrigger
        ref={triggerRef}
        className="optionsContainer"
        title="More options"
        $active={isOpen}
        onClick={onToggle}
      >
        <MoreOptionsIcon />
      </OptionsTrigger>

      {isOpen &&
        createPortal(
          <OptionsMenu
            ref={menuRef}
            $fixed
            $ready={ready}
            $flip={flip}
            style={{ top, right }}
          >
            <MenuItem onClick={() => downloadFile(file.data)}>
              <DownloadIcon /> Download
            </MenuItem>
            <MenuItem onClick={() => onCopyLink(file.data)}>
              <CopyIcon /> Copy Link
            </MenuItem>
            <MenuItem
              className="shareButton"
              onClick={() => onShareClick(file.data)}
            >
              <ShareIcon /> Share
              <ShareExpand
                className={showShareIcons ? "show" : ""}
                $flip={flip}
              >
                <ShareButtons
                  url={shareUrl}
                  filename={file.data.filename}
                  layout="expand"
                />
              </ShareExpand>
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={() => onRename(file.id, file.data.filename)}>
              <RenameIcon /> Rename
            </MenuItem>
            <MenuDivider />
            <MenuItem $danger onClick={() => onDelete(file.id, file.data)}>
              <DeleteIcon /> Delete
            </MenuItem>
            <MenuFooter>
              <FooterRow>{changeBytes(file.data.size)}</FooterRow>
              <FooterRow>
                {convertDates(file.data.timestamp?.seconds)}
              </FooterRow>
            </MenuFooter>
          </OptionsMenu>,
          document.body,
        )}
    </>
  );
}

function MainDataRow({
  file,
  files,
  isMenuOpen,
  isRenaming,
  renameValue,
  renameInputRef,
  isShareOpen,
  shareUrl,
  showShareIcons,
  optionsMenuRef,
  onStar,
  onNameClick,
  onNameDoubleClick,
  onRenameChange,
  onRenameBlur,
  onRenameKeyDown,
  onCopyLink,
  onQuickShare,
  onRenameStart,
  onRename,
  onDelete,
  onOptionsToggle,
  onShareClick,
  compareMode = false,
  compareSelected = false,
  onCompareToggle,
}) {
  const { bgVar, colorVar } = getFileTypeTokens(
    file.data.contentType,
    file.data.filename,
  );
  const comparable = canCompareFile(file.data.contentType);

  return (
    <Row
      $active={isMenuOpen}
      $compareMode={compareMode}
      $compareSelected={compareSelected}
      $compareDisabled={compareMode && !comparable}
      data-share-open={isShareOpen || undefined}
      onClick={
        compareMode
          ? (event) => {
              if (
                event.target.closest(".optionsContainer") ||
                event.target.closest(".hover-actions") ||
                event.target.closest(".share-popover") ||
                event.target.closest(".share-trigger")
              ) {
                return;
              }
              if (!comparable) return;
              onCompareToggle?.();
            }
          : undefined
      }
    >
      <NameCol>
        {compareMode && (
          <CompareSelectWrap>
            <CompareSelectMark
              selected={compareSelected}
              disabled={!comparable}
            />
          </CompareSelectWrap>
        )}
        <StarBtn
          onClick={(event) => {
            event.stopPropagation();
            onStar();
          }}
          $starred={file.data.starred}
          title={file.data.starred ? "Unstar" : "Star"}
        >
          {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
        </StarBtn>

        <FileInfo>
          {compareMode ? (
            <FileIconWrap $bgVar={bgVar} $colorVar={colorVar}>
              <FileIcons type={file.data.contentType} />
            </FileIconWrap>
          ) : (
            <SecureFileLink fileData={file.data} fileId={file.id} files={files}>
              <FileIconWrap $bgVar={bgVar} $colorVar={colorVar}>
                <FileIcons type={file.data.contentType} />
              </FileIconWrap>
            </SecureFileLink>
          )}

          <NameBlock>
            {isRenaming ? (
              <RenameInput
                ref={renameInputRef}
                value={renameValue}
                onChange={onRenameChange}
                onBlur={onRenameBlur}
                onKeyDown={onRenameKeyDown}
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <FileName
                title={`${file.data.filename} — double-click to rename`}
                onClick={onNameClick}
                onDoubleClick={onNameDoubleClick}
              >
                {file.data.filename}
              </FileName>
            )}
            <MobileMeta>
              {changeBytes(file.data.size)} ·{" "}
              {convertDates(file.data.timestamp?.seconds)}
            </MobileMeta>
          </NameBlock>
        </FileInfo>
      </NameCol>

      <SizeCol className="hide-sm">
        <MetaText>{changeBytes(file.data.size)}</MetaText>
      </SizeCol>

      <DateCol className="hide-md">
        <MetaText>{convertDates(file.data.timestamp?.seconds)}</MetaText>
      </DateCol>

      <ActionsCol>
        <HoverActions className="hover-actions">
          <QuickBtn onClick={() => downloadFile(file.data)} title="Download">
            <DownloadIcon />
          </QuickBtn>
          <QuickBtn onClick={() => onCopyLink(file.data)} title="Copy link">
            <CopyIcon />
          </QuickBtn>
          <ShareWrap>
            <QuickBtn
              className="share-trigger"
              onClick={onQuickShare}
              title="Share"
              $active={isShareOpen}
            >
              <ShareIcon />
            </QuickBtn>
            {isShareOpen && shareUrl && (
              <ShareBar className="share-popover">
                <ShareButtons url={shareUrl} filename={file.data.filename} />
              </ShareBar>
            )}
          </ShareWrap>
          <QuickBtn onClick={onRenameStart} title="Rename">
            <RenameIcon />
          </QuickBtn>
          <QuickBtn $danger onClick={onDelete} title="Delete">
            <DeleteIcon />
          </QuickBtn>
        </HoverActions>

        <MobileMenu>
          {isMenuOpen ? (
            <FileRowOptionsMenu
              file={file}
              isOpen={isMenuOpen}
              showShareIcons={showShareIcons}
              shareUrl={shareUrl}
              onToggle={onOptionsToggle}
              onShareClick={onShareClick}
              onCopyLink={onCopyLink}
              onRename={onRename}
              onDelete={onDelete}
              menuRef={optionsMenuRef}
            />
          ) : (
            <OptionsTrigger
              className="optionsContainer"
              title="More options"
              $active={false}
              onClick={onOptionsToggle}
            >
              <MoreOptionsIcon />
            </OptionsTrigger>
          )}
        </MobileMenu>
      </ActionsCol>
    </Row>
  );
}

export default memo(
  MainDataRow,
  (prev, next) =>
    prev.file.id === next.file.id &&
    prev.file.data === next.file.data &&
    prev.files === next.files &&
    prev.isMenuOpen === next.isMenuOpen &&
    prev.isRenaming === next.isRenaming &&
    prev.isShareOpen === next.isShareOpen &&
    prev.shareUrl === next.shareUrl &&
    prev.showShareIcons === next.showShareIcons &&
    prev.renameValue === next.renameValue &&
    prev.compareMode === next.compareMode &&
    prev.compareSelected === next.compareSelected,
);

const NameCol = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
`;

const SizeCol = styled.div`
  flex: 0 0 88px;
  display: flex;
  align-items: center;
`;

const DateCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const ActionsCol = styled.div`
  flex: 0 0 188px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  position: relative;

  @media (max-width: 768px) {
    flex: 0 0 auto;
    align-self: center;
    margin-left: 4px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 4px;
  height: 52px;
  border-radius: 10px;
  margin: 1px 0;
  background: ${(props) => {
    if (props.$compareSelected) return "var(--primary-light)";
    if (props.$active) return "var(--primary-light)";
    return "transparent";
  }};
  box-shadow: ${(props) =>
    props.$compareSelected ? "inset 0 0 0 2px var(--primary)" : "none"};
  opacity: ${(props) => (props.$compareDisabled ? 0.45 : 1)};
  cursor: ${(props) => (props.$compareMode ? "pointer" : "default")};
  transition: background 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$compareSelected ? "var(--primary-light)" : "var(--surface-2)"};
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    height: auto;
    min-height: 64px;
    padding: 12px 12px 12px 8px;
    margin: 0;
    border-radius: 0;
    border-bottom: 1px solid var(--border-light);

    &:hover {
      background: ${(props) =>
        props.$compareSelected ? "var(--primary-light)" : "transparent"};
    }

    &:active {
      background: var(--surface-2);
    }
  }
`;

const CompareSelectWrap = styled.span`
  flex-shrink: 0;
  margin-right: 2px;

  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const StarBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  color: ${(props) => (props.$starred ? "#f59e0b" : "#cbd5e1")};
  transition: all 0.15s ease;

  &:hover {
    background: #fef9c3;
    color: #f59e0b;
  }

  svg {
    font-size: 17px;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    margin-top: 2px;

    svg {
      font-size: 18px;
    }
  }
`;

const FileIconWrap = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 19px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;

    svg {
      font-size: 22px;
    }
  }
`;

const NameBlock = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.span`
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  cursor: text;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    font-weight: 600;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.35;
  }
`;

const RenameInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 4px 8px;
  border: 1.5px solid var(--primary);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-1);
  font-size: 0.88rem;
  font-weight: 500;
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-subtle);
`;

const MobileMeta = styled.span`
  display: none;

  @media (max-width: 768px) {
    display: block;
    font-size: 0.75rem;
    color: var(--text-3);
    line-height: 1.3;
  }
`;

const MetaText = styled.span`
  font-size: 0.82rem;
  color: var(--text-3);
`;

const HoverActions = styled.div`
  display: none;
  align-items: center;
  gap: 2px;

  @media (min-width: 769px) {
    ${Row}:hover &,
    ${Row}[data-share-open="true"] & {
      display: flex;
    }
  }

  @media (max-width: 768px) {
    display: none !important;
  }
`;

const ShareWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ShareBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  background: var(--surface);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  z-index: 60;
`;

const QuickBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "none")};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => {
    if (props.$danger) return "#ef4444";
    if (props.$active) return "var(--primary)";
    return "var(--text-2)";
  }};
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "var(--danger-bg)" : "var(--surface-3)")};
    color: ${(props) => (props.$danger ? "#dc2626" : "var(--primary)")};
  }

  svg {
    font-size: 17px;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: relative;
  align-items: center;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const OptionsTrigger = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "none")};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-3)")};
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--text-2);
  }

  svg {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  right: 0;
  top: 34px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  min-width: 186px;
  z-index: 50;
  padding: 6px;

  ${(props) =>
    props.$fixed &&
    `
    position: fixed;
    top: auto;
    right: auto;
    z-index: 950;
    opacity: ${props.$ready ? 1 : 0};
    pointer-events: ${props.$ready ? "auto" : "none"};
  `}
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => (props.$danger ? "#ef4444" : "var(--text-1)")};
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "var(--danger-bg)" : "var(--surface-2)")};
  }

  svg {
    font-size: 17px;
    flex-shrink: 0;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: var(--border-light);
  margin: 4px 0;
`;

const MenuFooter = styled.div`
  padding: 6px 12px 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FooterRow = styled.span`
  font-size: 0.72rem;
  color: var(--text-3);
`;

const ShareExpand = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  left: 0;
  top: ${(props) => (props.$flip ? "auto" : "-52px")};
  bottom: ${(props) => (props.$flip ? "-52px" : "auto")};
  background: var(--surface);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 60;

  &.show {
    opacity: 1;
    visibility: visible;
  }
`;

export { NameCol, SizeCol, DateCol, ActionsCol };

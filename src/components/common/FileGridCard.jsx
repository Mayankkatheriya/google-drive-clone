"use client";

import React, { memo } from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { changeBytes } from "./common";
import SecureFileLink from "./SecureFileLink";
import { handleRestoreFromTrash, handleStarred } from "./firebaseApi";
import {
  DeleteIcon,
  StarBorderIcon,
  StarFilledIcon,
  DownloadIcon,
  RestoreIcon,
} from "./SvgIcons";
import { downloadFile } from "../../lib/fileAccess";
import { DriveGridMenu } from "./DriveGridMenu";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import { useCompare } from "@/context/CompareContext";
import { canCompareFile } from "@/lib/compareFiles";
import CompareSelectMark from "./CompareSelectMark";

function FileGridCard({
  file,
  data,
  page,
  isDrivePage,
  isMenuOpen,
  isRenaming,
  renameValue,
  renameInputRef,
  shareOpen,
  shareUrl,
  menuRef,
  onToggleMenu,
  onRename,
  onShareClick,
  onRenameValueChange,
  onRenameSubmit,
  onRenameCancel,
  onDelete,
  onPermanentDelete,
}) {
  const { active: compareMode, toggleFile, isSelected } = useCompare();
  const { bgVar, colorVar, label } = getFileTypeTokens(
    file.data.contentType,
    file.data.filename,
  );
  const driveCompare = isDrivePage && compareMode;
  const compareSelected = driveCompare && isSelected(file.id);
  const comparable = canCompareFile(file.data.contentType);

  const handleCardClick = (event) => {
    if (!driveCompare) return;
    if (
      event.target.closest(".card-actions") ||
      event.target.closest(".drive-grid-menu") ||
      event.target.closest(".drive-grid-menu-trigger")
    ) {
      return;
    }
    if (!comparable) return;
    toggleFile(file);
  };

  const iconTile = (
    <IconTile $bgVar={bgVar} $colorVar={colorVar}>
      <FileIcons type={file.data.contentType} />
    </IconTile>
  );

  return (
    <Card
      $menuOpen={isMenuOpen}
      $compareMode={driveCompare}
      $compareSelected={compareSelected}
      $compareDisabled={driveCompare && !comparable}
      onClick={handleCardClick}
    >
      {driveCompare && (
        <CompareMarkWrap>
          <CompareSelectMark
            selected={compareSelected}
            disabled={!comparable}
            size="sm"
          />
        </CompareMarkWrap>
      )}
      {driveCompare ? (
        <CompareLink>{iconTile}</CompareLink>
      ) : (
        <FileLink
          fileData={file.data}
          fileId={page === "trash" ? undefined : file.id}
          files={data}
        >
          {iconTile}
          <CardBody>
            {isDrivePage && isRenaming ? (
              <RenameInput
                ref={renameInputRef}
                value={renameValue}
                onChange={onRenameValueChange}
                onBlur={onRenameSubmit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onRenameSubmit();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onRenameCancel();
                  }
                }}
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <CardName title={file.data.filename}>{file.data.filename}</CardName>
            )}
            <CardMeta>
              <TypeTag>{label}</TypeTag>
              <span>{changeBytes(file.data.size)}</span>
            </CardMeta>
          </CardBody>
        </FileLink>
      )}

      {driveCompare && (
        <CardBody>
          <CardName title={file.data.filename}>{file.data.filename}</CardName>
          <CardMeta>
            <TypeTag>{label}</TypeTag>
            <span>{changeBytes(file.data.size)}</span>
          </CardMeta>
        </CardBody>
      )}

      {page === "starred" && (
        <StarBtn
          onClick={() => handleStarred(file.id)}
          $starred={file.data.starred}
          title={file.data.starred ? "Unstar" : "Star"}
        >
          {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
        </StarBtn>
      )}

      {isDrivePage && (
        <DriveGridMenu
          file={file}
          isOpen={isMenuOpen}
          onToggle={onToggleMenu}
          onRename={onRename}
          shareOpen={shareOpen}
          shareUrl={shareUrl}
          onShareClick={onShareClick}
          menuRef={menuRef}
        />
      )}

      {page !== "trash" && page !== "starred" && !isDrivePage && (
        <CardActions className="card-actions">
          <ActionBtn
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(file.data);
            }}
            title="Download"
          >
            <DownloadIcon />
          </ActionBtn>
          <ActionBtn
            $danger
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <DeleteIcon />
          </ActionBtn>
        </CardActions>
      )}

      {page === "trash" && (
        <TrashActions className="trash-actions">
          <ActionBtn
            onClick={(e) => {
              e.stopPropagation();
              handleRestoreFromTrash(file.id, file.data);
            }}
            title="Restore"
          >
            <RestoreIcon />
          </ActionBtn>
          <ActionBtn
            $danger
            onClick={async (e) => {
              e.stopPropagation();
              await onPermanentDelete();
            }}
            title="Delete forever"
          >
            <DeleteIcon />
          </ActionBtn>
        </TrashActions>
      )}
    </Card>
  );
}

export default memo(
  FileGridCard,
  (prev, next) =>
    prev.file.id === next.file.id &&
    prev.file.data === next.file.data &&
    prev.page === next.page &&
    prev.isDrivePage === next.isDrivePage &&
    prev.isMenuOpen === next.isMenuOpen &&
    prev.isRenaming === next.isRenaming &&
    prev.renameValue === next.renameValue &&
    prev.shareOpen === next.shareOpen &&
    prev.shareUrl === next.shareUrl &&
    prev.data === next.data,
);

const Card = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: ${(props) =>
    props.$compareSelected ? "var(--primary-light)" : "var(--surface-2)"};
  border: 1px solid
    ${(props) =>
      props.$compareSelected ? "var(--primary)" : "var(--border)"};
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  opacity: ${(props) => (props.$compareDisabled ? 0.45 : 1)};
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
  box-shadow: ${(props) =>
    props.$compareSelected ? "var(--shadow-md)" : "var(--shadow-sm)"};

  &:hover {
    border-color: ${(props) =>
      props.$compareSelected ? "var(--primary)" : "var(--primary-subtle)"};
    box-shadow: var(--shadow-md);
  }

  @media (min-width: 769px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 14px 14px;

    &:hover {
      transform: ${(props) => (props.$compareMode ? "none" : "translateY(-2px)")};
    }

    &:hover .card-actions {
      opacity: 1;
      pointer-events: auto;
    }

    ${(props) =>
      props.$menuOpen &&
      `
      .card-actions {
        opacity: 1;
        pointer-events: auto;
      }
    `}
  }
`;

const FileLink = styled(SecureFileLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-decoration: none;
  color: inherit;

  @media (min-width: 769px) {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

const CompareMarkWrap = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  pointer-events: none;
`;

const CompareLink = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (min-width: 769px) {
    width: 100%;
  }
`;

const IconTile = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 24px;
  }

  @media (min-width: 769px) {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;

    svg {
      font-size: 26px;
    }
  }
`;

const CardBody = styled.div`
  min-width: 0;
  flex: 1;
  width: 100%;
  overflow: hidden;

  @media (min-width: 769px) {
    padding-right: 28px;
  }
`;

const CardName = styled.p`
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.35;
  margin-bottom: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  @media (min-width: 769px) {
    font-size: 0.84rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
    overflow-wrap: anywhere;
    padding-right: 4px;
  }
`;

const RenameInput = styled.input`
  width: 100%;
  min-width: 0;
  margin-bottom: 4px;
  padding: 6px 8px;
  border: 1.5px solid var(--primary);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-1);
  font-size: 0.84rem;
  font-weight: 600;
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-subtle);
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--text-3);
  min-width: 0;

  span:last-child {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TypeTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-3);
  color: var(--text-2);
  flex-shrink: 0;
`;

const CardActions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;

  @media (min-width: 769px) {
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
`;

const TrashActions = styled(CardActions)`
  @media (min-width: 769px) {
    opacity: 1;
    pointer-events: auto;
  }
`;

const ActionBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.$danger ? "#f87171" : "var(--text-2)")};
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) =>
      props.$danger ? "rgba(248, 113, 113, 0.12)" : "var(--primary-light)"};
    color: ${(props) => (props.$danger ? "#fca5a5" : "var(--primary)")};
    border-color: ${(props) =>
      props.$danger ? "rgba(248, 113, 113, 0.35)" : "var(--primary-subtle)"};
  }

  svg {
    font-size: 16px;
  }

  @media (min-width: 769px) {
    width: 30px;
    height: 30px;
  }
`;

const StarBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  color: ${(props) => (props.$starred ? "#f59e0b" : "var(--text-3)")};
  transition: all 0.15s ease;

  &:hover {
    background: #fef9c3;
    color: #f59e0b;
  }

  svg {
    font-size: 15px;
  }

  @media (min-width: 769px) {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;

    svg {
      font-size: 14px;
    }
  }
`;

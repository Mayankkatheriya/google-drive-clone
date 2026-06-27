"use client";

import React from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { changeBytes } from "./common";
import SecureFileLink from "./SecureFileLink";
import {
  handleRestoreFromTrash,
  handleStarred,
} from "./firebaseApi";
import { useFileTrashActions } from "@/hooks/useFileTrashActions";
import {
  DeleteIcon,
  StarBorderIcon,
  StarFilledIcon,
  DownloadIcon,
  RestoreIcon,
} from "./SvgIcons";
import LottieImage from "./LottieImage";
import { motion } from "framer-motion";
import { downloadFile } from "../../lib/fileAccess";
import { DriveGridMenu, useDriveGridMenuState } from "./DriveGridMenu";

function getTypeStyle(contentType, filename) {
  const ext = filename?.split(".").pop()?.toUpperCase().slice(0, 4) || "";
  if (contentType?.includes("pdf"))
    return { tile: "#fce8e6", icon: "#d93025", label: "PDF" };
  if (contentType?.includes("png"))
    return { tile: "#e8eaf6", icon: "#5c6bc0", label: "PNG" };
  if (contentType?.includes("gif"))
    return { tile: "#f3e5f5", icon: "#8e24aa", label: "GIF" };
  if (contentType?.includes("webp"))
    return { tile: "#e8eaf6", icon: "#5c6bc0", label: "WEBP" };
  if (contentType?.includes("image"))
    return { tile: "#e8eaf6", icon: "#5c6bc0", label: ext || "IMG" };
  if (contentType?.includes("mp4") || contentType?.includes("video"))
    return { tile: "#e3f2fd", icon: "#1e88e5", label: ext || "VID" };
  if (contentType?.includes("mp3") || contentType?.includes("audio"))
    return { tile: "#fff3e0", icon: "#ef6c00", label: ext || "AUD" };
  return { tile: "#f1f3f4", icon: "#5f6368", label: ext || "FILE" };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

const FilesList = ({ data, page = null, imagePath, text1, text2, compact = false }) => {
  const driveMenu = useDriveGridMenuState();
  const { confirmMoveToTrash, confirmPermanentDelete } = useFileTrashActions();
  const isDrivePage = page === "drive";

  if (data.length === 0) {
    return <LottieImage imagePath={imagePath} text1={text1} text2={text2} />;
  }

  const handleDelete = async (id, fileData) => {
    if (page === "trash") {
      await confirmPermanentDelete(id, fileData);
      return;
    }
    await confirmMoveToTrash(id, fileData);
  };

  return (
    <List $compact={compact} variants={container} initial="hidden" animate="show">
      {data.map((file) => {
        const { tile, icon, label } = getTypeStyle(
          file.data.contentType,
          file.data.filename
        );
        const isMenuOpen = driveMenu.openMenuId === file.id;

        return (
          <Card key={file.id} variants={item} $menuOpen={isMenuOpen}>
            <FileLink
              fileData={file.data}
              fileId={page === "trash" ? undefined : file.id}
              files={data}
            >
              <IconTile style={{ background: tile, color: icon }}>
                <FileIcons type={file.data.contentType} />
              </IconTile>
              <CardBody>
                {isDrivePage && driveMenu.renamingId === file.id ? (
                  <RenameInput
                    ref={driveMenu.renameInputRef}
                    value={driveMenu.renameValue}
                    onChange={(event) => driveMenu.setRenameValue(event.target.value)}
                    onBlur={() => driveMenu.submitRename(file.id, file.data.filename)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        driveMenu.submitRename(file.id, file.data.filename);
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        driveMenu.cancelRename();
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
                onToggle={driveMenu.setOpenMenuId}
                onRename={driveMenu.startRename}
                shareOpen={driveMenu.shareMenuId === file.id}
                shareUrl={driveMenu.shareUrl}
                onShareClick={(fileData) => driveMenu.handleShareClick(fileData, file.id)}
                menuRef={driveMenu.menuRef}
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
                    handleDelete(file.id, file.data);
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
                    await confirmPermanentDelete(file.id, file.data);
                  }}
                  title="Delete forever"
                >
                  <DeleteIcon />
                </ActionBtn>
              </TrashActions>
            )}
          </Card>
        );
      })}
    </List>
  );
};

/* ── mobile: vertical list, 1 row per file ── */
const List = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: ${(props) =>
    props.$compact ? "0 0 var(--mobile-scroll-inset)" : "8px 16px var(--mobile-scroll-inset)"};
  scroll-padding-bottom: var(--mobile-scroll-inset);

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 16px;
    padding: ${(props) => (props.$compact ? "0 0 8px" : "20px 24px 28px")};
  }
`;

const Card = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--primary-subtle);
    box-shadow: var(--shadow-md);
  }

  @media (min-width: 769px) {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 14px 14px;

    &:hover {
      transform: translateY(-2px);
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

const IconTile = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

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
    background: ${(props) => (props.$danger ? "rgba(248, 113, 113, 0.12)" : "var(--primary-light)")};
    color: ${(props) => (props.$danger ? "#fca5a5" : "var(--primary)")};
    border-color: ${(props) => (props.$danger ? "rgba(248, 113, 113, 0.35)" : "var(--primary-subtle)")};
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

export default FilesList;

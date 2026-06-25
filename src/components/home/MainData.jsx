"use client";

import React, { useState, useRef, useEffect } from "react";
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
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";
import {
  handleStarred,
  handleMoveToTrash,
  handleRenameFile,
  markFileOpened,
} from "../common/firebaseApi";
import { toast } from "react-toastify";
import LottieImage from "../common/LottieImage";
import SecureFileLink from "../common/SecureFileLink";
import { downloadFile, getFileDownloadUrl } from "../../lib/fileAccess";
import { useMenuPlacement } from "@/hooks/useMenuPlacement";
import { useFilePreview } from "@/context/FilePreviewContext";
import { getUploadHelpText } from "@/lib/uploadLimits";

function getTypeStyle(contentType) {
  if (contentType?.includes("pdf"))   return { bg: "#fce8e6", color: "#d93025", ext: "PDF" };
  if (contentType?.includes("image")) return { bg: "#e8eaf6", color: "#5c6bc0", ext: "IMG" };
  if (contentType?.includes("video")) return { bg: "#e3f2fd", color: "#1e88e5", ext: "VID" };
  if (contentType?.includes("audio")) return { bg: "#fff3e0", color: "#ef6c00", ext: "AUD" };
  return { bg: "#f1f3f4", color: "#5f6368", ext: "DOC" };
}

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
  const { top, right, flip, ready } = useMenuPlacement(triggerRef, menuRef, isOpen);

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
              <ShareExpand className={showShareIcons ? "show" : ""} $flip={flip}>
                <EmailShareButton url={shareUrl} subject={`${file.data.filename} file link`}>
                  <EmailIcon size={28} round />
                </EmailShareButton>
                <FacebookShareButton url={shareUrl} hashtag={file.data.filename}>
                  <FacebookIcon size={28} round />
                </FacebookShareButton>
                <LinkedinShareButton url={shareUrl} title={`${file.data.filename} file link`}>
                  <LinkedinIcon size={28} round />
                </LinkedinShareButton>
                <WhatsappShareButton url={shareUrl} title={`${file.data.filename} file link`}>
                  <WhatsappIcon size={28} round />
                </WhatsappShareButton>
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
              <FooterRow>{convertDates(file.data.timestamp?.seconds)}</FooterRow>
            </MenuFooter>
          </OptionsMenu>,
          document.body
        )}
    </>
  );
}

const MainData = ({ files }) => {
  const [showShareIcons, setShowShareIcons] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareFileId, setShareFileId] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const optionsMenuRef = useRef(null);
  const renameInputRef = useRef(null);
  const nameClickTimerRef = useRef(null);
  const { open: openPreview } = useFilePreview();

  useEffect(() => {
    return () => {
      if (nameClickTimerRef.current) {
        clearTimeout(nameClickTimerRef.current);
      }
    };
  }, []);

  const openFilePreview = (file) => {
    markFileOpened(file.id);
    openPreview(
      file.data,
      files.map((item) => item.data)
    );
  };

  const handleNameClick = (file, event) => {
    event.stopPropagation();
    if (nameClickTimerRef.current) {
      clearTimeout(nameClickTimerRef.current);
    }
    nameClickTimerRef.current = setTimeout(() => {
      openFilePreview(file);
      nameClickTimerRef.current = null;
    }, 250);
  };

  const handleNameDoubleClick = (file, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (nameClickTimerRef.current) {
      clearTimeout(nameClickTimerRef.current);
      nameClickTimerRef.current = null;
    }
    startRename(file.id, file.data.filename);
  };

  const handleDelete = async (id, data) => {
    await handleMoveToTrash(id, data);
    setOptionsVisible(null);
  };

  const handleOptionsClick = (id) => {
    setOptionsVisible((prev) => (prev === id ? null : id));
    setShareFileId(null);
    setShowShareIcons(false);
    setShareUrl("");
  };

  const startRename = (id, filename) => {
    setOptionsVisible(null);
    setShareFileId(null);
    setRenamingId(id);
    setRenameValue(filename);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const submitRename = async (id, currentFilename) => {
    const success = await handleRenameFile(id, currentFilename, renameValue);
    if (success) {
      cancelRename();
    }
  };

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleShareClick = async (fileData) => {
    if (!showShareIcons) {
      try {
        const url = await getFileDownloadUrl(fileData);
        setShareUrl(url);
        setShowShareIcons(true);
      } catch (error) {
        toast.error("Unable to share file");
      }
      return;
    }
    setShowShareIcons(false);
    setShareUrl("");
  };

  const handleQuickShare = async (file) => {
    if (shareFileId === file.id) {
      setShareFileId(null);
      setShareUrl("");
      return;
    }

    try {
      const url = await getFileDownloadUrl(file.data);
      setShareUrl(url);
      setShareFileId(file.id);
    } catch (error) {
      toast.error("Unable to share file");
    }
  };

  const handleCopyLink = async (fileData) => {
    try {
      const url = await getFileDownloadUrl(fileData);
      await navigator.clipboard.writeText(url);
      toast.success("Link Copied");
    } catch (error) {
      toast.error("Unable to copy link");
    }
  };

  useEffect(() => {
    setShowShareIcons(false);
    setShareUrl("");
    setShareFileId(null);
  }, [optionsVisible]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target) &&
        !event.target.closest(".optionsContainer") &&
        !event.target.closest(".shareButton") &&
        !event.target.closest(".share-popover") &&
        !event.target.closest(".share-trigger")
      ) {
        setShowShareIcons(false);
        setShareFileId(null);
        setShareUrl("");
        setOptionsVisible(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("touchstart", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, []);

  if (files.length === 0) {
    return (
      <LottieImage
        imagePath="/homePage.svg"
        text1="A place for all of your files"
        text2={getUploadHelpText()}
      />
    );
  }

  return (
    <TableWrap>
      <TableHead>
        <NameCol>Name</NameCol>
        <SizeCol className="hide-sm">Size</SizeCol>
        <DateCol className="hide-md">Modified</DateCol>
        <ActionsCol />
      </TableHead>

      {files.map((file) => {
        const { bg, color } = getTypeStyle(file.data.contentType);
        const isHovered = hoveredRow === file.id;
        const isOpen = optionsVisible === file.id;

        return (
          <Row
            key={file.id}
            $active={isOpen}
            onMouseEnter={() => setHoveredRow(file.id)}
            onMouseLeave={() => {
              setHoveredRow(null);
              setShareFileId(null);
              setShareUrl("");
            }}
          >
            <NameCol>
              <StarBtn
                onClick={() => handleStarred(file.id)}
                $starred={file.data.starred}
                title={file.data.starred ? "Unstar" : "Star"}
              >
                {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
              </StarBtn>

              <FileInfo>
                <SecureFileLink
                  fileData={file.data}
                  fileId={file.id}
                  files={files}
                >
                  <FileIconWrap style={{ background: bg }}>
                    <span style={{ color, display: "flex" }}>
                      <FileIcons type={file.data.contentType} />
                    </span>
                  </FileIconWrap>
                </SecureFileLink>

                <NameBlock>
                  {renamingId === file.id ? (
                    <RenameInput
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onBlur={() => submitRename(file.id, file.data.filename)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          submitRename(file.id, file.data.filename);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelRename();
                        }
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  ) : (
                    <FileName
                      title={`${file.data.filename} — double-click to rename`}
                      onClick={(event) => handleNameClick(file, event)}
                      onDoubleClick={(event) => handleNameDoubleClick(file, event)}
                    >
                      {file.data.filename}
                    </FileName>
                  )}
                  <MobileMeta>
                    {changeBytes(file.data.size)} · {convertDates(file.data.timestamp?.seconds)}
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
              <HoverActions $visible={isHovered}>
                <QuickBtn
                  onClick={() => downloadFile(file.data)}
                  title="Download"
                >
                  <DownloadIcon />
                </QuickBtn>
                <QuickBtn
                  onClick={() => handleCopyLink(file.data)}
                  title="Copy link"
                >
                  <CopyIcon />
                </QuickBtn>
                <ShareWrap>
                  <QuickBtn
                    className="share-trigger"
                    onClick={() => handleQuickShare(file)}
                    title="Share"
                    $active={shareFileId === file.id}
                  >
                    <ShareIcon />
                  </QuickBtn>
                  {shareFileId === file.id && shareUrl && (
                    <ShareBar className="share-popover">
                      <EmailShareButton url={shareUrl} subject={`${file.data.filename} file link`}>
                        <EmailIcon size={28} round />
                      </EmailShareButton>
                      <FacebookShareButton url={shareUrl} hashtag={file.data.filename}>
                        <FacebookIcon size={28} round />
                      </FacebookShareButton>
                      <LinkedinShareButton url={shareUrl} title={`${file.data.filename} file link`}>
                        <LinkedinIcon size={28} round />
                      </LinkedinShareButton>
                      <WhatsappShareButton url={shareUrl} title={`${file.data.filename} file link`}>
                        <WhatsappIcon size={28} round />
                      </WhatsappShareButton>
                    </ShareBar>
                  )}
                </ShareWrap>
                <QuickBtn
                  onClick={() => startRename(file.id, file.data.filename)}
                  title="Rename"
                >
                  <RenameIcon />
                </QuickBtn>
                <QuickBtn
                  $danger
                  onClick={() => handleDelete(file.id, file.data)}
                  title="Delete"
                >
                  <DeleteIcon />
                </QuickBtn>
              </HoverActions>

              <MobileMenu>
                {isOpen ? (
                  <FileRowOptionsMenu
                    file={file}
                    isOpen={isOpen}
                    showShareIcons={showShareIcons}
                    shareUrl={shareUrl}
                    onToggle={() => handleOptionsClick(file.id)}
                    onShareClick={handleShareClick}
                    onCopyLink={handleCopyLink}
                    onRename={startRename}
                    onDelete={handleDelete}
                    menuRef={optionsMenuRef}
                  />
                ) : (
                  <OptionsTrigger
                    className="optionsContainer"
                    title="More options"
                    $active={false}
                    onClick={() => handleOptionsClick(file.id)}
                  >
                    <MoreOptionsIcon />
                  </OptionsTrigger>
                )}
              </MobileMenu>
            </ActionsCol>
          </Row>
        );
      })}
    </TableWrap>
  );
};

/* ─────── layout columns ─────── */
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

/* ─────── table ─────── */
const TableWrap = styled.div`
  width: 100%;
  padding-bottom: 24px;

  .hide-sm { @media (max-width: 640px) { display: none !important; } }
  .hide-md { @media (max-width: 900px) { display: none !important; } }

  @media (max-width: 768px) {
    padding-bottom: var(--mobile-scroll-inset);
    scroll-padding-bottom: var(--mobile-scroll-inset);
  }
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 4px;
  height: 34px;
  border-bottom: 1px solid var(--border-light);
  margin: 0;

  ${NameCol}, ${SizeCol}, ${DateCol} {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0 0 4px;
  height: 52px;
  border-radius: 10px;
  margin: 1px 0;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "transparent")};
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-2);
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
      background: transparent;
    }

    &:active {
      background: var(--surface-2);
    }
  }
`;

/* ─────── name column ─────── */
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

  &:hover { background: #fef9c3; color: #f59e0b; }
  svg { font-size: 17px; }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    margin-top: 2px;

    svg { font-size: 18px; }
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
  svg { font-size: 19px; }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    svg { font-size: 22px; }
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

/* ─────── hover actions (desktop only) ─────── */
const HoverActions = styled.div`
  display: ${(props) => (props.$visible ? "flex" : "none")};
  align-items: center;
  gap: 2px;

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
    background: ${(props) => (props.$danger ? "#fef2f2" : "var(--surface-3)")};
    color: ${(props) => (props.$danger ? "#dc2626" : "var(--primary)")};
  }

  svg { font-size: 17px; }
`;

/* ─────── mobile options menu ─────── */
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

  &:hover { background: var(--surface-3); color: var(--text-2); }
  svg { font-size: 20px; }

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
    background: ${(props) => (props.$danger ? "#fef2f2" : "var(--surface-2)")};
  }

  svg { font-size: 17px; flex-shrink: 0; }
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

  &.show { opacity: 1; visibility: visible; }
`;

export default MainData;

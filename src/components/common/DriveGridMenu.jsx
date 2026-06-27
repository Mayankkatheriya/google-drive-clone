"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  MoreOptionsIcon,
  DownloadIcon,
  CopyIcon,
  ShareIcon,
  RenameIcon,
  DeleteIcon,
  StarBorderIcon,
  StarFilledIcon,
} from "./SvgIcons";
import { changeBytes, convertDates } from "./common";
import { downloadFile, getFileDownloadUrl } from "../../lib/fileAccess";
import { handleRenameFile, handleStarred } from "./firebaseApi";
import { useFileTrashActions } from "@/hooks/useFileTrashActions";
import { useMenuPlacement } from "@/hooks/useMenuPlacement";
import { toast } from "react-toastify";
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

export function DriveGridMenu({
  file,
  isOpen,
  onToggle,
  onRename,
  shareOpen,
  shareUrl,
  onShareClick,
  menuRef,
}) {
  const { confirmMoveToTrash } = useFileTrashActions();
  const triggerRef = useRef(null);
  const { top, right, flip, ready } = useMenuPlacement(triggerRef, menuRef, isOpen);

  const handleCopyLink = async () => {
    try {
      const url = await getFileDownloadUrl(file.data);
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
      onToggle(null);
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleDelete = async () => {
    await confirmMoveToTrash(file.id, file.data);
    onToggle(null);
  };

  return (
    <MenuWrap className="card-actions">
      <MenuTrigger
        ref={triggerRef}
        className="drive-grid-menu-trigger"
        title="More options"
        $active={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(isOpen ? null : file.id);
        }}
      >
        <MoreOptionsIcon />
      </MenuTrigger>

      {isOpen &&
        createPortal(
          <OptionsMenu
            ref={menuRef}
            className="drive-grid-menu"
            $ready={ready}
            $flip={flip}
            style={{ top, right }}
            onClick={(event) => event.stopPropagation()}
          >
            <MenuItem onClick={() => downloadFile(file.data)}>
              <DownloadIcon /> Download
            </MenuItem>
            <MenuItem onClick={handleCopyLink}>
              <CopyIcon /> Copy link
            </MenuItem>
            <MenuItem className="shareButton" onClick={() => onShareClick(file.data)}>
              <ShareIcon /> Share
              <ShareExpand className={shareOpen ? "show" : ""} $flip={flip}>
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
            <MenuItem onClick={() => handleStarred(file.id)}>
              {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
              {file.data.starred ? "Unstar" : "Star"}
            </MenuItem>
            <MenuDivider />
            <MenuItem $danger onClick={handleDelete}>
              <DeleteIcon /> Delete
            </MenuItem>
            <MenuFooter>
              <FooterRow>{changeBytes(file.data.size)}</FooterRow>
              <FooterRow>{convertDates(file.data.timestamp?.seconds)}</FooterRow>
            </MenuFooter>
          </OptionsMenu>,
          document.body
        )}
    </MenuWrap>
  );
}

export function useDriveGridMenuState() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareMenuId, setShareMenuId] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const menuRef = useRef(null);
  const renameInputRef = useRef(null);

  const closeMenu = () => {
    setOpenMenuId(null);
    setShareMenuId(null);
    setShareUrl("");
  };

  const startRename = (id, filename) => {
    closeMenu();
    setRenamingId(id);
    setRenameValue(filename);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const submitRename = async (id, currentFilename) => {
    const success = await handleRenameFile(id, currentFilename, renameValue);
    if (success) cancelRename();
  };

  const handleShareClick = async (fileData, fileId) => {
    if (shareMenuId !== fileId) {
      try {
        const url = await getFileDownloadUrl(fileData);
        setShareUrl(url);
        setShareMenuId(fileId);
      } catch {
        toast.error("Unable to share file");
      }
      return;
    }
    setShareMenuId(null);
    setShareUrl("");
  };

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".drive-grid-menu-trigger") &&
        !event.target.closest(".shareButton")
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("touchstart", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, []);

  const handleToggleMenu = (id) => {
    setOpenMenuId(id);
    if (id !== openMenuId) {
      setShareMenuId(null);
      setShareUrl("");
    }
  };

  return {
    openMenuId,
    setOpenMenuId: handleToggleMenu,
    renamingId,
    renameValue,
    setRenameValue,
    shareMenuId,
    shareUrl,
    menuRef,
    renameInputRef,
    closeMenu,
    startRename,
    cancelRename,
    submitRename,
    handleShareClick,
  };
}

const MenuWrap = styled.div`
  flex-shrink: 0;
  position: relative;

  @media (min-width: 769px) {
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
`;

const MenuTrigger = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "var(--surface)")};
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-2)")};
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }

  svg {
    font-size: 18px;
  }

  @media (min-width: 769px) {
    width: 30px;
    height: 30px;
    box-shadow: var(--shadow-sm);
  }
`;

const OptionsMenu = styled.div`
  position: fixed;
  z-index: 950;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  min-width: 186px;
  padding: 6px;
  opacity: ${(props) => (props.$ready ? 1 : 0)};
  pointer-events: ${(props) => (props.$ready ? "auto" : "none")};
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

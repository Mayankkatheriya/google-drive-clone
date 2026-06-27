"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { handleStarred, handleRenameFile, markFileOpened } from "../common/firebaseApi";
import { useFileTrashActions } from "@/hooks/useFileTrashActions";
import { toast } from "react-toastify";
import LottieImage from "../common/LottieImage";
import { getFileDownloadUrl } from "../../lib/fileAccess";
import { useFilePreview } from "@/context/FilePreviewContext";
import { getUploadHelpText } from "@/lib/uploadLimits";
import MainDataRow, { NameCol, SizeCol, DateCol, ActionsCol } from "./MainDataRow";

const MainData = ({ files }) => {
  const [showShareIcons, setShowShareIcons] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareFileId, setShareFileId] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const optionsMenuRef = useRef(null);
  const renameInputRef = useRef(null);
  const nameClickTimerRef = useRef(null);
  const { open: openPreview } = useFilePreview();
  const { confirmMoveToTrash } = useFileTrashActions();

  useEffect(() => {
    return () => {
      if (nameClickTimerRef.current) {
        clearTimeout(nameClickTimerRef.current);
      }
    };
  }, []);

  const openFilePreview = useCallback(
    (file) => {
      markFileOpened(file.id);
      openPreview(
        file.data,
        files.map((item) => item.data)
      );
    },
    [files, openPreview]
  );

  const startRename = useCallback((id, filename) => {
    setOptionsVisible(null);
    setShareFileId(null);
    setRenamingId(id);
    setRenameValue(filename);
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenameValue("");
  }, []);

  const submitRename = useCallback(
    async (id, currentFilename) => {
      const success = await handleRenameFile(id, currentFilename, renameValue);
      if (success) {
        cancelRename();
      }
    },
    [renameValue, cancelRename]
  );

  const handleDelete = useCallback(
    async (id, data) => {
      await confirmMoveToTrash(id, data);
      setOptionsVisible(null);
    },
    [confirmMoveToTrash]
  );

  const handleOptionsClick = useCallback((id) => {
    setOptionsVisible((prev) => (prev === id ? null : id));
    setShareFileId(null);
    setShowShareIcons(false);
    setShareUrl("");
  }, []);

  const handleShareClick = useCallback(async (fileData) => {
    if (!showShareIcons) {
      try {
        const url = await getFileDownloadUrl(fileData);
        setShareUrl(url);
        setShowShareIcons(true);
      } catch {
        toast.error("Unable to share file");
      }
      return;
    }
    setShowShareIcons(false);
    setShareUrl("");
  }, [showShareIcons]);

  const handleQuickShare = useCallback(async (file) => {
    if (shareFileId === file.id) {
      setShareFileId(null);
      setShareUrl("");
      return;
    }

    try {
      const url = await getFileDownloadUrl(file.data);
      setShareUrl(url);
      setShareFileId(file.id);
    } catch {
      toast.error("Unable to share file");
    }
  }, [shareFileId]);

  const handleCopyLink = useCallback(async (fileData) => {
    try {
      const url = await getFileDownloadUrl(fileData);
      await navigator.clipboard.writeText(url);
      toast.success("Link Copied");
    } catch {
      toast.error("Unable to copy link");
    }
  }, []);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

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
        const isMenuOpen = optionsVisible === file.id;
        const isRenaming = renamingId === file.id;
        const isShareOpen = shareFileId === file.id;

        return (
          <MainDataRow
            key={file.id}
            file={file}
            files={files}
            isMenuOpen={isMenuOpen}
            isRenaming={isRenaming}
            renameValue={isRenaming ? renameValue : ""}
            renameInputRef={isRenaming ? renameInputRef : undefined}
            isShareOpen={isShareOpen}
            shareUrl={isShareOpen || isMenuOpen ? shareUrl : ""}
            showShareIcons={isMenuOpen && showShareIcons}
            optionsMenuRef={isMenuOpen ? optionsMenuRef : undefined}
            onStar={() => handleStarred(file.id)}
            onNameClick={(event) => {
              event.stopPropagation();
              if (nameClickTimerRef.current) {
                clearTimeout(nameClickTimerRef.current);
              }
              nameClickTimerRef.current = setTimeout(() => {
                openFilePreview(file);
                nameClickTimerRef.current = null;
              }, 250);
            }}
            onNameDoubleClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (nameClickTimerRef.current) {
                clearTimeout(nameClickTimerRef.current);
                nameClickTimerRef.current = null;
              }
              startRename(file.id, file.data.filename);
            }}
            onRenameChange={(event) => setRenameValue(event.target.value)}
            onRenameBlur={() => submitRename(file.id, file.data.filename)}
            onRenameKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitRename(file.id, file.data.filename);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancelRename();
              }
            }}
            onCopyLink={handleCopyLink}
            onQuickShare={() => handleQuickShare(file)}
            onRenameStart={() => startRename(file.id, file.data.filename)}
            onRename={startRename}
            onDelete={() => handleDelete(file.id, file.data)}
            onOptionsToggle={() => handleOptionsClick(file.id)}
            onShareClick={handleShareClick}
          />
        );
      })}
    </TableWrap>
  );
};

const TableWrap = styled.div`
  width: 100%;
  padding-bottom: 24px;

  .hide-sm {
    @media (max-width: 640px) {
      display: none !important;
    }
  }

  .hide-md {
    @media (max-width: 900px) {
      display: none !important;
    }
  }

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

export default MainData;

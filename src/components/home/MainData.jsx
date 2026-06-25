"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  MoreOptionsIcon,
  StarFilledIcon,
  StarBorderIcon,
  DownloadIcon,
  CopyIcon,
  DeleteIcon,
  ShareIcon,
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
import { handleStarred } from "../common/firebaseApi";
import { toast } from "react-toastify";
import LottieImage from "../common/LottieImage";
import SecureFileLink from "../common/SecureFileLink";
import { downloadFile, getFileDownloadUrl } from "../../lib/fileAccess";

function getTypeStyle(contentType) {
  if (contentType?.includes("pdf"))   return { bg: "#fef2f2", color: "#dc2626", ext: "PDF" };
  if (contentType?.includes("image")) return { bg: "#faf5ff", color: "#7c3aed", ext: "IMG" };
  if (contentType?.includes("video")) return { bg: "#eff6ff", color: "#2563eb", ext: "VID" };
  if (contentType?.includes("audio")) return { bg: "#fff7ed", color: "#ea580c", ext: "AUD" };
  return { bg: "#f1f5f9", color: "#475569", ext: "DOC" };
}

const MainData = ({
  files,
  handleOptionsClick,
  optionsVisible,
  handleDelete,
}) => {
  const [showShareIcons, setShowShareIcons] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const optionsMenuRef = useRef(null);

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
  }, [optionsVisible]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target) &&
        !event.target.closest(".optionsContainer") &&
        !event.target.closest(".shareButton")
      ) {
        setShowShareIcons(false);
        handleOptionsClick(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [handleOptionsClick]);

  if (files.length === 0) {
    return (
      <LottieImage
        imagePath="/homePage.svg"
        text1="A place for all of your files"
        text2="Use the 'New' button to upload"
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
            onMouseLeave={() => setHoveredRow(null)}
          >
            <NameCol>
              <StarBtn
                onClick={() => handleStarred(file.id)}
                $starred={file.data.starred}
                title={file.data.starred ? "Unstar" : "Star"}
              >
                {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
              </StarBtn>

              <SecureFileLink
                fileData={file.data}
                files={files}
                style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}
              >
                <FileIconWrap style={{ background: bg }}>
                  <span style={{ color, display: "flex" }}>
                    <FileIcons type={file.data.contentType} />
                  </span>
                </FileIconWrap>
                <FileName title={file.data.filename}>{file.data.filename}</FileName>
              </SecureFileLink>
            </NameCol>

            <SizeCol className="hide-sm">
              <MetaText>{changeBytes(file.data.size)}</MetaText>
            </SizeCol>

            <DateCol className="hide-md">
              <MetaText>{convertDates(file.data.timestamp?.seconds)}</MetaText>
            </DateCol>

            <ActionsCol>
              {/* Hover quick actions */}
              <QuickActions $visible={isHovered && !isOpen}>
                <QuickBtn
                  onClick={() => downloadFile(file.data)}
                  title="Download"
                >
                  <DownloadIcon />
                </QuickBtn>
                <QuickBtn
                  onClick={() => handleCopyLink(file.data)}
                  title="Copy Link"
                >
                  <CopyIcon />
                </QuickBtn>
                <QuickBtn
                  $danger
                  onClick={() => handleDelete(file.id, file.data)}
                  title="Delete"
                >
                  <DeleteIcon />
                </QuickBtn>
              </QuickActions>

              {/* More options trigger */}
              <OptionsWrap $visible={!isHovered || isOpen}>
                <OptionsTrigger
                  className="optionsContainer"
                  title="More options"
                  $active={isOpen}
                  onClick={() => handleOptionsClick(file.id)}
                >
                  <MoreOptionsIcon />
                </OptionsTrigger>

                {isOpen && (
                  <OptionsMenu ref={optionsMenuRef}>
                    <MenuItem onClick={() => downloadFile(file.data)}>
                      <DownloadIcon /> Download
                    </MenuItem>
                    <MenuItem onClick={() => handleCopyLink(file.data)}>
                      <CopyIcon /> Copy Link
                    </MenuItem>
                    <MenuItem
                      className="shareButton"
                      onClick={() => handleShareClick(file.data)}
                    >
                      <ShareIcon /> Share
                      <ShareExpand className={showShareIcons ? "show" : ""}>
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
                    <MenuItem $danger onClick={() => handleDelete(file.id, file.data)}>
                      <DeleteIcon /> Delete
                    </MenuItem>
                    <MenuFooter>
                      <FooterRow>{changeBytes(file.data.size)}</FooterRow>
                      <FooterRow>{convertDates(file.data.timestamp?.seconds)}</FooterRow>
                    </MenuFooter>
                  </OptionsMenu>
                )}
              </OptionsWrap>
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
  flex: 0 0 120px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
`;

/* ─────── table ─────── */
const TableWrap = styled.div`
  width: 100%;
  padding-bottom: 24px;

  .hide-sm { @media (max-width: 640px) { display: none !important; } }
  .hide-md { @media (max-width: 900px) { display: none !important; } }
`;

const TableHead = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  height: 34px;
  border-bottom: 1px solid var(--border-light);
  margin: 0 8px;

  ${NameCol}, ${SizeCol}, ${DateCol} {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px 0 8px;
  height: 52px;
  border-radius: 10px;
  margin: 1px 8px;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "transparent")};
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-2);
  }
`;

/* ─────── name column ─────── */
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
`;

const FileName = styled.span`
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const MetaText = styled.span`
  font-size: 0.82rem;
  color: var(--text-3);
`;

/* ─────── quick actions (appear on hover) ─────── */
const QuickActions = styled.div`
  display: ${(props) => (props.$visible ? "flex" : "none")};
  align-items: center;
  gap: 2px;
`;

const QuickBtn = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.$danger ? "#ef4444" : "var(--text-2)")};
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#fef2f2" : "var(--surface-3)")};
    color: ${(props) => (props.$danger ? "#dc2626" : "var(--primary)")};
  }

  svg { font-size: 17px; }
`;

/* ─────── options menu ─────── */
const OptionsWrap = styled.div`
  position: relative;
  display: ${(props) => (props.$visible ? "flex" : "none")};
  align-items: center;
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
  top: -52px;
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

"use client";

import React from "react";
import styled from "styled-components";
import FileIcons from "./FileIcons";
import { changeBytes, convertDates } from "./common";
import SecureFileLink from "./SecureFileLink";
import { handleDeleteFromTrash, handleStarred } from "./firebaseApi";
import { DeleteIcon, StarBorderIcon, StarFilledIcon, DownloadIcon } from "./SvgIcons";
import LottieImage from "./LottieImage";
import { motion } from "framer-motion";
import { downloadFile } from "../../lib/fileAccess";

function getTypeStyle(contentType, filename) {
  const ext = filename?.split(".").pop()?.toUpperCase().slice(0, 4) || "";
  if (contentType?.includes("pdf"))   return { bg: "#fef2f2", color: "#dc2626", label: "PDF" };
  if (contentType?.includes("png"))   return { bg: "#faf5ff", color: "#7c3aed", label: "PNG" };
  if (contentType?.includes("gif"))   return { bg: "#fdf4ff", color: "#a855f7", label: "GIF" };
  if (contentType?.includes("webp"))  return { bg: "#faf5ff", color: "#7c3aed", label: "WEBP" };
  if (contentType?.includes("image")) return { bg: "#faf5ff", color: "#7c3aed", label: ext || "IMG" };
  if (contentType?.includes("mp4"))   return { bg: "#eff6ff", color: "#2563eb", label: "MP4" };
  if (contentType?.includes("video")) return { bg: "#eff6ff", color: "#2563eb", label: ext || "VID" };
  if (contentType?.includes("mp3"))   return { bg: "#fff7ed", color: "#ea580c", label: "MP3" };
  if (contentType?.includes("audio")) return { bg: "#fff7ed", color: "#ea580c", label: ext || "AUD" };
  return { bg: "#f1f5f9", color: "#475569", label: ext || "FILE" };
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const FilesList = ({ data, page = null, imagePath, text1, text2 }) => {
  if (data.length === 0) {
    return <LottieImage imagePath={imagePath} text1={text1} text2={text2} />;
  }

  return (
    <Grid variants={container} initial="hidden" animate="show">
      {data.map((file) => {
        const { bg, color, label } = getTypeStyle(file.data.contentType, file.data.filename);
        return (
          <Card key={file.id} variants={item}>
            {page === "starred" && (
              <StarBtn
                onClick={() => handleStarred(file.id)}
                $starred={file.data.starred}
                title={file.data.starred ? "Unstar" : "Star"}
              >
                {file.data.starred ? <StarFilledIcon /> : <StarBorderIcon />}
              </StarBtn>
            )}

            <SecureFileLink
              fileData={file.data}
              files={data}
              style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              <CardIcon style={{ background: bg }}>
                <span style={{ color, display: "flex" }}>
                  <FileIcons type={file.data.contentType} />
                </span>
                <ExtBadge style={{ background: color + "22", color }}>
                  {label}
                </ExtBadge>
              </CardIcon>

              <CardBody>
                <CardName title={file.data.filename}>{file.data.filename}</CardName>
                <CardMeta>{changeBytes(file.data.size)}</CardMeta>
              </CardBody>
            </SecureFileLink>

            {page === "trash" ? (
              <DeleteBtn onClick={() => handleDeleteFromTrash(file.id, file.data)}>
                <DeleteIcon />
                Delete permanently
              </DeleteBtn>
            ) : page !== "starred" && (
              <HoverActions className="hover-actions">
                <ActionBtn
                  onClick={(e) => { e.stopPropagation(); downloadFile(file.data); }}
                  title="Download"
                >
                  <DownloadIcon />
                </ActionBtn>
                <ActionBtn
                  $danger
                  onClick={(e) => { e.stopPropagation(); handleDeleteFromTrash(file.id, file.data); }}
                  title="Delete"
                >
                  <DeleteIcon />
                </ActionBtn>
              </HoverActions>
            )}
          </Card>
        );
      })}
    </Grid>
  );
};

const Grid = styled(motion.div)`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
  padding: 20px 16px 28px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 10px;
    padding: 14px 12px 20px;
  }
`;

const Card = styled(motion.div)`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--primary);
    box-shadow:
      0 8px 24px rgba(37, 99, 235, 0.1),
      0 2px 8px rgba(15, 23, 42, 0.06);
    transform: translateY(-3px);
  }

  &:hover .hover-actions {
    opacity: 1;
  }
`;

const CardIcon = styled.div`
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  svg {
    font-size: 52px;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
  }
`;

const ExtBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.6px;
  padding: 2px 6px;
  border-radius: 5px;
`;

const CardBody = styled.div`
  padding: 10px 12px 12px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-2);
`;

const CardName = styled.p`
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
`;

const CardMeta = styled.span`
  font-size: 0.72rem;
  color: var(--text-3);
`;

const HoverActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border-top: 1px solid var(--border-light);
  background: var(--surface-2);
  opacity: 0;
  transition: opacity 0.15s ease;
`;

const ActionBtn = styled.button`
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

const StarBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.88);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: ${(props) => (props.$starred ? "#f59e0b" : "#cbd5e1")};
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);

  &:hover { background: #fef9c3; color: #f59e0b; }
  svg { font-size: 14px; }
`;

const DeleteBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px;
  background: var(--surface);
  border: none;
  border-top: 1px solid #fee2e2;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: background 0.15s ease;

  svg { font-size: 15px; }
  &:hover { background: #fef2f2; }
`;

export default FilesList;

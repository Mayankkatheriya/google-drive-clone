"use client";

import React from "react";
import styled from "styled-components";
import FileIcons from "../common/FileIcons";
import SecureFileLink from "../common/SecureFileLink";
import { changeBytes } from "../common/common";

function getTypeStyle(contentType) {
  if (contentType?.includes("pdf"))   return { bg: "#fef2f2", color: "#dc2626" };
  if (contentType?.includes("image")) return { bg: "#faf5ff", color: "#7c3aed" };
  if (contentType?.includes("video")) return { bg: "#eff6ff", color: "#2563eb" };
  if (contentType?.includes("audio")) return { bg: "#fff7ed", color: "#ea580c" };
  return { bg: "#f1f5f9", color: "#475569" };
}

const RecentDataGrid = ({ files }) => {
  if (!files?.length) return null;

  return (
    <ScrollArea>
      <Strip>
        {files.slice(0, 6).map((file) => {
          const { bg, color } = getTypeStyle(file.data.contentType);
          return (
            <SecureFileLink key={file.id} fileData={file.data} files={files} as={QuickCard}>
              <QuickIcon style={{ background: bg }}>
                <span style={{ color, display: "flex" }}>
                  <FileIcons type={file.data.contentType} />
                </span>
              </QuickIcon>
              <QuickMeta>
                <QuickName title={file.data.filename}>{file.data.filename}</QuickName>
                <QuickSize>{changeBytes(file.data.size)}</QuickSize>
              </QuickMeta>
            </SecureFileLink>
          );
        })}
      </Strip>
    </ScrollArea>
  );
};

const ScrollArea = styled.div`
  overflow-x: auto;
  padding: 0 0 4px;

  /* hide scrollbar on desktop, show on mobile */
  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }

  @media (max-width: 640px) {
    display: none;
  }
`;

const Strip = styled.div`
  display: flex;
  gap: 12px;
  min-width: max-content;
`;

const QuickCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 14px 10px 10px;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  text-decoration: none;
  min-width: 190px;
  max-width: 230px;
  flex-shrink: 0;
  outline: none;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.1);
  }

  &:focus-visible {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }
`;

const QuickIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { font-size: 22px; }
`;

const QuickMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const QuickName = styled.p`
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const QuickSize = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 2px;
`;

export default RecentDataGrid;

"use client";

import React from "react";
import styled from "styled-components";
import FileIcons from "../common/FileIcons";
import SecureFileLink from "../common/SecureFileLink";
import { changeBytes } from "../common/common";

function getTypeStyle(contentType) {
  if (contentType?.includes("pdf"))
    return { tile: "#fce8e6", icon: "#d93025" };
  if (contentType?.includes("image"))
    return { tile: "#e8eaf6", icon: "#5c6bc0" };
  if (contentType?.includes("video"))
    return { tile: "#e3f2fd", icon: "#1e88e5" };
  if (contentType?.includes("audio"))
    return { tile: "#fff3e0", icon: "#ef6c00" };
  return { tile: "#f1f3f4", icon: "#5f6368" };
}

const RecentDataGrid = ({ files }) => {
  if (!files?.length) return null;

  return (
    <ScrollArea>
      <Strip>
        {files.slice(0, 6).map((file) => {
          const { tile, icon } = getTypeStyle(file.data.contentType);
          return (
            <SecureFileLink key={file.id} fileData={file.data} files={files} as={QuickCard}>
              <QuickIcon style={{ background: tile, color: icon }}>
                <FileIcons type={file.data.contentType} />
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
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 999px;
  }

  @media (max-width: 768px) {
    margin: 0 -4px;
    padding: 0 4px 4px;
  }
`;

const Strip = styled.div`
  display: flex;
  gap: 10px;
  min-width: max-content;
`;

const QuickCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 16px 10px 10px;
  cursor: pointer;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
  text-decoration: none;
  min-width: 200px;
  max-width: 240px;
  flex-shrink: 0;
  outline: none;
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--primary-subtle);
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }

  @media (max-width: 768px) {
    min-width: 170px;
    max-width: 190px;
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

  svg {
    font-size: 22px;
  }
`;

const QuickMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const QuickName = styled.p`
  font-size: 0.84rem;
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

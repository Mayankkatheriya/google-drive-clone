"use client";

import React, { memo } from "react";
import styled from "styled-components";
import FileIcons from "../common/FileIcons";
import SecureFileLink from "../common/SecureFileLink";
import { changeBytes } from "../common/common";

function getTypeStyle(contentType, filename) {
  const ext = filename?.split(".").pop()?.toUpperCase().slice(0, 4) || "";
  if (contentType?.includes("pdf"))
    return { tile: "#fce8e6", icon: "#d93025", label: "PDF" };
  if (contentType?.includes("image"))
    return { tile: "#e8eaf6", icon: "#5c6bc0", label: ext || "IMG" };
  if (contentType?.includes("video"))
    return { tile: "#e3f2fd", icon: "#1e88e5", label: ext || "VID" };
  if (contentType?.includes("audio"))
    return { tile: "#fff3e0", icon: "#ef6c00", label: ext || "AUD" };
  return { tile: "#f1f3f4", icon: "#5f6368", label: ext || "FILE" };
}

const QuickAccessTile = memo(function QuickAccessTile({ file, allFiles }) {
  const { tile, icon, label } = getTypeStyle(
    file.data.contentType,
    file.data.filename
  );

  return (
    <SecureFileLink
      fileData={file.data}
      fileId={file.id}
      files={allFiles}
      as={Tile}
    >
      <IconWrap style={{ background: tile, color: icon }}>
        <FileIcons type={file.data.contentType} />
      </IconWrap>
      <TileBody>
        <TileName title={file.data.filename}>{file.data.filename}</TileName>
        <TileMeta>
          <TypeTag>{label}</TypeTag>
          <span>{changeBytes(file.data.size)}</span>
        </TileMeta>
      </TileBody>
    </SecureFileLink>
  );
});

const RecentDataGrid = ({ files, allFiles = files }) => {
  if (!files?.length) return null;

  return (
    <Grid>
      {files.map((file) => (
        <QuickAccessTile key={file.id} file={file} allFiles={allFiles} />
      ))}
    </Grid>
  );
};

const Grid = styled.div`
  @media (max-width: 768px) {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 0 16px;
    scroll-padding: 0 16px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: var(--primary-subtle);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &:focus-visible {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }

  @media (max-width: 768px) {
    flex: 0 0 148px;
    width: 148px;
    min-width: 148px;
    padding: 12px;
  }

  @media (min-width: 769px) {
    padding: 14px 12px 12px;
  }
`;

const IconWrap = styled.div`
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

const TileBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TileName = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const TileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 0.68rem;
  color: var(--text-3);

  span:last-child {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TypeTag = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.35px;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--surface-3);
  color: var(--text-2);
  flex-shrink: 0;
`;

export default RecentDataGrid;

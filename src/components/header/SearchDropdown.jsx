"use client";

import { useEffect, useMemo } from "react";
import styled from "styled-components";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useMyFiles } from "@/context/FilesContext";
import { searchFiles } from "@/lib/searchFiles";
import { changeBytes, convertDates } from "../common/common";
import FileIcons from "../common/FileIcons";

const DROPDOWN_LIMIT = 6;

function highlightMatch(text, query) {
  if (!query?.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function getTypeStyle(contentType) {
  if (contentType?.includes("pdf")) return { bg: "#fef2f2", color: "#dc2626" };
  if (contentType?.includes("image")) return { bg: "#faf5ff", color: "#7c3aed" };
  if (contentType?.includes("video")) return { bg: "#eff6ff", color: "#2563eb" };
  if (contentType?.includes("audio")) return { bg: "#fff7ed", color: "#ea580c" };
  return { bg: "var(--surface-3)", color: "var(--text-2)" };
}

export default function SearchDropdown({
  query,
  showAll,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  onShowAll,
  onResultsChange,
}) {
  const files = useMyFiles();

  const results = useMemo(() => searchFiles(files, query), [files, query]);
  const dropdownResults = showAll ? results : results.slice(0, DROPDOWN_LIMIT);
  const hasMore = !showAll && results.length > DROPDOWN_LIMIT;

  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  if (dropdownResults.length === 0) {
    return (
      <EmptyState>
        <SearchOutlinedIcon />
        <p>No files match &ldquo;{query}&rdquo;</p>
        <span>Try a different name or type like pdf, image, mp4</span>
      </EmptyState>
    );
  }

  return (
    <>
      <DropdownLabel>
        {results.length} result{results.length !== 1 ? "s" : ""}
      </DropdownLabel>
      {dropdownResults.map((file, index) => {
        const { bg, color } = getTypeStyle(file.data.contentType);
        return (
          <ResultRow
            key={file.id}
            type="button"
            $active={index === activeIndex}
            onMouseEnter={() => onActiveIndexChange(index)}
            onClick={() => onSelect(file, results)}
          >
            <ResultIcon style={{ background: bg }}>
              <span style={{ color, display: "flex" }}>
                <FileIcons type={file.data.contentType} />
              </span>
            </ResultIcon>
            <ResultMeta>
              <ResultName>
                {highlightMatch(file.data.filename, query)}
              </ResultName>
              <ResultSub>
                {changeBytes(file.data.size)}
                {file.data.timestamp?.seconds && (
                  <> · {convertDates(file.data.timestamp.seconds)}</>
                )}
              </ResultSub>
            </ResultMeta>
          </ResultRow>
        );
      })}
      {hasMore && (
        <SeeAllBtn type="button" onClick={onShowAll}>
          See all {results.length} results
        </SeeAllBtn>
      )}
    </>
  );
}

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 20px;
  text-align: center;
  color: var(--text-3);

  svg {
    font-size: 32px;
    opacity: 0.5;
  }

  p {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-2);
  }

  span {
    font-size: 0.78rem;
    line-height: 1.45;
  }
`;

const DropdownLabel = styled.p`
  padding: 8px 14px 4px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-3);
`;

const ResultRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: ${(p) => (p.$active ? "var(--primary-light)" : "transparent")};
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;

  &:hover {
    background: var(--surface-2);
  }

  mark {
    background: rgba(37, 99, 235, 0.18);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }
`;

const ResultIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ResultMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const ResultName = styled.p`
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultSub = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 2px;
`;

const SeeAllBtn = styled.button`
  width: calc(100% - 16px);
  margin: 6px 8px 8px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--surface-2);
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--primary-light);
  }
`;

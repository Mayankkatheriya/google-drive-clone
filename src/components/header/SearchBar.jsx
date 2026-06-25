"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { SearchIcons, CloseIcon } from "../common/SvgIcons";
import { useMyFiles } from "@/context/FilesContext";
import { useFilePreview } from "@/context/FilePreviewContext";
import { searchFiles } from "@/lib/searchFiles";
import { changeBytes, convertDates } from "../common/common";
import FileIcons from "../common/FileIcons";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

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

const SearchBar = ({ variant = "desktop", onClose }) => {
  const files = useMyFiles();
  const { open: openPreview } = useFilePreview();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(
    () => searchFiles(files, debouncedQuery),
    [files, debouncedQuery]
  );

  const dropdownResults = showAll ? results : results.slice(0, DROPDOWN_LIMIT);
  const hasMore = !showAll && results.length > DROPDOWN_LIMIT;

  const resetSearch = () => {
    setOpen(false);
    setShowAll(false);
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(-1);
    onClose?.();
  };

  const handleSelect = (file) => {
    openPreview(
      file.data,
      results.map((item) => item.data)
    );
    resetSearch();
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, []);

  useEffect(() => {
    if (variant === "mobile" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [variant]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      onClose?.();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && dropdownResults[activeIndex]) {
        handleSelect(dropdownResults[activeIndex]);
      } else if (dropdownResults[0]) {
        handleSelect(dropdownResults[0]);
      }
      return;
    }

    if (!open || dropdownResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, dropdownResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  };

  const showDropdown = open && debouncedQuery.trim().length > 0;

  return (
    <Wrap ref={wrapRef} $variant={variant}>
      <InputShell $focused={open}>
        <SearchOutlinedIcon className="search-icon" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setShowAll(false);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search files by name, type, or extension…"
          aria-label="Search files"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <ClearBtn
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setOpen(false);
              setShowAll(false);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <CloseIcon />
          </ClearBtn>
        )}
        <SearchBtn
          type="button"
          onClick={() => {
            if (!query.trim()) return;
            setOpen(true);
            setShowAll(true);
          }}
          aria-label="Show all search results"
          disabled={!query.trim()}
        >
          <SearchIcons />
        </SearchBtn>
      </InputShell>

      {showDropdown && (
        <Dropdown>
          {dropdownResults.length === 0 ? (
            <EmptyState>
              <SearchOutlinedIcon />
              <p>No files match &ldquo;{debouncedQuery}&rdquo;</p>
              <span>Try a different name or type like pdf, image, mp4</span>
            </EmptyState>
          ) : (
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
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(file)}
                  >
                    <ResultIcon style={{ background: bg }}>
                      <span style={{ color, display: "flex" }}>
                        <FileIcons type={file.data.contentType} />
                      </span>
                    </ResultIcon>
                    <ResultMeta>
                      <ResultName>
                        {highlightMatch(file.data.filename, debouncedQuery)}
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
                <SeeAllBtn type="button" onClick={() => setShowAll(true)}>
                  See all {results.length} results
                </SeeAllBtn>
              )}
            </>
          )}
        </Dropdown>
      )}
    </Wrap>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: ${(p) => (p.$variant === "mobile" ? "100%" : "560px")};
  margin: ${(p) => (p.$variant === "mobile" ? "0" : "0 auto")};
  width: 100%;
`;

const InputShell = styled.div`
  display: flex;
  align-items: center;
  height: 46px;
  background: var(--surface-3);
  border-radius: 999px;
  padding: 0 6px 0 14px;
  border: 1.5px solid ${(p) => (p.$focused ? "var(--primary)" : "transparent")};
  transition: all 0.2s ease;
  gap: 4px;

  &:focus-within {
    background: var(--surface);
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }

  .search-icon {
    font-size: 20px;
    color: var(--text-3);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.95rem;
    color: var(--text-1);

    &::placeholder {
      color: var(--text-3);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
`;

const ClearBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-3);
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--border);
    color: var(--text-2);
  }

  svg { font-size: 18px; }
`;

const SearchBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 999px;
  color: var(--text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--border);
    color: var(--primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  svg { font-size: 20px; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
  animation: ${fadeIn} 0.15s ease;
  max-height: min(420px, 70vh);
  overflow-y: auto;
`;

const DropdownLabel = styled.p`
  padding: 10px 14px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-3);
`;

const ResultRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: ${(p) => (p.$active ? "var(--primary-light)" : "transparent")};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;

  &:hover {
    background: var(--primary-light);
  }

  mark {
    background: var(--primary-subtle);
    color: var(--primary-hover);
    border-radius: 2px;
    padding: 0 1px;
  }
`;

const ResultIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { font-size: 20px; }
`;

const ResultMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const ResultName = styled.p`
  font-size: 0.875rem;
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
  width: 100%;
  padding: 12px 14px;
  background: var(--surface-2);
  border: none;
  border-top: 1px solid var(--border-light);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease;

  &:hover {
    background: var(--primary-light);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 20px;
  text-align: center;

  svg {
    font-size: 32px;
    color: var(--text-3);
    opacity: 0.6;
  }

  p {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-1);
  }

  span {
    font-size: 0.78rem;
    color: var(--text-3);
    max-width: 260px;
    line-height: 1.4;
  }
`;

export default SearchBar;

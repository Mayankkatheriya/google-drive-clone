"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { SearchIcons, CloseIcon } from "../common/SvgIcons";
import { useFilePreview } from "@/context/FilePreviewContext";
import SearchDropdown from "./SearchDropdown";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const SearchBar = ({ variant = "desktop", onClose }) => {
  const { open: openPreview } = useFilePreview();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState([]);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const dropdownResults = showAll
    ? searchResults
    : searchResults.slice(0, 6);

  const resetSearch = useCallback(() => {
    setOpen(false);
    setShowAll(false);
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(-1);
    setSearchResults([]);
    onClose?.();
  }, [onClose]);

  const handleSelect = useCallback(
    (file, results) => {
      openPreview(
        file.data,
        results.map((item) => item.data)
      );
      resetSearch();
    },
    [openPreview, resetSearch]
  );

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
        handleSelect(dropdownResults[activeIndex], searchResults);
      } else if (dropdownResults[0]) {
        handleSelect(dropdownResults[0], searchResults);
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
          <SearchDropdown
            query={debouncedQuery}
            showAll={showAll}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onSelect={handleSelect}
            onShowAll={() => setShowAll(true)}
            onResultsChange={setSearchResults}
          />
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

export default SearchBar;

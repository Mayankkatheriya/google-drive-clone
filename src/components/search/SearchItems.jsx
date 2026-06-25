"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useMyFiles } from "@/context/FilesContext";
import FilesList from "../common/FilesList";
import { useParams } from "next/navigation";
import {
  filterSearchResults,
  getSearchFilters,
  searchFiles,
} from "@/lib/searchFiles";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Page } from "../common/PageShell";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Images" },
  { id: "pdf", label: "PDFs" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "other", label: "Other" },
];

const SearchItems = () => {
  const files = useMyFiles();
  const params = useParams();
  const [activeFilter, setActiveFilter] = useState("all");

  const query = useMemo(() => {
    const raw = params.query;
    const value = Array.isArray(raw) ? raw[0] : raw;
    try {
      return decodeURIComponent(value || "");
    } catch {
      return value || "";
    }
  }, [params.query]);

  const allResults = useMemo(() => searchFiles(files, query), [files, query]);
  const filterCounts = useMemo(
    () => getSearchFilters(files, query),
    [files, query]
  );

  const data = useMemo(
    () => filterSearchResults(allResults, activeFilter),
    [allResults, activeFilter]
  );

  useEffect(() => {
    setActiveFilter("all");
  }, [query]);

  return (
    <Page>
      <SearchHeader>
          <SearchIconWrap>
            <SearchOutlinedIcon />
          </SearchIconWrap>
          <HeaderText>
            <QueryText>&ldquo;{query}&rdquo;</QueryText>
            <ResultCount>
              {allResults.length} result{allResults.length !== 1 ? "s" : ""} in My Drive
            </ResultCount>
          </HeaderText>
        </SearchHeader>

        {allResults.length > 0 && (
          <FilterRow>
            {FILTERS.map(({ id, label }) => {
              const count = filterCounts[id];
              if (id !== "all" && count === 0) return null;
              return (
                <FilterChip
                  key={id}
                  type="button"
                  $active={activeFilter === id}
                  onClick={() => setActiveFilter(id)}
                >
                  {label}
                  <ChipCount>{count}</ChipCount>
                </FilterChip>
              );
            })}
          </FilterRow>
        )}

        <FilesList
          data={data}
          imagePath={"/search.svg"}
          text1={"No matching results"}
          text2={
            activeFilter === "all"
              ? "Try another name, extension, or type like pdf or image"
              : `No ${activeFilter} files match this search`
          }
        />
    </Page>
  );
};

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px 16px;

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
  }
`;

const SearchIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 22px;
    color: var(--primary);
  }
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const QueryText = styled.h1`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultCount = styled.p`
  font-size: 0.82rem;
  color: var(--text-3);
  margin-top: 2px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 14px 24px 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    padding: 8px 16px 4px;
  }
`;

const FilterChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid ${(p) => (p.$active ? "var(--primary)" : "var(--border)")};
  background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface)")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const ChipCount = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--surface-3);
  color: inherit;
  opacity: 0.85;
`;

export default SearchItems;

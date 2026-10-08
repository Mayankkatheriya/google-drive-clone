"use client";

import styled from "styled-components";

export const DRIVE_TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "folders", label: "Folders" },
  { id: "files", label: "Files" },
];

export default function DriveTypeFilter({
  value = "all",
  onChange,
  folderCount = 0,
  fileCount = 0,
}) {
  const counts = {
    all: folderCount + fileCount,
    folders: folderCount,
    files: fileCount,
  };

  return (
    <ChipRow role="tablist" aria-label="Filter by type" data-tour="type-filter">
      {DRIVE_TYPE_FILTERS.map((item) => {
        const count = counts[item.id] ?? 0;
        return (
          <Chip
            key={item.id}
            type="button"
            role="tab"
            aria-selected={value === item.id}
            $active={value === item.id}
            onClick={() => onChange?.(item.id)}
          >
            {item.label}
            <Count $active={value === item.id}>{count}</Count>
          </Chip>
        );
      })}
    </ChipRow>
  );
}

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 0 10px;
    padding: 0 16px 2px;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Chip = styled.button`
  height: 32px;
  padding: 0 12px 0 14px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(p) =>
    p.$active ? "var(--primary-light)" : "var(--surface)"};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition),
    box-shadow var(--transition);

  &:hover {
    border-color: var(--primary-subtle);
    color: var(--primary);
  }

  ${(p) =>
    p.$active &&
    `
    box-shadow: 0 0 0 1px var(--primary-subtle);
  `}
`;

const Count = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  background: ${(p) =>
    p.$active ? "var(--primary)" : "var(--surface-3)"};
  color: ${(p) => (p.$active ? "#fff" : "var(--text-3)")};
`;

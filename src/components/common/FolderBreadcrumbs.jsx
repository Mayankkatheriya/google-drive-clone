"use client";

import styled from "styled-components";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";

export default function FolderBreadcrumbs({ crumbs = [], onNavigate }) {
  return (
    <Nav aria-label="Folder path">
      <Crumb
        type="button"
        $root
        $current={crumbs.length === 0}
        onClick={() => onNavigate(null)}
        aria-current={crumbs.length === 0 ? "page" : undefined}
      >
        <FolderOutlinedIcon />
        My Drive
      </Crumb>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <CrumbGroup key={crumb.id}>
            <Sep aria-hidden>
              <ChevronRightRoundedIcon />
            </Sep>
            <Crumb
              type="button"
              $current={isLast}
              onClick={() => !isLast && onNavigate(crumb.id)}
              disabled={isLast}
              aria-current={isLast ? "page" : undefined}
            >
              {crumb.name}
            </Crumb>
          </CrumbGroup>
        );
      })}
    </Nav>
  );
}

const Nav = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 8px;
  min-width: 0;
`;

const CrumbGroup = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
`;

const Sep = styled.span`
  display: inline-flex;
  color: var(--text-3);
  svg {
    font-size: 16px;
  }
`;

const Crumb = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 180px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.$root || p.$current ? "var(--surface-2)" : "transparent")};
  color: ${(p) => (p.$current ? "var(--text-1)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: ${(p) => (p.$current ? 700 : 550)};
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  svg {
    font-size: 15px;
    color: var(--primary);
    flex-shrink: 0;
  }

  &:not(:disabled):hover {
    background: var(--surface-3);
    color: var(--primary);
  }
`;

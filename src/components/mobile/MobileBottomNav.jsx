"use client";

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
} from "../common/SvgIcons";
import { useFileUploadContext } from "@/context/FileUploadContext";
import CreateFolderModal from "../common/CreateFolderModal";

const navItems = [
  { href: "/home", label: "Drive", icon: MobileScreenShareIcon },
  { href: "/recent", label: "Recent", icon: QueryBuilderIcon },
  { href: "/starred", label: "Starred", icon: StarBorderIcon },
  { href: "/trash", label: "Trash", icon: DeleteOutlineIcon },
];

const MobileBottomNav = () => {
  const pathname = usePathname();
  const upload = useFileUploadContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const fabWrapRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (event) => {
      if (!fabWrapRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [menuOpen]);

  return (
    <>
      <NavBar aria-label="Main navigation" data-tour="mobile-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <NavLink key={href} href={href} $active={active} aria-current={active ? "page" : undefined}>
              <IconWrap $active={active}>
                <Icon />
              </IconWrap>
              <NavLabel $active={active}>{label}</NavLabel>
            </NavLink>
          );
        })}
      </NavBar>

      <FabWrap ref={fabWrapRef}>
        {menuOpen && (
          <FabMenu role="menu" aria-label="Create">
            <FabMenuItem
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                upload.setOpen(true);
              }}
            >
              <UploadFileOutlinedIcon />
              File upload
            </FabMenuItem>
            <FabMenuItem
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setCreateFolderOpen(true);
              }}
            >
              <CreateNewFolderOutlinedIcon />
              New folder
            </FabMenuItem>
          </FabMenu>
        )}
        <Fab
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close create menu" : "New"}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          data-tour="upload-fab"
          $open={menuOpen}
        >
          {menuOpen ? <CloseRoundedIcon /> : <AddIcon />}
        </Fab>
      </FabWrap>

      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
      />
    </>
  );
};

const NavBar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 900;
    height: var(--bottom-nav-height);
    background: var(--surface);
    border-top: 1px solid var(--border);
    box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.06);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
`;

const NavLink = styled(Link)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
`;

const IconWrap = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.15s ease;

  svg {
    font-size: 22px;
    color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-3)")};
    transition: color 0.15s ease;
  }
`;

const NavLabel = styled.span`
  font-size: 0.65rem;
  font-weight: ${(props) => (props.$active ? "700" : "500")};
  color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-3)")};
  letter-spacing: 0.1px;
`;

const FabWrap = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + 16px + env(safe-area-inset-bottom, 0px));
    right: 20px;
    z-index: 901;
  }
`;

const FabMenu = styled.div`
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  min-width: 176px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
`;

const FabMenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-1);
  font-size: 0.9rem;
  font-weight: 550;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  svg {
    font-size: 20px;
    color: var(--primary);
  }

  &:active {
    background: var(--surface-2);
  }
`;

const Fab = styled.button`
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow:
    0 6px 20px rgba(37, 99, 235, 0.35),
    0 2px 8px rgba(15, 23, 42, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;

  svg {
    font-size: 28px;
    transform: ${(p) => (p.$open ? "rotate(90deg)" : "none")};
    transition: transform 0.15s ease;
  }

  &:active {
    transform: scale(0.94);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
  }
`;

export default MobileBottomNav;

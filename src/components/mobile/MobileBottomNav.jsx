"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
} from "../common/SvgIcons";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUploadModal from "../sidebar/FileUploadModal";

const navItems = [
  { href: "/home", label: "Drive", icon: MobileScreenShareIcon },
  { href: "/recent", label: "Recent", icon: QueryBuilderIcon },
  { href: "/starred", label: "Starred", icon: StarBorderIcon },
  { href: "/trash", label: "Trash", icon: DeleteOutlineIcon },
];

const MobileBottomNav = () => {
  const pathname = usePathname();
  const upload = useFileUpload();

  return (
    <>
      <FileUploadModal
        open={upload.open}
        setOpen={upload.setOpen}
        handleUpload={upload.handleUpload}
        uploading={upload.uploading}
        handleFile={upload.handleFile}
        selectedFile={upload.selectedFile}
        fileName={upload.fileName}
        onFileNameChange={upload.setFileName}
        progress={upload.progress}
      />

      <NavBar aria-label="Main navigation">
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

      <Fab
        onClick={() => upload.setOpen(true)}
        aria-label="Upload new file"
        title="New"
      >
        <AddIcon />
      </Fab>
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

const Fab = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: calc(var(--bottom-nav-height) + 16px + env(safe-area-inset-bottom, 0px));
    right: 20px;
    z-index: 901;
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
    }

    &:active {
      transform: scale(0.94);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }
  }
`;

export default MobileBottomNav;

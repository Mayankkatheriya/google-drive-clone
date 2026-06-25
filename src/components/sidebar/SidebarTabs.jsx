"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  MobileScreenShareIcon,
  QueryBuilderIcon,
  StarBorderIcon,
  DeleteOutlineIcon,
  HelpIcon,
} from "../common/SvgIcons";
import { Modal } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyFiles, useTrashFiles } from "@/context/FilesContext";
import { changeBytes } from "../common/common";
import {
  getTotalStorageBytes,
  getUserStorageLimitLabel,
  MAX_USER_STORAGE_BYTES,
} from "@/lib/uploadLimits";
import HelpModal from "../common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import { selectUserName, selectUserPhoto } from "../../store/UserSlice";
import Lottie from "react-lottie-player";
import closeJson from "../lottie/closeLottie.json";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import HardDriveOutlinedIcon from "@mui/icons-material/MemoryOutlined";

const navItems = [
  { href: "/home", label: "My Drive", icon: <MobileScreenShareIcon /> },
  { href: "/recent", label: "Recent", icon: <QueryBuilderIcon /> },
  { href: "/starred", label: "Starred", icon: <StarBorderIcon /> },
  { href: "/trash", label: "Trash", icon: <DeleteOutlineIcon /> },
];

const SidebarTabs = () => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();
  const userName = useSelector(selectUserName);
  const userPhoto = useSelector(selectUserPhoto);
  const files = useMyFiles();
  const trashFiles = useTrashFiles();
  const [storage, setStorage] = useState("0 Bytes");
  const [size, setSize] = useState(0);
  const [openStorageModal, setOpenStorageModal] = useState(false);
  const pathname = usePathname();
  const storageLimitLabel = getUserStorageLimitLabel();
  const storagePercent = Math.min(100, (size / MAX_USER_STORAGE_BYTES) * 100);

  useEffect(() => {
    const totalSize = getTotalStorageBytes(files, trashFiles);
    setSize(totalSize);
    setStorage(changeBytes(totalSize));
  }, [files, trashFiles]);

  return (
    <Wrap>
      <Nav>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <NavItem $active={pathname === item.href} title={item.label}>
              <NavIcon $active={pathname === item.href}>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          </Link>
        ))}

        <NavDivider />

        <NavItem
          title="Help &amp; Support"
          onClick={() => dispatch(setHelpModal(true))}
          style={{ cursor: "pointer" }}
        >
          <NavIcon><HelpIcon /></NavIcon>
          <NavLabel>Help</NavLabel>
        </NavItem>

        <NavItem
          title={`${storage} of ${storageLimitLabel} used`}
          onClick={() => setOpenStorageModal(true)}
          style={{ cursor: "pointer" }}
        >
          <NavIcon><StorageOutlinedIcon /></NavIcon>
          <NavLabel>Storage</NavLabel>
        </NavItem>
      </Nav>

      {/* Storage bar */}
      <StorageSection onClick={() => setOpenStorageModal(true)}>
        <StorageHeader>
          <HardDriveOutlinedIcon style={{ fontSize: 14, color: "var(--text-3)" }} />
          <StorageLabel>{storage} <span>/ {storageLimitLabel}</span></StorageLabel>
          <StoragePct>{storagePercent.toFixed(0)}%</StoragePct>
        </StorageHeader>
        <StorageTrack>
          <StorageFill $pct={storagePercent} />
        </StorageTrack>
      </StorageSection>

      {/* User profile */}
      {userName && (
        <UserSection>
          <UserAvatar src={userPhoto} alt={userName} />
          <UserInfo>
            <UserName title={userName}>{userName.split(" ")[0]}</UserName>
            <UserRole>Personal Drive</UserRole>
          </UserInfo>
        </UserSection>
      )}

      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />

      <Modal open={openStorageModal} onClose={() => setOpenStorageModal(false)}>
        <StorageModalBox>
          <CloseBtn onClick={() => setOpenStorageModal(false)}>
            <Lottie loop animationData={closeJson} play style={{ width: 40, height: 40 }} />
          </CloseBtn>
          <ModalTitle>Storage Usage</ModalTitle>
          <ModalBody>
            <BigTrack>
              <BigFill $pct={storagePercent} />
            </BigTrack>
            <BarLabel>
              <strong>{storage}</strong> of {storageLimitLabel} used &nbsp;·&nbsp;
              <BarPct>{storagePercent.toFixed(1)}%</BarPct>
            </BarLabel>
            <StorageTips>
              <TipItem>
                <span>📁</span>
                <span>Max file size: 5 MB per upload</span>
              </TipItem>
              <TipItem>
                <span>💾</span>
                <span>Total storage: 1 GB per account</span>
              </TipItem>
            </StorageTips>
          </ModalBody>
        </StorageModalBox>
      </Modal>
    </Wrap>
  );
};

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 8px 0 4px;
  overflow-y: auto;

  a {
    display: block;
    text-decoration: none;
  }
`;

const NavIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.15s ease;
  background: ${(props) => (props.$active ? "var(--primary-subtle)" : "transparent")};

  svg {
    font-size: 20px;
    color: ${(props) => (props.$active ? "var(--primary-hover)" : "var(--text-2)")};
    transition: color 0.15s ease;
  }
`;

const NavLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.15s ease;
  color: var(--text-2);

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 8px;
  padding: 4px 8px 4px 4px;
  height: 42px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
  background: ${(props) => (props.$active ? "var(--primary-light)" : "transparent")};

  ${NavLabel} {
    color: ${(props) => (props.$active ? "var(--primary)" : "var(--text-2)")};
    font-weight: ${(props) => (props.$active ? "600" : "500")};
  }

  &:hover {
    background: ${(props) => (props.$active ? "var(--primary-light)" : "var(--surface-2)")};

    ${NavLabel} {
      color: var(--primary);
    }

    ${NavIcon} {
      background: ${(props) => (props.$active ? "var(--primary-subtle)" : "var(--primary-subtle)")};
      svg { color: var(--primary); }
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
    padding: 4px;
    margin: 2px 6px;
  }
`;

const NavDivider = styled.div`
  height: 1px;
  background: var(--border-light);
  margin: 6px 16px;
`;

const StorageSection = styled.div`
  margin: 0 12px 8px;
  padding: 10px 12px;
  background: var(--surface-2);
  border-radius: 12px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const StorageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const StorageLabel = styled.span`
  flex: 1;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-2);

  span { color: var(--text-3); font-weight: 400; }
`;

const StoragePct = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
`;

const StorageTrack = styled.div`
  width: 100%;
  height: 5px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
`;

const StorageFill = styled.div`
  height: 100%;
  width: ${(props) => props.$pct}%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border-light);

  @media (max-width: 768px) {
    padding: 8px 6px 12px;
    justify-content: center;
  }
`;

const UserAvatar = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  min-width: 0;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 1px;
`;

const StorageModalBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  width: 90%;
  max-width: 440px;
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow-lg);
  outline: none;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  text-align: center;
  margin-bottom: 20px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BigTrack = styled.div`
  width: 100%;
  height: 10px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
`;

const BigFill = styled.div`
  height: 100%;
  width: ${(props) => props.$pct}%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const BarLabel = styled.p`
  font-size: 0.9rem;
  color: var(--text-2);
  text-align: center;
  strong { color: var(--text-1); }
`;

const BarPct = styled.span`
  color: #2563eb;
  font-weight: 600;
`;

const StorageTips = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--surface-2);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 4px;
`;

const TipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-2);
`;

export default SidebarTabs;

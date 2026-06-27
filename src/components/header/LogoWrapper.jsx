"use client";

import React from "react";
import styled from "styled-components";
import { SidebarToggleIcon } from "../common/SidebarToggleIcon";
import Link from "next/link";
import DiskDriveLogo from "../common/DiskDriveLogo";

const LogoWrapperComponent = ({ onClick, userName, sidebarOpen = true }) => {
  return (
    <LogoWrapper>
      {userName && (
        <MenuBtn
          onClick={onClick}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <SidebarToggleIcon open={sidebarOpen} />
        </MenuBtn>
      )}
      <Link href="/home">
        <Logo>
          <DiskDriveLogo size={32} />
          <span>Disk Drive</span>
        </Logo>
      </Link>
    </LogoWrapper>
  );
};

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const MenuBtn = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--primary);
  }

  /* Sidebar hidden on mobile — bottom nav handles navigation */
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 10px;
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-3);
  }

  img,
  svg {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.3px;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

export default LogoWrapperComponent;

"use client";

import React from "react";
import styled from "styled-components";
import { MenuIcon } from "../common/SvgIcons";
import Link from "next/link";

const LogoWrapperComponent = ({ onClick, userName }) => {
  return (
    <LogoWrapper>
      {userName && (
        <MenuBtn onClick={onClick} aria-label="Toggle sidebar">
          <MenuIcon />
        </MenuBtn>
      )}
      <Link href="/home">
        <Logo>
          <img src="/google-logo.png" alt="Drive" />
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
  transition: background 0.15s ease;

  &:hover {
    background: var(--surface-3);
  }

  svg {
    font-size: 22px;
  }

  /* Sidebar is always visible on mobile — toggle not needed */
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

  img {
    width: 32px;
    height: 32px;
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-1);
    letter-spacing: -0.3px;

    @media (max-width: 640px) {
      display: none;
    }
  }
`;

export default LogoWrapperComponent;

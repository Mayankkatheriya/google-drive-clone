"use client";

import React from "react";
import styled from "styled-components";
import { ListsIcon, GridIcon } from "./SvgIcons";

const PageHeader = ({ pageTitle }) => {
  return (
    <Header>
      <Title>{pageTitle}</Title>
      <Actions>
        {pageTitle === "My Drive" ? (
          <ActionBtn title="List view"><ListsIcon /></ActionBtn>
        ) : (
          <ActionBtn title="Grid view"><GridIcon /></ActionBtn>
        )}
      </Actions>
    </Header>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;

  @media (max-width: 768px) {
    padding: 16px 16px 12px;
  }
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 1.35rem;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ActionBtn = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--primary);
  }

  svg { font-size: 20px; }
`;

export default PageHeader;

"use client";

import React from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";

const AddFile = ({ onClick }) => {
  return (
    <Wrap>
      <NewBtn title="Upload new file" onClick={onClick}>
        <AddIcon />
        <span>New</span>
      </NewBtn>
    </Wrap>
  );
};

const Wrap = styled.div`
  padding: 16px 14px 10px;

  @media (max-width: 768px) {
    padding: 12px 8px 8px;
    display: flex;
    justify-content: center;
  }
`;

const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: none;
  border-radius: 999px;
  padding: 11px 22px 11px 14px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  svg {
    font-size: 22px;
    color: var(--primary);
    flex-shrink: 0;
  }

  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-1);

    @media (max-width: 768px) {
      display: none;
    }
  }

  /* On mobile: circular icon-only button */
  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    justify-content: center;
  }

  &:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.18);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 6px rgba(15, 23, 42, 0.12);
  }
`;

export default AddFile;

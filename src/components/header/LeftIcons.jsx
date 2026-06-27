"use client";

import React from "react";
import styled from "styled-components";
import { HelpIcon } from "../common/SvgIcons";
import { useDispatch, useSelector } from "react-redux";
import { selectHelpModal, setHelpModal } from "../../store/HelpSlice";
import HelpModal from "../common/Modal";
import { ThemeToggle } from "../common/ThemeToggle";

const LeftIcons = () => {
  const openHelp = useSelector(selectHelpModal);
  const dispatch = useDispatch();

  return (
    <LeftSection>
      <HelpModal
        openHelp={openHelp}
        closeHelpModal={() => dispatch(setHelpModal(false))}
      />

      <IconBtn
        onClick={() => dispatch(setHelpModal(true))}
        aria-label="Help"
        title="Help"
      >
        <HelpIcon />
      </IconBtn>

      <ThemeToggle />
    </LeftSection>
  );
};

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconBtn = styled.button`
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
  transition: all 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--primary);
  }

  svg {
    font-size: 22px;
  }
`;

export default LeftIcons;

"use client";

import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import { useFileUploadContext } from "@/context/FileUploadContext";
import AddFile from "./AddFile";
import SidebarTabs from "./SidebarTabs";

const Sidebar = () => {
  const sidebarBool = useSelector(selectSidebarBool);
  const upload = useFileUploadContext();

  return (
    <SidebarContainer $open={sidebarBool}>
      <AddFile onClick={() => upload.setOpen(true)} />
      <SidebarTabs />
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: 256px;
  height: 100%;
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 8px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: ${(props) => (props.$open ? "relative" : "absolute")};
  left: ${(props) => (props.$open ? "0" : "-256px")};
  overflow: hidden;
  z-index: 10;

  @media (max-width: 768px) {
    display: none;
  }
`;

export default Sidebar;

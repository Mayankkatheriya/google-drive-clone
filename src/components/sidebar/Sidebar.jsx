"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectSidebarBool } from "../../store/BoolSlice";
import { useFileUploadContext } from "@/context/FileUploadContext";
import AddFile from "./AddFile";
import VoiceMemoButton from "./VoiceMemoButton";
import SidebarTabs from "./SidebarTabs";
import CreateFolderModal from "../common/CreateFolderModal";

const Sidebar = () => {
  const sidebarBool = useSelector(selectSidebarBool);
  const upload = useFileUploadContext();
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  return (
    <SidebarContainer $open={sidebarBool}>
      <ActionsBlock>
        <AddFile
          onClick={() => upload.setOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />
        <VoiceMemoButton onClick={() => upload.openVoiceMemo()} />
      </ActionsBlock>
      <ActionsDivider />
      <SidebarTabs />
      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
      />
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

const ActionsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 14px 14px;
  flex-shrink: 0;
`;

const ActionsDivider = styled.div`
  height: 1px;
  margin: 0 16px 6px;
  background: var(--border-light);
  flex-shrink: 0;
`;

export default Sidebar;

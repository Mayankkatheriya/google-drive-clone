"use client";

import React, { useCallback } from "react";
import styled from "styled-components";
import FileGridCard from "./FileGridCard";
import LottieImage from "./LottieImage";
import { useFileTrashActions } from "@/hooks/useFileTrashActions";
import { useDriveGridMenuState } from "./DriveGridMenu";

const FilesList = ({
  data,
  page = null,
  imagePath,
  text1,
  text2,
  compact = false,
  focusMode = false,
}) => {
  const driveMenu = useDriveGridMenuState();
  const { confirmMoveToTrash, confirmPermanentDelete } = useFileTrashActions();
  const isDrivePage = page === "drive";

  const handleDelete = useCallback(
    async (id, fileData) => {
      if (page === "trash") {
        await confirmPermanentDelete(id, fileData);
        return;
      }
      await confirmMoveToTrash(id, fileData);
    },
    [page, confirmMoveToTrash, confirmPermanentDelete],
  );

  if (data.length === 0) {
    return <LottieImage imagePath={imagePath} text1={text1} text2={text2} />;
  }

  return (
    <List $compact={compact} $focus={focusMode}>
      {data.map((file) => {
        const isMenuOpen = driveMenu.openMenuId === file.id;
        const isRenaming = isDrivePage && driveMenu.renamingId === file.id;

        return (
          <FileGridCard
            key={file.id}
            file={file}
            data={data}
            page={page}
            isDrivePage={isDrivePage}
            focusMode={isDrivePage && focusMode}
            isMenuOpen={isMenuOpen}
            isRenaming={isRenaming}
            renameValue={isRenaming ? driveMenu.renameValue : ""}
            renameInputRef={isRenaming ? driveMenu.renameInputRef : undefined}
            shareOpen={driveMenu.shareMenuId === file.id}
            shareUrl={
              driveMenu.shareMenuId === file.id || isMenuOpen
                ? driveMenu.shareUrl
                : ""
            }
            menuRef={isMenuOpen ? driveMenu.menuRef : undefined}
            onToggleMenu={driveMenu.setOpenMenuId}
            onRename={driveMenu.startRename}
            onShareClick={(fileData) =>
              driveMenu.handleShareClick(fileData, file.id)
            }
            onRenameValueChange={(event) =>
              driveMenu.setRenameValue(event.target.value)
            }
            onRenameSubmit={() =>
              driveMenu.submitRename(file.id, file.data.filename)
            }
            onRenameCancel={driveMenu.cancelRename}
            onDelete={() => handleDelete(file.id, file.data)}
            onPermanentDelete={() => confirmPermanentDelete(file.id, file.data)}
          />
        );
      })}
    </List>
  );
};

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: ${(props) =>
    props.$compact
      ? "0 0 var(--mobile-scroll-inset)"
      : "8px 16px var(--mobile-scroll-inset)"};
  scroll-padding-bottom: var(--mobile-scroll-inset);

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
    gap: 16px;
    padding: ${(props) => (props.$compact ? "0 0 8px" : "20px 24px 28px")};

    ${(props) =>
      props.$focus &&
      `
      max-width: 920px;
      margin: 0 auto;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    `}
  }
`;

export default FilesList;

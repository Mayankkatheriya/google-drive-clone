"use client";

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import {
  listFileVersions,
  restoreFileVersion,
  MAX_FILE_VERSIONS,
} from "@/lib/fileVersions";
import { changeBytes, convertDates } from "./common";
import { downloadFileWithToast, getFileDownloadUrl } from "@/lib/fileAccess";
import { useFilePreview } from "@/context/FilePreviewContext";
import { useFileUploadContext } from "@/context/FileUploadContext";
import { toast } from "react-toastify";

export default function VersionHistoryModal({ open, onClose, file }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { open: openPreview } = useFilePreview();
  const upload = useFileUploadContext();

  const fileId = file?.id;

  const refresh = useCallback(async () => {
    if (!fileId) return;
    setLoading(true);
    try {
      const next = await listFileVersions(fileId);
      setVersions(next);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load versions");
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleRestore = async (version) => {
    setBusyId(version.id);
    try {
      await restoreFileVersion(fileId, file.data, version);
      toast.success("Version restored");
      await refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to restore version");
    } finally {
      setBusyId(null);
    }
  };

  const handlePreviewVersion = async (version) => {
    try {
      const url = await getFileDownloadUrl(version.data);
      openPreview(
        { ...version.data, _previewUrl: url },
        [{ ...version.data }],
      );
    } catch {
      toast.error("Unable to preview version");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box>
        <Header>
          <TitleRow>
            <HistoryRoundedIcon />
            <div>
              <Title>Version history</Title>
              <Sub>
                {file?.data?.filename} · up to {MAX_FILE_VERSIONS} older versions
              </Sub>
            </div>
          </TitleRow>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            <CloseRoundedIcon />
          </CloseBtn>
        </Header>

        <Current>
          <strong>Current</strong>
          <span>
            {changeBytes(file?.data?.size)} ·{" "}
            {convertDates(file?.data?.timestamp?.seconds)}
          </span>
        </Current>

        <UploadBtn
          type="button"
          onClick={() => {
            upload.openReplaceUpload?.(fileId);
            onClose?.();
          }}
        >
          Upload new version
        </UploadBtn>

        <List>
          {loading && <Empty>Loading…</Empty>}
          {!loading && versions.length === 0 && (
            <Empty>No older versions yet.</Empty>
          )}
          {versions.map((version) => (
            <Row key={version.id}>
              <Meta>
                <strong>{version.data.filename || "Version"}</strong>
                <span>
                  {changeBytes(version.data.size)} ·{" "}
                  {convertDates(version.data.createdAt?.seconds)}
                </span>
              </Meta>
              <Actions>
                <MiniBtn
                  type="button"
                  onClick={() => handlePreviewVersion(version)}
                >
                  Preview
                </MiniBtn>
                <MiniBtn
                  type="button"
                  onClick={() => downloadFileWithToast(version.data)}
                >
                  Download
                </MiniBtn>
                <MiniBtn
                  type="button"
                  $primary
                  disabled={busyId === version.id}
                  onClick={() => handleRestore(version)}
                >
                  Restore
                </MiniBtn>
              </Actions>
            </Row>
          ))}
        </List>
      </Box>
    </Modal>
  );
}

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(480px, calc(100vw - 32px));
  max-height: min(85vh, 640px);
  overflow: auto;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const TitleRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;

  > svg {
    color: var(--primary);
    margin-top: 2px;
  }
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
`;

const Sub = styled.p`
  margin-top: 4px;
  font-size: 0.76rem;
  color: var(--text-3);
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
`;

const Current = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const UploadBtn = styled.button`
  width: 100%;
  height: 38px;
  margin-bottom: 14px;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Empty = styled.p`
  font-size: 0.82rem;
  color: var(--text-3);
  text-align: center;
  padding: 20px 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface-2);
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  color: var(--text-2);

  strong {
    color: var(--text-1);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const MiniBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (p.$primary ? "var(--primary)" : "var(--border-light)")};
  background: ${(p) => (p.$primary ? "var(--primary)" : "var(--surface)")};
  color: ${(p) => (p.$primary ? "#fff" : "var(--text-2)")};
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

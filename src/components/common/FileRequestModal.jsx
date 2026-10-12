"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { toast } from "react-toastify";
import { useCurrentFolder } from "@/context/CurrentFolderContext";
import { useMyFiles } from "@/context/FilesContext";
import {
  createFileRequest,
  deleteFileRequest,
  fileRequestUrl,
  listFileRequests,
} from "@/lib/fileRequest";

const EXPIRY_OPTIONS = [
  { id: "none", label: "No expiry", hours: null },
  { id: "1d", label: "1 day", hours: 24 },
  { id: "7d", label: "7 days", hours: 24 * 7 },
  { id: "30d", label: "30 days", hours: 24 * 30 },
];

function formatExpiry(expiresAt) {
  if (!expiresAt) return "No expiry";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.ceil(ms / 3600000);
  if (hours < 48) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

export default function FileRequestModal({ open, onClose }) {
  const { folderId } = useCurrentFolder();
  const myFiles = useMyFiles();
  const [title, setTitle] = useState("");
  const [expiry, setExpiry] = useState("7d");
  const [maxFiles, setMaxFiles] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [requests, setRequests] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const folderName = useMemo(() => {
    if (!folderId) return "My Drive";
    return myFiles.find((f) => f.id === folderId)?.data?.filename || "this folder";
  }, [folderId, myFiles]);

  const refresh = async () => {
    try {
      setRequests(await listFileRequests());
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setExpiry("7d");
    setMaxFiles("");
    setPassword("");
    setCreatedUrl("");
    setBusy(false);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (busy || !title.trim()) return;
    setBusy(true);
    try {
      const result = await createFileRequest({
        folderId,
        title: title.trim(),
        expiresInHours: EXPIRY_OPTIONS.find((o) => o.id === expiry)?.hours ?? null,
        maxFiles: maxFiles ? Number(maxFiles) : null,
        password: password || undefined,
      });
      setCreatedUrl(result.url);
      await navigator.clipboard.writeText(result.url).catch(() => {});
      toast.success("File request link created and copied");
      await refresh();
    } catch (error) {
      toast.error(error.message || "Failed to create file request");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (token) => {
    if (deleting) return;
    setDeleting(token);
    setRequests((prev) => prev.filter((r) => r.token !== token));
    if (createdUrl.endsWith(`/request/${token}`)) setCreatedUrl("");
    try {
      await deleteFileRequest(token);
      toast.success("File request closed");
    } catch (error) {
      toast.error(error.message || "Failed to delete");
      await refresh();
    } finally {
      setDeleting(null);
    }
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(url);
    toast.success("Copied");
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <Box as="form" onSubmit={handleCreate}>
        <Header>
          <div>
            <Title>Request files</Title>
            <Sub>
              Anyone with the link can upload into <strong>{folderName}</strong>.
              They can&apos;t see what&apos;s already there.
            </Sub>
          </div>
          <CloseBtn type="button" onClick={onClose} disabled={busy} aria-label="Close">
            <CloseRoundedIcon />
          </CloseBtn>
        </Header>

        <Scroll>
          <Field>
            <Label htmlFor="request-title">What are you asking for?</Label>
            <Input
              id="request-title"
              autoFocus
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wedding photos, assignment submissions"
            />
          </Field>

          <Label as="span">Link expires</Label>
          <ChipRow>
            {EXPIRY_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                type="button"
                $active={expiry === option.id}
                onClick={() => setExpiry(option.id)}
              >
                {option.label}
              </Chip>
            ))}
          </ChipRow>

          <Row>
            <Field>
              <Label htmlFor="request-max">Max files</Label>
              <Input
                id="request-max"
                type="number"
                min="1"
                max="100"
                value={maxFiles}
                onChange={(e) => setMaxFiles(e.target.value)}
                placeholder="100"
              />
            </Field>
            <Field>
              <Label htmlFor="request-password">Password</Label>
              <Input
                id="request-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional"
              />
            </Field>
          </Row>

          <Primary
            type="submit"
            disabled={busy || !title.trim() || (password && password.length < 4)}
          >
            {busy ? "Creating…" : "Create & copy link"}
          </Primary>

          {createdUrl && (
            <Created>
              <QrWrap>
                <QRCodeSVG value={createdUrl} size={88} marginSize={1} />
              </QrWrap>
              <CreatedBody>
                <CreatedUrl title={createdUrl}>{createdUrl}</CreatedUrl>
                <SmallBtn type="button" onClick={() => copy(createdUrl)}>
                  <ContentCopyRoundedIcon /> Copy link
                </SmallBtn>
              </CreatedBody>
            </Created>
          )}

          <ManageTitle>
            Your file requests
            {requests.length > 0 && <Count>{requests.length}</Count>}
          </ManageTitle>
          {requests.length === 0 ? (
            <Empty>No file requests yet</Empty>
          ) : (
            requests.map((req) => (
              <ReqRow key={req.token} $muted={!req.available}>
                <ReqMeta>
                  <strong title={req.title}>{req.title}</strong>
                  <small>
                    {req.folderName} · {req.uploadCount}
                    {req.maxFiles != null ? `/${req.maxFiles}` : ""} received
                    {req.hasPassword ? " · Password" : ""}
                    {" · "}
                    {req.available ? formatExpiry(req.expiresAt) : "Closed"}
                  </small>
                </ReqMeta>
                {req.available && (
                  <IconBtn
                    type="button"
                    onClick={() => copy(fileRequestUrl(req.token))}
                    aria-label="Copy link"
                    title="Copy link"
                  >
                    <ContentCopyRoundedIcon />
                  </IconBtn>
                )}
                <IconBtn
                  type="button"
                  $danger
                  disabled={deleting === req.token}
                  onClick={() => handleDelete(req.token)}
                  aria-label="Delete request"
                  title="Delete"
                >
                  <DeleteOutlineRoundedIcon />
                </IconBtn>
              </ReqRow>
            ))
          )}
        </Scroll>
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
  max-height: min(88vh, 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
`;

const Sub = styled.p`
  margin-top: 4px;
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--text-3);

  strong {
    color: var(--text-2);
  }
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
`;

const Scroll = styled.div`
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
`;

const Field = styled.div`
  flex: 1;
  min-width: 0;
  margin-bottom: 12px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-3);
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const Chip = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-2)")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
`;

const Primary = styled.button`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Created = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
`;

const QrWrap = styled.div`
  flex-shrink: 0;
  padding: 4px;
  border-radius: 8px;
  background: #fff;
  line-height: 0;
`;

const CreatedBody = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CreatedUrl = styled.span`
  font-size: 0.74rem;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SmallBtn = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--surface);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;

  svg {
    font-size: 15px;
  }
`;

const ManageTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 18px 0 6px;
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Count = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  background: var(--surface-3);
  color: var(--text-2);
`;

const Empty = styled.p`
  font-size: 0.8rem;
  color: var(--text-3);
  padding: 6px 0;
`;

const ReqRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
  opacity: ${(p) => (p.$muted ? 0.6 : 1)};

  &:last-child {
    border-bottom: none;
  }
`;

const ReqMeta = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 0.84rem;
    color: var(--text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  small {
    font-size: 0.72rem;
    color: var(--text-3);
  }
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${(p) => (p.$danger ? "var(--danger)" : "var(--primary)")};
  cursor: pointer;

  &:hover {
    background: var(--surface-2);
  }

  &:disabled {
    opacity: 0.5;
  }

  svg {
    font-size: 18px;
  }
`;

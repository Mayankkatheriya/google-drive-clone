"use client";

import { useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoveToInboxRoundedIcon from "@mui/icons-material/MoveToInboxRounded";
import DiskDriveLogo from "@/components/common/DiskDriveLogo";
import FileIcons from "@/components/common/FileIcons";
import { changeBytes } from "@/components/common/common";
import { uploadWithProgress } from "@/lib/awsStorage";
import {
  MAX_UPLOAD_BYTES,
  getUploadLimitLabel,
  isFileWithinUploadLimit,
} from "@/lib/uploadLimits";

let nextId = 0;

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = res.status;
    throw error;
  }
  return data;
}

export default function FileRequestView({ state: initial }) {
  const [status, setStatus] = useState(initial.status);
  const [message, setMessage] = useState(initial.message || "");
  const [unlockToken, setUnlockToken] = useState(null);
  const [password, setPassword] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const [items, setItems] = useState([]);
  const [remaining, setRemaining] = useState(initial.remaining ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const { token, title, ownerName } = initial;
  const queued = items.filter((item) => item.status === "queued");
  const sentCount = items.filter((item) => item.status === "done").length;

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setError("");
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: ++nextId,
        file,
        progress: 0,
        status: isFileWithinUploadLimit(file.size) ? "queued" : "error",
        error: isFileWithinUploadLimit(file.size)
          ? ""
          : `Larger than ${getUploadLimitLabel()}`,
      })),
    ]);
  };

  const handleUnlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await postJson(`/api/file-request/${token}/unlock`, { password });
      setUnlockToken(data.unlockToken);
      setStatus("open");
    } catch (err) {
      if (err.status === 410 || err.status === 404) {
        setStatus("closed");
        setMessage(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const uploadOne = async (item) => {
    const { file } = item;
    const contentType = file.type || "application/octet-stream";
    updateItem(item.id, { status: "uploading", progress: 0, error: "" });

    const session = await postJson(`/api/file-request/${token}/upload-url`, {
      filename: file.name,
      contentType,
      fileSize: file.size,
      unlockToken,
    });

    await uploadWithProgress(session.uploadUrl, file, session.contentType, (progress) =>
      updateItem(item.id, { progress }),
    );

    await postJson(`/api/file-request/${token}/complete`, {
      s3Key: session.s3Key,
      ticket: session.ticket,
      filename: file.name,
      contentType: session.contentType,
      fileSize: file.size,
      uploaderName,
    });

    updateItem(item.id, { status: "done", progress: 100 });
    setRemaining((n) => Math.max(0, n - 1));
  };

  const handleSend = async () => {
    if (busy || queued.length === 0) return;
    setBusy(true);
    setError("");

    for (const item of queued) {
      try {
        await uploadOne(item);
      } catch (err) {
        updateItem(item.id, { status: "error", error: err.message || "Upload failed" });
        if (err.status === 410) {
          setError(err.message);
          break;
        }
      }
    }

    setBusy(false);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <Page>
      <Shell>
        <BrandRow>
          <DiskDriveLogo size={28} />
          <BrandText>Disk Drive</BrandText>
          <Badge>
            <MoveToInboxRoundedIcon />
            File request
          </Badge>
        </BrandRow>

        {(status === "missing" || status === "closed") && (
          <Card $center>
            <StatusIcon>
              <LockOutlinedIcon />
            </StatusIcon>
            <CardTitle>
              {status === "missing" ? "Link not found" : "Request closed"}
            </CardTitle>
            <CardSub>{message}</CardSub>
            <HomeLink href="/">Go to Disk Drive</HomeLink>
          </Card>
        )}

        {status === "locked" && (
          <Card as="form" onSubmit={handleUnlock}>
            <Eyebrow>{ownerName} is requesting files</Eyebrow>
            <CardTitle>{title}</CardTitle>
            <CardSub>This request is password protected.</CardSub>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              disabled={busy}
            />
            {error && <ErrorText>{error}</ErrorText>}
            <PrimaryBtn type="submit" disabled={busy || !password}>
              {busy ? "Checking…" : "Continue"}
            </PrimaryBtn>
          </Card>
        )}

        {status === "open" && (
          <Card>
            <Eyebrow>{ownerName} is requesting files</Eyebrow>
            <CardTitle>{title}</CardTitle>
            <CardSub>
              Files go straight to {ownerName}&apos;s Drive. You won&apos;t be able
              to see anything else in it. Up to {remaining} more file
              {remaining === 1 ? "" : "s"}, {getUploadLimitLabel()} each.
            </CardSub>

            <DropArea
              type="button"
              $dragging={dragging}
              disabled={busy || remaining === 0}
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!busy) addFiles(event.dataTransfer.files);
              }}
            >
              <CloudUploadOutlinedIcon />
              <strong>Drop files here or click to choose</strong>
              <span>Max {changeBytes(MAX_UPLOAD_BYTES)} per file</span>
            </DropArea>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />

            {items.length > 0 && (
              <FileList>
                {items.map((item) => (
                  <FileRow key={item.id}>
                    <FileIconWrap>
                      <FileIcons type={item.file.type} />
                    </FileIconWrap>
                    <FileInfo>
                      <FileName title={item.file.name}>{item.file.name}</FileName>
                      <FileSub $error={item.status === "error"}>
                        {item.status === "error"
                          ? item.error
                          : item.status === "uploading"
                            ? `Uploading… ${item.progress}%`
                            : item.status === "done"
                              ? "Sent"
                              : changeBytes(item.file.size)}
                      </FileSub>
                      {item.status === "uploading" && (
                        <Progress>
                          <span style={{ width: `${item.progress}%` }} />
                        </Progress>
                      )}
                    </FileInfo>
                    {item.status === "done" && (
                      <DoneIcon>
                        <CheckCircleRoundedIcon />
                      </DoneIcon>
                    )}
                    {item.status === "error" && (
                      <ErrIcon>
                        <ErrorOutlineOutlinedIcon />
                      </ErrIcon>
                    )}
                    {(item.status === "queued" || item.status === "error") && !busy && (
                      <RemoveBtn
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <CloseRoundedIcon />
                      </RemoveBtn>
                    )}
                  </FileRow>
                ))}
              </FileList>
            )}

            <Label htmlFor="uploader-name">Your name (optional)</Label>
            <Input
              id="uploader-name"
              value={uploaderName}
              maxLength={40}
              onChange={(event) => setUploaderName(event.target.value)}
              placeholder="So they know who sent it"
              disabled={busy}
            />

            {error && <ErrorText>{error}</ErrorText>}
            {sentCount > 0 && queued.length === 0 && !busy && (
              <Success>
                <CheckCircleRoundedIcon />
                {sentCount} file{sentCount === 1 ? "" : "s"} sent to {ownerName}
              </Success>
            )}

            <PrimaryBtn
              type="button"
              onClick={handleSend}
              disabled={busy || queued.length === 0}
            >
              {busy
                ? "Sending…"
                : queued.length > 0
                  ? `Send ${queued.length} file${queued.length === 1 ? "" : "s"}`
                  : "Send files"}
            </PrimaryBtn>
          </Card>
        )}
      </Shell>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--surface-3);
`;

const Shell = styled.div`
  width: min(560px, 100%);
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const BrandText = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: var(--primary-light);
  color: var(--primary);
  font-size: 0.72rem;
  font-weight: 700;

  svg {
    font-size: 15px;
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px;
  text-align: ${(p) => (p.$center ? "center" : "left")};

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Eyebrow = styled.p`
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const CardTitle = styled.h1`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
  word-break: break-word;
`;

const CardSub = styled.p`
  margin-top: 6px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-3);
`;

const DropArea = styled.button`
  width: 100%;
  margin: 18px 0 14px;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 2px dashed
    ${(p) => (p.$dragging ? "var(--primary)" : "var(--border)")};
  border-radius: 14px;
  background: ${(p) => (p.$dragging ? "var(--primary-light)" : "var(--surface-2)")};
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  svg {
    font-size: 34px;
    color: var(--primary);
  }

  strong {
    font-size: 0.9rem;
    color: var(--text-1);
  }

  span {
    font-size: 0.74rem;
    color: var(--text-3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  max-height: 280px;
  overflow-y: auto;
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-2);
`;

const FileIconWrap = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--text-2);

  svg {
    font-size: 18px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSub = styled.div`
  margin-top: 2px;
  font-size: 0.72rem;
  color: ${(p) => (p.$error ? "var(--danger)" : "var(--text-3)")};
`;

const Progress = styled.div`
  margin-top: 5px;
  height: 4px;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    background: var(--primary);
    transition: width 0.15s ease;
  }
`;

const DoneIcon = styled.span`
  display: flex;
  color: #16a34a;

  svg {
    font-size: 20px;
  }
`;

const ErrIcon = styled.span`
  display: flex;
  color: var(--danger);

  svg {
    font-size: 20px;
  }
`;

const RemoveBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }

  svg {
    font-size: 18px;
  }
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
  height: 42px;
  padding: 0 12px;
  margin: 12px 0 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.9rem;

  ${Label} + & {
    margin-top: 0;
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const PrimaryBtn = styled.button`
  width: 100%;
  height: 42px;
  margin-top: 4px;
  border: none;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin: 0 0 10px;
  font-size: 0.78rem;
  color: var(--danger);
`;

const Success = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #16a34a;

  svg {
    font-size: 18px;
  }
`;

const StatusIcon = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);

  svg {
    font-size: 26px;
  }
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
`;

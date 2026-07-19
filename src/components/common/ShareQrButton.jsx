"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { QRCodeCanvas } from "qrcode.react";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import Tooltip from "./Tooltip";
import { getFileDownloadUrl } from "@/lib/fileAccess";

const QR_LINK_TTL_SECONDS = 3600;

function sanitizeFilename(name = "file") {
  return name.replace(/\.[^./\\]+$/, "").replace(/[^a-z0-9-_]+/gi, "-") || "file";
}

export default function ShareQrButton({ url, filename, fileData, size = 28 }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const canvasWrapRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    if (fileData?.s3Key) {
      setStatus("loading");
      getFileDownloadUrl(fileData, { expiresIn: QR_LINK_TTL_SECONDS })
        .then((freshUrl) => {
          if (cancelled) return;
          setQrUrl(freshUrl);
          setStatus("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setQrUrl(url);
          setStatus("ready");
        });
    } else {
      setQrUrl(url);
      setStatus("ready");
    }

    return () => {
      cancelled = true;
    };
  }, [open, fileData, url]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleDownload = useCallback(() => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${sanitizeFilename(filename)}-qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [filename]);

  if (!url) return null;

  return (
    <>
      <Tooltip label="Scan on phone" iconOnly>
        <QrTrigger
          type="button"
          $size={size}
          className="share-qr-trigger"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
          aria-label="Show QR code"
        >
          <QrCode2Icon />
        </QrTrigger>
      </Tooltip>

      {mounted &&
        open &&
        createPortal(
          <Backdrop
            className="share-qr-modal"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onClick={() => setOpen(false)}
          >
            <Card onClick={(event) => event.stopPropagation()}>
              <CloseBtn type="button" onClick={() => setOpen(false)} aria-label="Close">
                <CloseIcon />
              </CloseBtn>

              <Title>Scan to open</Title>
              <Sub>Point your phone camera at the code</Sub>

              <QrFrame ref={canvasWrapRef}>
                {status === "ready" && qrUrl ? (
                  <QRCodeCanvas
                    value={qrUrl}
                    size={220}
                    level="M"
                    marginSize={2}
                    bgColor="#ffffff"
                    fgColor="#111827"
                  />
                ) : (
                  <QrPlaceholder>
                    <Spinner />
                  </QrPlaceholder>
                )}
              </QrFrame>

              {filename && <FileLabel title={filename}>{filename}</FileLabel>}

              <Validity>Link valid for 1 hour after opening this code</Validity>

              <DownloadBtn
                type="button"
                onClick={handleDownload}
                disabled={status !== "ready" || !qrUrl}
              >
                <DownloadIcon />
                Download PNG
              </DownloadBtn>
            </Card>
          </Backdrop>,
          document.body,
        )}
    </>
  );
}

const QrTrigger = styled.button`
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: var(--text-1);
  color: var(--surface);
  transition: transform 0.15s ease, opacity 0.15s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  svg {
    font-size: ${(p) => Math.round(p.$size * 0.64)}px;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
`;

const Card = styled.div`
  position: relative;
  width: min(340px, 100%);
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 26px 24px 22px;
  text-align: center;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--surface-2);
    color: var(--text-1);
  }

  svg {
    font-size: 20px;
  }
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
`;

const Sub = styled.p`
  margin-top: 4px;
  font-size: 0.8rem;
  color: var(--text-3);
`;

const QrFrame = styled.div`
  margin: 18px auto 14px;
  width: fit-content;
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);

  canvas {
    display: block;
  }
`;

const FileLabel = styled.p`
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-2);
  word-break: break-word;
  margin-bottom: 6px;
`;

const Validity = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-bottom: 16px;
`;

const QrPlaceholder = styled.div`
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  animation: ${spin} 0.7s linear infinite;
`;

const DownloadBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: var(--surface-3);
    border-color: var(--border);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { useFilePreview } from "@/context/FilePreviewContext";
import { useMyFiles } from "@/context/FilesContext";
import { getFileDownloadUrl, downloadFile } from "../../lib/fileAccess";
import { changeBytes } from "./common";
import FileIcons from "./FileIcons";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getFileTypeTokens } from "@/lib/fileTypeColors";

function getCategory(contentType = "") {
  if (contentType.includes("image")) return "image";
  if (contentType.includes("video")) return "video";
  if (contentType.includes("audio")) return "audio";
  if (contentType.includes("pdf"))   return "pdf";
  return "other";
}

export default function FilePreviewModalContent() {
  const myFiles = useMyFiles();
  const { file, siblings, open, close } = useFilePreview();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navList = useMemo(() => {
    if (siblings?.length) return siblings;
    return myFiles.map((f) => f.data);
  }, [siblings, myFiles]);

  const currentIndex = file
    ? navList.findIndex((f) => f.s3Key === file.s3Key)
    : -1;

  const hasNav = navList.length > 1 && currentIndex >= 0;
  const hasPrev = hasNav && currentIndex > 0;
  const hasNext = hasNav && currentIndex < navList.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) open(navList[currentIndex - 1], siblings);
  }, [hasPrev, open, navList, currentIndex, siblings]);

  const goNext = useCallback(() => {
    if (hasNext) open(navList[currentIndex + 1], siblings);
  }, [hasNext, open, navList, currentIndex, siblings]);

  /* Fetch signed URL when a file is set */
  useEffect(() => {
    if (!file) { setUrl(null); setError(null); return; }
    setLoading(true);
    setError(null);
    setUrl(null);
    getFileDownloadUrl(file)
      .then((u) => { setUrl(u); setLoading(false); })
      .catch(() => { setError("Could not load preview."); setLoading(false); });
  }, [file]);

  /* Close on Escape */
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [close, goPrev, goNext]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!file) return null;

  const category = getCategory(file.contentType);
  const { bgVar, colorVar } = getFileTypeTokens(
    file.contentType,
    file.filename,
  );

  const handleDownload = async () => {
    if (!file) return;
    try {
      await downloadFile(file);
    } catch {
      setError("Could not download file.");
    }
  };

  const handleOpenTab = () => {
    if (url) window.open(url, "_blank");
  };

  return (
    <Backdrop onClick={close}>
      {hasPrev && (
        <NavBtn
          type="button"
          $side="left"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          title="Previous file (←)"
          aria-label="Previous file"
        >
          <ChevronLeftIcon />
        </NavBtn>
      )}

      <Panel onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <PanelHeader>
          <FileInfo>
            <FileIconWrap $bgVar={bgVar} $colorVar={colorVar}>
              <FileIcons type={file.contentType} />
            </FileIconWrap>
            <FileDetails>
              <FileName title={file.filename}>{file.filename}</FileName>
              <FileMeta>
                {changeBytes(file.size)}
                {hasNav && (
                  <> · {currentIndex + 1} of {navList.length}</>
                )}
              </FileMeta>
            </FileDetails>
          </FileInfo>
          <HeaderActions>
            {url && (
              <>
                <HeaderBtn onClick={handleDownload} title="Download">
                  <DownloadOutlinedIcon style={{ fontSize: 20 }} />
                </HeaderBtn>
                <HeaderBtn onClick={handleOpenTab} title="Open in new tab">
                  <OpenInNewOutlinedIcon style={{ fontSize: 20 }} />
                </HeaderBtn>
              </>
            )}
            <CloseBtn onClick={close} title="Close (Esc)">
              <CloseIcon style={{ fontSize: 20 }} />
            </CloseBtn>
          </HeaderActions>
        </PanelHeader>

        {/* ── Body ── */}
        <PanelBody>
          {loading && (
            <StateWrap>
              <Spinner />
              <StateText>Loading preview…</StateText>
            </StateWrap>
          )}

          {error && (
            <StateWrap>
              <StateIcon>⚠️</StateIcon>
              <StateText>{error}</StateText>
            </StateWrap>
          )}

          {url && !loading && category === "image" && (
            <ImagePreview src={url} alt={file.filename} />
          )}

          {url && !loading && category === "video" && (
            <VideoPreview controls src={url}>
              Your browser does not support video playback.
            </VideoPreview>
          )}

          {url && !loading && category === "audio" && (
            <AudioWrap>
              <AudioIcon $bgVar={bgVar} $colorVar={colorVar}>
                <FileIcons type={file.contentType} />
              </AudioIcon>
              <AudioName>{file.filename}</AudioName>
              <AudioPlayer controls src={url}>
                Your browser does not support audio playback.
              </AudioPlayer>
            </AudioWrap>
          )}

          {url && !loading && category === "pdf" && (
            <PdfPreview src={url} type="application/pdf" title={file.filename} />
          )}

          {url && !loading && category === "other" && (
            <StateWrap>
              <OtherIcon $bgVar={bgVar} $colorVar={colorVar}>
                <FileIcons type={file.contentType} />
              </OtherIcon>
              <StateText style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-1)" }}>
                {file.filename}
              </StateText>
              <StateText>Preview not available for this file type.</StateText>
              <DownloadBigBtn onClick={handleDownload}>
                <DownloadOutlinedIcon /> Download file
              </DownloadBigBtn>
            </StateWrap>
          )}
        </PanelBody>
      </Panel>

      {hasNext && (
        <NavBtn
          type="button"
          $side="right"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          title="Next file (→)"
          aria-label="Next file"
        >
          <ChevronRightIcon />
        </NavBtn>
      )}
    </Backdrop>
  );
}

/* ── Animations ── */
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* ── Layout ── */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 72px;
  animation: ${fadeIn} 0.18s ease;

  @media (max-width: 640px) {
    padding: 16px 48px;
  }
`;

const Panel = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.4);
  animation: ${slideUp} 0.22s cubic-bezier(0.4, 0, 0.2, 1);
`;

/* ── Header ── */
const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  gap: 12px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const FileIconWrap = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 20px;
  }
`;

const FileDetails = styled.div`
  min-width: 0;
`;

const FileName = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(480px, 50vw);
`;

const FileMeta = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 1px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const HeaderBtn = styled.button`
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
`;

const CloseBtn = styled(HeaderBtn)`
  &:hover {
    background: var(--danger-bg);
    color: var(--danger);
  }
`;

const NavBtn = styled.button`
  position: fixed;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 16px;" : "right: 16px;")}
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  z-index: 2001;
  transition: all 0.15s ease;
  backdrop-filter: blur(8px);

  svg {
    font-size: 28px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-50%) scale(1.05);
  }

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
    ${(p) => (p.$side === "left" ? "left: 8px;" : "right: 8px;")}

    svg {
      font-size: 24px;
    }
  }
`;

/* ── Body ── */
const PanelBody = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: var(--surface-3);
`;

/* ── Preview types ── */
const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  display: block;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 75vh;
  display: block;
  background: #000;
`;

const PdfPreview = styled.embed`
  width: 100%;
  height: 75vh;
  display: block;
  border: none;
`;

/* ── Audio ── */
const AudioWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 48px 32px;
`;

const AudioIcon = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 52px;
  }
`;

const AudioName = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-1);
  text-align: center;
  max-width: 400px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  max-width: 400px;
`;

/* ── States (loading / error / other) ── */
const StateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 32px;
  text-align: center;
`;

const StateText = styled.p`
  font-size: 0.875rem;
  color: var(--text-3);
  max-width: 320px;
`;

const StateIcon = styled.div`
  font-size: 2.5rem;
`;

const OtherIcon = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 52px;
  }
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  animation: ${spin} 0.7s linear infinite;
`;

const DownloadBigBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  svg { font-size: 20px; }
`;

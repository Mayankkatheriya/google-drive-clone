"use client";

import { useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { OneTimeLinkIcon } from "@/components/common/SvgIcons";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DiskDriveLogo from "@/components/common/DiskDriveLogo";
import FileIcons from "@/components/common/FileIcons";
import { changeBytes } from "@/components/common/common";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import ShareSecurePdf from "./ShareSecurePdf";
import ShareSecureImage from "./ShareSecureImage";
import ShareSecureVideo from "./ShareSecureVideo";
import ShareSecureAudio from "./ShareSecureAudio";

function getPreviewKind(contentType = "") {
  if (contentType.includes("image")) return "image";
  if (contentType.includes("pdf")) return "pdf";
  if (contentType.includes("video")) return "video";
  if (contentType.includes("audio")) return "audio";
  return "other";
}

export default function ShareLinkView({ state }) {
  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();
    document.addEventListener("contextmenu", blockContextMenu);
    return () => document.removeEventListener("contextmenu", blockContextMenu);
  }, []);

  const kind =
    state.status === "ready" ? getPreviewKind(state.contentType) : null;
  const tokens =
    state.status === "ready"
      ? getFileTypeTokens(state.contentType, state.filename)
      : null;

  return (
    <Page onContextMenu={(event) => event.preventDefault()}>
      <Shell>
        <BrandRow>
          <DiskDriveLogo size={28} />
          <BrandText>Disk Drive</BrandText>
          <Badge>
            <OneTimeLinkIcon />
            One-time link
          </Badge>
        </BrandRow>

        {state.status === "ready" && (
          <Card>
            <FileHead>
              <IconWrap $bgVar={tokens.bgVar} $colorVar={tokens.colorVar}>
                <FileIcons type={state.contentType} />
              </IconWrap>
              <FileMeta>
                <CardTitle>{state.filename}</CardTitle>
                <CardSub>
                  {changeBytes(state.size)} · Shared securely · Single use
                </CardSub>
              </FileMeta>
            </FileHead>

            <PreviewWrap onContextMenu={(event) => event.preventDefault()}>
              {kind === "image" && (
                <ShareSecureImage token={state.token} alt={state.filename} />
              )}
              {kind === "pdf" && (
                <ShareSecurePdf token={state.token} title={state.filename} />
              )}
              {kind === "video" && (
                <ShareSecureVideo token={state.token} title={state.filename} />
              )}
              {kind === "audio" && (
                <ShareSecureAudio token={state.token} title={state.filename} />
              )}
              {kind === "other" && (
                <OtherPreview>
                  <FileIcons type={state.contentType} />
                  <p>Preview not available for this file type</p>
                </OtherPreview>
              )}
            </PreviewWrap>

            <Notice>
              This link has now been used and cannot be opened again.
            </Notice>
          </Card>
        )}

        {(state.status === "used" || state.status === "missing") && (
          <Card $muted>
            <StatusIcon $tone="warn">
              <LockOutlinedIcon />
            </StatusIcon>
            <CardTitle>
              {state.status === "used"
                ? "Link already used"
                : "Link not found"}
            </CardTitle>
            <CardSub>
              {state.message ||
                (state.status === "used"
                  ? "One-time links expire after the first open."
                  : "This share link may be invalid or removed.")}
            </CardSub>
            <HomeLink href="/">Go to Disk Drive</HomeLink>
          </Card>
        )}

        {state.status === "error" && (
          <Card $muted>
            <StatusIcon $tone="danger">
              <ErrorOutlineOutlinedIcon />
            </StatusIcon>
            <CardTitle>Something went wrong</CardTitle>
            <CardSub>{state.message}</CardSub>
            <HomeLink href="/">Go to Disk Drive</HomeLink>
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
  user-select: none;
  -webkit-user-select: none;
`;

const Shell = styled.div`
  width: min(720px, 100%);
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
    font-size: 14px;
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 24px;
  text-align: ${(p) => (p.$muted ? "center" : "left")};

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const FileHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 22px;
  }
`;

const FileMeta = styled.div`
  min-width: 0;
`;

const CardTitle = styled.h1`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
  word-break: break-word;
`;

const CardSub = styled.p`
  margin-top: 4px;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-3);
`;

const PreviewWrap = styled.div`
  margin-bottom: 16px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  overflow: auto;
  background: var(--surface-2);
`;

const OtherPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 16px;
  color: var(--text-3);

  svg {
    font-size: 40px;
  }

  p {
    font-size: 0.86rem;
  }
`;

const Notice = styled.p`
  margin-top: 0;
  font-size: 0.74rem;
  color: var(--text-3);
  line-height: 1.45;
  text-align: center;
`;

const StatusIcon = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.$tone === "danger" ? "var(--danger-bg)" : "var(--primary-light)"};
  color: ${(p) => (p.$tone === "danger" ? "var(--danger)" : "var(--primary)")};

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
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);

  &:hover {
    background: var(--surface-3);
    border-color: var(--border);
    color: var(--text-1);
  }
`;

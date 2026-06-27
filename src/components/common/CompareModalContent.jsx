"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import { Modal } from "@mui/material";
import { useCompare } from "@/context/CompareContext";
import { getFileDownloadUrl } from "@/lib/fileAccess";
import { getCompareKind } from "@/lib/compareFiles";
import { changeBytes } from "./common";
import FileIcons from "./FileIcons";
import { getFileTypeTokens } from "@/lib/fileTypeColors";

export default function CompareModalContent() {
  const { selected, modalOpen, closeCompare } = useCompare();
  const [urls, setUrls] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const left = selected[0]?.data;
  const right = selected[1]?.data;
  const kind = left ? getCompareKind(left.contentType) : null;

  useEffect(() => {
    if (!modalOpen || !left || !right) {
      setUrls([null, null]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getFileDownloadUrl(left), getFileDownloadUrl(right)])
      .then(([leftUrl, rightUrl]) => {
        if (cancelled) return;
        setUrls([leftUrl, rightUrl]);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load files for comparison.");
        setUrls([null, null]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modalOpen, left, right]);

  if (!modalOpen || !left || !right) return null;

  return (
    <Modal open={modalOpen} onClose={closeCompare}>
      <Panel>
        <Header>
          <HeaderLeft>
            <HeaderIcon>
              <CompareArrowsRoundedIcon style={{ fontSize: 20 }} />
            </HeaderIcon>
            <HeaderText>
              <Title>Compare files</Title>
              <Sub>
                {kind === "pdf" ? "PDF side-by-side" : "Image side-by-side"}
              </Sub>
            </HeaderText>
          </HeaderLeft>
          <CloseBtn type="button" onClick={closeCompare} aria-label="Close">
            <CloseRoundedIcon style={{ fontSize: 20 }} />
          </CloseBtn>
        </Header>

        <CompareGrid>
          {[left, right].map((file, index) => {
            const tokens = getFileTypeTokens(file.contentType, file.filename);
            const url = urls[index];
            return (
              <Pane key={file.s3Key ?? index}>
                <PaneHead>
                  <PaneIcon $bgVar={tokens.bgVar} $colorVar={tokens.colorVar}>
                    <FileIcons type={file.contentType} />
                  </PaneIcon>
                  <PaneMeta>
                    <PaneName title={file.filename}>{file.filename}</PaneName>
                    <PaneSize>{changeBytes(file.size)}</PaneSize>
                  </PaneMeta>
                </PaneHead>
                <PaneBody>
                  {loading && <StateText>Loading…</StateText>}
                  {error && !loading && <StateText>{error}</StateText>}
                  {!loading && !error && url && kind === "image" && (
                    <CompareImage src={url} alt={file.filename} />
                  )}
                  {!loading && !error && url && kind === "pdf" && (
                    <ComparePdf src={url} title={file.filename} />
                  )}
                </PaneBody>
              </Pane>
            );
          })}
        </CompareGrid>
      </Panel>
    </Modal>
  );
}

const Panel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(96vw, 1100px);
  max-height: min(92vh, 820px);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 18px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  outline: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const HeaderIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-1);
`;

const Sub = styled.p`
  font-size: 0.74rem;
  color: var(--text-3);
  margin-top: 2px;
`;

const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-2);
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

const CompareGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  border-right: 1px solid var(--border-light);

  &:last-child {
    border-right: none;
  }

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    min-height: 280px;

    &:last-child {
      border-bottom: none;
    }
  }
`;

const PaneHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
`;

const PaneIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(${(p) => p.$bgVar});
  color: var(${(p) => p.$colorVar});

  svg {
    font-size: 17px;
  }
`;

const PaneMeta = styled.div`
  min-width: 0;
`;

const PaneName = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PaneSize = styled.p`
  font-size: 0.7rem;
  color: var(--text-3);
  margin-top: 1px;
`;

const PaneBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  padding: 12px;
`;

const CompareImage = styled.img`
  max-width: 100%;
  max-height: min(62vh, 640px);
  object-fit: contain;
  border-radius: 8px;
`;

const ComparePdf = styled.iframe`
  width: 100%;
  height: min(62vh, 640px);
  border: none;
  border-radius: 8px;
  background: var(--surface);
`;

const StateText = styled.p`
  font-size: 0.85rem;
  color: var(--text-3);
`;

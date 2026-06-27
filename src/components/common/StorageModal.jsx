"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import { useStorageInfo } from "@/hooks/useStorageInfo";
import { useMyFiles, useTrashFiles } from "@/context/FilesContext";
import { useFileTrashActions } from "@/hooks/useFileTrashActions";
import { changeBytes } from "./common";
import { computeStorageBreakdown } from "@/lib/storageBreakdown";
import { getFileTypeTokens } from "@/lib/fileTypeColors";
import { MAX_USER_STORAGE_BYTES } from "@/lib/uploadLimits";
import FileIcons from "./FileIcons";
import Tooltip from "./Tooltip";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function StorageRing({ percent, categories, usedFraction }) {
  let offset = 0;
  const segments = categories.map((cat) => {
    const segLen = (cat.percent / 100) * usedFraction * RING_C;
    const dash = `${segLen} ${RING_C - segLen}`;
    const seg = { dash, offset: -offset, colorVar: cat.colorVar };
    offset += segLen;
    return seg;
  });

  return (
    <RingWrap>
      <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={RING_R}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth="10"
        />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="64"
            cy="64"
            r={RING_R}
            fill="none"
            stroke={`var(${seg.colorVar})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={seg.dash}
            strokeDashoffset={seg.offset}
            transform="rotate(-90 64 64)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        ))}
        {categories.length === 0 && percent > 0 && (
          <circle
            cx="64"
            cy="64"
            r={RING_R}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(percent / 100) * RING_C} ${RING_C}`}
            transform="rotate(-90 64 64)"
          />
        )}
      </svg>
      <RingCenter>
        <RingPct>{percent.toFixed(1)}%</RingPct>
        <RingLabel>used</RingLabel>
      </RingCenter>
    </RingWrap>
  );
}

const StorageModal = ({ open, onClose }) => {
  const { storage, storageLimitLabel, storagePercent } = useStorageInfo();
  const myFiles = useMyFiles();
  const trashFiles = useTrashFiles();
  const { confirmMoveToTrash, confirmPermanentDelete } = useFileTrashActions();

  const breakdown = useMemo(
    () => computeStorageBreakdown(myFiles, trashFiles),
    [myFiles, trashFiles],
  );

  const usedFraction = storagePercent / 100;
  const freeBytes = Math.max(0, MAX_USER_STORAGE_BYTES - breakdown.totalBytes);

  const handleFreeSpace = async (file) => {
    if (file.location === "trash") {
      await confirmPermanentDelete(file.id, file.data);
      return;
    }
    await confirmMoveToTrash(file.id, file.data);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <StorageModalBox>
        <ModalHeader>
          <HeaderLeft>
            <HeaderIcon>
              <StorageRoundedIcon style={{ fontSize: 20 }} />
            </HeaderIcon>
            <HeaderText>
              <ModalTitle>Storage</ModalTitle>
              <ModalSub>Manage your disk space</ModalSub>
            </HeaderText>
          </HeaderLeft>
          <CloseBtn onClick={onClose} aria-label="Close">
            <CloseRoundedIcon style={{ fontSize: 20 }} />
          </CloseBtn>
        </ModalHeader>

        <HeroBlock>
          <StorageRing
            percent={storagePercent}
            categories={breakdown.categories}
            usedFraction={usedFraction}
          />
          <HeroMeta>
            <HeroUsed>{storage}</HeroUsed>
            <HeroLimit>of {storageLimitLabel}</HeroLimit>
            <HeroFree>{changeBytes(freeBytes)} available</HeroFree>
          </HeroMeta>
        </HeroBlock>

        {breakdown.fileCount > 0 && (
          <>
            <StatGrid>
              <StatCard $accent="var(--primary)">
                <StatCardLabel>My Drive</StatCardLabel>
                <StatCardValue>{changeBytes(breakdown.driveBytes)}</StatCardValue>
                <StatCardBar>
                  <StatCardFill
                    $color="var(--primary)"
                    $pct={breakdown.drivePercent}
                  />
                </StatCardBar>
              </StatCard>
              <StatCard $accent="var(--trash)">
                <StatCardLabel>Trash</StatCardLabel>
                <StatCardValue>{changeBytes(breakdown.trashBytes)}</StatCardValue>
                <StatCardBar>
                  <StatCardFill
                    $color="var(--trash)"
                    $pct={breakdown.trashPercent || 0}
                  />
                </StatCardBar>
              </StatCard>
            </StatGrid>

            {breakdown.categories.length > 0 && (
              <Block>
                <BlockTitle>File breakdown</BlockTitle>
                <StackedBar>
                  {breakdown.categories.map((cat) => (
                    <StackedSeg
                      key={cat.id}
                      $colorVar={cat.colorVar}
                      $pct={cat.percent}
                    />
                  ))}
                </StackedBar>
                <LegendGrid>
                  {breakdown.categories.map((cat) => (
                    <LegendItem key={cat.id}>
                      <LegendDot $colorVar={cat.colorVar} />
                      <LegendText>
                        <LegendLabel>{cat.label}</LegendLabel>
                        <LegendMeta>
                          {changeBytes(cat.bytes)} · {cat.percent.toFixed(0)}%
                        </LegendMeta>
                      </LegendText>
                    </LegendItem>
                  ))}
                </LegendGrid>
              </Block>
            )}

            {breakdown.topFiles.length > 0 && (
              <FilesScrollSection>
                <BlockTitle>Largest files</BlockTitle>
                <FileRowsScroll>
                      {breakdown.topFiles.map((file, index) => {
                        const typeStyle = getFileTypeTokens(
                          file.contentType,
                          file.filename,
                        );
                    return (
                      <FileRow key={`${file.location}-${file.id}`}>
                        <Rank>{index + 1}</Rank>
                        <FileIconWrap
                          $colorVar={typeStyle.colorVar}
                          $bgVar={typeStyle.bgVar}
                        >
                          <FileIcons type={file.contentType} />
                        </FileIconWrap>
                        <FileMeta>
                          <Tooltip label={file.filename} onlyIfTruncated>
                            <FileName>{file.filename}</FileName>
                          </Tooltip>
                          <FileSizeRow>
                            <FileSize>{changeBytes(file.size)}</FileSize>
                            {file.location === "trash" && (
                              <TrashBadge>Trash</TrashBadge>
                            )}
                          </FileSizeRow>
                        </FileMeta>
                        <Tooltip
                          label={
                            file.location === "trash"
                              ? "Delete permanently"
                              : "Move to trash"
                          }
                          iconOnly
                        >
                          <FreeBtn
                            type="button"
                            onClick={() => handleFreeSpace(file)}
                            aria-label={`Free space: ${file.filename}`}
                          >
                            <DeleteOutlineRoundedIcon style={{ fontSize: 18 }} />
                          </FreeBtn>
                        </Tooltip>
                      </FileRow>
                    );
                  })}
                </FileRowsScroll>
              </FilesScrollSection>
            )}
          </>
        )}

        <Footnote>
          5 MB max per file · 100 MB total per account
        </Footnote>
      </StorageModalBox>
    </Modal>
  );
};

const StorageModalBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  width: 92%;
  max-width: 420px;
  max-height: min(92vh, 720px);
  border-radius: 20px;
  padding: 22px 18px 18px 22px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  outline: none;
  overflow: hidden;
`;

const scrollStyles = `
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-3);
  }

  [data-theme="dark"] &::-webkit-scrollbar-thumb {
    background: var(--border);
  }

  [data-theme="dark"] &::-webkit-scrollbar-thumb:hover {
    background: var(--text-3);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
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

const ModalTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  line-height: 1.2;
`;

const ModalSub = styled.p`
  font-size: 0.76rem;
  color: var(--text-3);
  margin-top: 2px;
`;

const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-2);
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

const HeroBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 4px 0 20px;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const RingWrap = styled.div`
  position: relative;
  width: 128px;
  height: 128px;
  flex-shrink: 0;
`;

const RingCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const RingPct = styled.span`
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.03em;
  line-height: 1;
`;

const RingLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 3px;
`;

const HeroMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeroUsed = styled.p`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-1);
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const HeroLimit = styled.p`
  font-size: 0.85rem;
  color: var(--text-2);
  margin-top: 4px;
`;

const HeroFree = styled.p`
  display: inline-block;
  margin-top: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 999px;
  padding: 4px 10px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
  flex-shrink: 0;
`;

const StatCard = styled.div`
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 12px 14px;
  border-top: 3px solid ${(props) => props.$accent};
`;

const StatCardLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-3);
  margin-bottom: 4px;
`;

const StatCardValue = styled.p`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 10px;
`;

const StatCardBar = styled.div`
  height: 3px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
`;

const StatCardFill = styled.div`
  height: 100%;
  width: ${(props) => props.$pct}%;
  background: ${(props) => props.$color};
  border-radius: 999px;
  min-width: ${(props) => (props.$pct > 0 ? "2px" : "0")};
`;

const Block = styled.section`
  margin-bottom: 14px;
  flex-shrink: 0;
`;

const BlockTitle = styled.h4`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 10px;
  flex-shrink: 0;
`;

const StackedBar = styled.div`
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--surface-3);
  margin-bottom: 12px;
`;

const StackedSeg = styled.div`
  width: ${(props) => props.$pct}%;
  background: var(${(props) => props.$colorVar});
  min-width: ${(props) => (props.$pct > 0 ? "3px" : "0")};
  transition: width 0.5s ease;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: 10px;
`;

const LegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(${(props) => props.$colorVar});
  flex-shrink: 0;
  margin-top: 4px;
`;

const LegendText = styled.div`
  min-width: 0;
`;

const LegendLabel = styled.p`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-1);
`;

const LegendMeta = styled.p`
  font-size: 0.68rem;
  color: var(--text-3);
  margin-top: 1px;
`;

const FilesScrollSection = styled.section`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const FileRowsScroll = styled.div`
  flex: 1;
  min-height: 0;
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 2px;
  ${scrollStyles}
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--border);
  }
`;

const Rank = styled.span`
  width: 18px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-3);
  text-align: center;
  flex-shrink: 0;
`;

const FileIconWrap = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(${(props) => props.$bgVar});
  color: var(${(props) => props.$colorVar});
  flex-shrink: 0;

  svg {
    font-size: 17px;
  }
`;

const FileMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSizeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
`;

const FileSize = styled.span`
  font-size: 0.7rem;
  color: var(--text-3);
`;

const TrashBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--trash);
  background: var(--trash-bg);
  border-radius: 4px;
  padding: 1px 5px;
`;

const FreeBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  color: var(--text-3);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: var(--danger-bg);
    border-color: transparent;
    color: var(--danger);
  }
`;

const Footnote = styled.p`
  font-size: 0.68rem;
  color: var(--text-3);
  text-align: center;
  padding-top: 4px;
  flex-shrink: 0;
`;

export default StorageModal;

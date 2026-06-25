"use client";

import React from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import closeJson from "../lottie/closeLottie.json";
import { useStorageInfo } from "@/hooks/useStorageInfo";

const StorageModal = ({ open, onClose }) => {
  const { storage, storageLimitLabel, storagePercent } = useStorageInfo();

  return (
    <Modal open={open} onClose={onClose}>
      <StorageModalBox>
        <CloseBtn onClick={onClose} aria-label="Close">
          <Lottie loop animationData={closeJson} play style={{ width: 40, height: 40 }} />
        </CloseBtn>
        <ModalTitle>Storage Usage</ModalTitle>
        <ModalBody>
          <BigTrack>
            <BigFill $pct={storagePercent} />
          </BigTrack>
          <BarLabel>
            <strong>{storage}</strong> of {storageLimitLabel} used &nbsp;·&nbsp;
            <BarPct>{storagePercent.toFixed(1)}%</BarPct>
          </BarLabel>
          <StorageTips>
            <TipItem>
              <span>📁</span>
              <span>Max file size: 5 MB per upload</span>
            </TipItem>
            <TipItem>
              <span>💾</span>
              <span>Total storage: 100 MB per account</span>
            </TipItem>
          </StorageTips>
        </ModalBody>
      </StorageModalBox>
    </Modal>
  );
};

const StorageModalBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  width: 90%;
  max-width: 440px;
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow-lg);
  outline: none;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  line-height: 0;
`;

const ModalTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  text-align: center;
  margin-bottom: 20px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BigTrack = styled.div`
  width: 100%;
  height: 10px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
`;

const BigFill = styled.div`
  height: 100%;
  width: ${(props) => props.$pct}%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const BarLabel = styled.p`
  font-size: 0.9rem;
  color: var(--text-2);
  text-align: center;

  strong {
    color: var(--text-1);
  }
`;

const BarPct = styled.span`
  color: #2563eb;
  font-weight: 600;
`;

const StorageTips = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--surface-2);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 4px;
`;

const TipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-2);
`;

export default StorageModal;

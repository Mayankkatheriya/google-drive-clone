"use client";

import styled, { keyframes } from "styled-components";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";
import { getUploadLimitLabel } from "@/lib/uploadLimits";

export default function VoiceMemoModal({
  open,
  onClose,
  status,
  durationLabel,
  fileName,
  onFileNameChange,
  error,
  previewUrl,
  uploading,
  progress,
  onStart,
  onStop,
  onDiscard,
  onUpload,
}) {
  const isUploading = status === "uploading" || uploading;

  return (
    <Modal open={open} onClose={() => !isUploading && onClose()}>
      <ModalBox>
        {!isUploading && (
          <CloseBtn type="button" onClick={onClose} aria-label="Close">
            <Lottie
              loop
              animationData={closeJson}
              play
              style={{ width: 40, height: 40 }}
            />
          </CloseBtn>
        )}

        <ModalHead>
          <ModalTitle>
            {isUploading ? "Uploading voice memo…" : "Record voice memo"}
          </ModalTitle>
          {!isUploading && (
            <ModalHint>
              Record notes, ideas, or reminders straight to My Drive. Max{" "}
              {getUploadLimitLabel()}.
            </ModalHint>
          )}
        </ModalHead>

        <ModalBody>
          {isUploading ? (
            <UploadingState>
              <Lottie
                loop
                animationData={uploadJson}
                play
                style={{ width: 120, height: 80 }}
              />
              <ProgressWrap>
                <ProgressTrack>
                  <ProgressFill $pct={progress} />
                </ProgressTrack>
                <ProgressLabel>{progress}%</ProgressLabel>
              </ProgressWrap>
            </UploadingState>
          ) : (
            <>
              {status === "idle" && (
                <RecordStage>
                  <MicOrb type="button" onClick={onStart} aria-label="Start recording">
                    <MicRoundedIcon />
                  </MicOrb>
                  <StageTitle>Tap to start recording</StageTitle>
                  <StageSub>Your microphone will be used for this recording only</StageSub>
                </RecordStage>
              )}

              {status === "recording" && (
                <RecordStage>
                  <RecordingPulse>
                    <LiveDot />
                    <RecordingTime>{durationLabel}</RecordingTime>
                  </RecordingPulse>
                  <StageTitle>Recording…</StageTitle>
                  <StageSub>Speak clearly, then tap stop when finished</StageSub>
                  <StopBtn type="button" onClick={onStop}>
                    <StopRoundedIcon />
                    Stop recording
                  </StopBtn>
                </RecordStage>
              )}

              {status === "recorded" && (
                <>
                  <PreviewCard>
                    <PreviewLabel>Preview</PreviewLabel>
                    {previewUrl && (
                      <audio controls src={previewUrl} preload="metadata">
                        Your browser does not support audio playback.
                      </audio>
                    )}
                  </PreviewCard>

                  <RenameField>
                    <RenameLabel htmlFor="voice-memo-name">File name</RenameLabel>
                    <RenameInput
                      id="voice-memo-name"
                      type="text"
                      value={fileName}
                      onChange={(event) => onFileNameChange(event.target.value)}
                      placeholder="Voice memo name"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </RenameField>

                  <ActionRow>
                    <SecondaryBtn type="button" onClick={onDiscard}>
                      <ReplayRoundedIcon />
                      Re-record
                    </SecondaryBtn>
                    <PrimaryBtn
                      type="button"
                      onClick={onUpload}
                      disabled={!fileName?.trim()}
                    >
                      Upload memo
                    </PrimaryBtn>
                  </ActionRow>
                </>
              )}

              {error && <ErrorText>{error}</ErrorText>}
            </>
          )}
        </ModalBody>
      </ModalBox>
    </Modal>
  );
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.06); opacity: 0.92; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const ModalBox = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface);
  width: 90%;
  max-width: 460px;
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

const ModalHead = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
`;

const ModalTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-1);
  margin-bottom: 4px;
`;

const ModalHint = styled.p`
  font-size: 0.8rem;
  color: var(--text-3);
  line-height: 1.45;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecordStage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 4px;
  text-align: center;
`;

const MicOrb = styled.button`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    var(--primary) 0%,
    color-mix(in srgb, var(--primary) 70%, #7c3aed) 100%
  );
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--primary) 35%, transparent);
  transition: transform var(--transition), box-shadow var(--transition);

  svg {
    font-size: 36px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px color-mix(in srgb, var(--primary) 40%, transparent);
  }
`;

const RecordingPulse = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-full);
  background: var(--danger-bg);
  border: 1px solid color-mix(in srgb, var(--danger) 25%, transparent);
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

const LiveDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--danger);
  animation: ${blink} 1s ease-in-out infinite;
`;

const RecordingTime = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-1);
  font-variant-numeric: tabular-nums;
`;

const StageTitle = styled.p`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-1);
`;

const StageSub = styled.p`
  font-size: 0.78rem;
  color: var(--text-3);
  line-height: 1.45;
  max-width: 280px;
`;

const StopBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--danger);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition);

  svg {
    font-size: 20px;
  }

  &:hover {
    opacity: 0.92;
  }
`;

const PreviewCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);

  audio {
    width: 100%;
    height: 40px;
  }
`;

const PreviewLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-3);
`;

const RenameField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RenameLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
`;

const RenameInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text-1);
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
`;

const SecondaryBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);

  svg {
    font-size: 18px;
  }

  &:hover {
    background: var(--surface-3);
    border-color: var(--border);
    color: var(--text-1);
  }
`;

const PrimaryBtn = styled.button`
  flex: 1.2;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: ${(p) => (p.disabled ? "var(--border)" : "var(--primary)")};
  color: ${(p) => (p.disabled ? "var(--text-3)" : "#fff")};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
  }
`;

const ErrorText = styled.p`
  font-size: 0.78rem;
  color: var(--danger);
  text-align: center;
  line-height: 1.45;
`;

const UploadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
`;

const ProgressWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: linear-gradient(
    90deg,
    var(--primary) 0%,
    color-mix(in srgb, var(--primary) 60%, #7c3aed) 100%
  );
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
`;

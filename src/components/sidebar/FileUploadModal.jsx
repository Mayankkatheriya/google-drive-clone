"use client";

import styled from "styled-components";
import { useState } from "react";
import { Modal } from "@mui/material";
import Lottie from "react-lottie-player";
import uploadJson from "../lottie/uploadLottie.json";
import closeJson from "../lottie/closeLottie.json";
import { UploadFileIcon } from "../common/SvgIcons";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { getUploadModalHint } from "@/lib/uploadLimits";
import Tooltip from "../common/Tooltip";

const FileUploadModal = ({
  open,
  setOpen,
  handleUpload,
  uploading,
  handleFile,
  stageFile,
  selectedFile,
  fileName,
  onFileNameChange,
  progress,
  onOpenVoiceMemo,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) stageFile?.(file);
  };

  return (
    <Modal open={open} onClose={() => !uploading && setOpen(false)}>
      <ModalBox>
        {!uploading && (
          <CloseBtn onClick={() => setOpen(false)} aria-label="Close">
            <Lottie loop animationData={closeJson} play style={{ width: 40, height: 40 }} />
          </CloseBtn>
        )}

        <form onSubmit={handleUpload}>
          <ModalHead>
            <ModalTitle>
              {uploading ? "Uploading your file…" : "Upload a file"}
            </ModalTitle>
            {!uploading && (
              <ModalHint>{getUploadModalHint()}</ModalHint>
            )}
          </ModalHead>

          <ModalBody>
            {uploading ? (
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
                <DropArea
                  $dragging={dragging}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <DropIcon>
                    <UploadFileIcon />
                  </DropIcon>
                  <DropText>
                    {selectedFile ? (
                      <Tooltip label={selectedFile} onlyIfTruncated>
                        <FileName>{selectedFile}</FileName>
                      </Tooltip>
                    ) : (
                      <>
                        <DropLead>Drag & drop your file here</DropLead>
                        <NoFile>or choose a file below</NoFile>
                      </>
                    )}
                  </DropText>
                  <ChooseLabel htmlFor="drive-file-input">
                    <UploadFileIcon />
                    Choose file
                  </ChooseLabel>
                  <input
                    id="drive-file-input"
                    type="file"
                    onChange={handleFile}
                    style={{ display: "none" }}
                  />
                </DropArea>

                {selectedFile && (
                  <RenameField>
                    <RenameLabel htmlFor="drive-file-name">File name</RenameLabel>
                    <RenameInput
                      id="drive-file-name"
                      type="text"
                      value={fileName}
                      onChange={(e) => onFileNameChange(e.target.value)}
                      placeholder="Enter file name"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <RenameHint>
                      Extension is kept if you omit it (e.g. &quot;report&quot; → report.pdf)
                    </RenameHint>
                  </RenameField>
                )}

                <VoiceMemoLink type="button" onClick={onOpenVoiceMemo}>
                  <MicRoundedIcon />
                  Record a voice memo
                </VoiceMemoLink>

                <SubmitBtn type="submit" disabled={!selectedFile || !fileName?.trim()}>
                  Upload
                </SubmitBtn>
              </>
            )}
          </ModalBody>
        </form>
      </ModalBox>
    </Modal>
  );
};

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
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DropArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 20px;
  border: 2px dashed ${(props) => (props.$dragging ? "var(--primary-hover)" : "var(--primary)")};
  border-radius: 14px;
  background: ${(props) => (props.$dragging ? "var(--primary-subtle)" : "var(--primary-light)")};
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-hover);
    background: var(--primary-subtle);
  }
`;

const DropIcon = styled.div`
  svg {
    font-size: 44px;
    color: #60a5fa;
  }
`;

const DropText = styled.div`
  text-align: center;
`;

const FileName = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropLead = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 4px;
`;

const NoFile = styled.p`
  font-size: 0.875rem;
  color: var(--text-3);
`;

const ChooseLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-1);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    font-size: 18px;
    color: var(--primary);
  }

  &:hover {
    border-color: var(--primary);
    background: var(--primary-light);
    color: var(--primary-hover);
  }
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
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-subtle);
  }

  &::placeholder {
    color: var(--text-3);
  }
`;

const RenameHint = styled.p`
  font-size: 0.72rem;
  color: var(--text-3);
  line-height: 1.4;
`;

const VoiceMemoLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
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
    color: var(--file-audio);
  }

  &:hover {
    background: var(--file-audio-bg);
    border-color: color-mix(in srgb, var(--file-audio) 30%, var(--border));
    color: var(--text-1);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: ${(props) => (props.disabled ? "var(--border)" : "var(--primary)")};
  color: ${(props) => (props.disabled ? "var(--text-3)" : "#fff")};
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
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
  width: ${(props) => props.$pct}%;
  background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
`;

export default FileUploadModal;

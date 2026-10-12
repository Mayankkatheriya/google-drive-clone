"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import CloseIcon from "@mui/icons-material/Close";
import {
  TIME_CAPSULE_PRESETS,
  isSealed,
  formatUnlockDate,
  getSealedRemainingLabel,
} from "@/lib/timeCapsule";

const MAX_MESSAGE = 280;
const MIN_SEAL_MS = 5 * 60 * 1000;
const MAX_SEAL_MS = 10 * 365 * 24 * 60 * 60 * 1000;

function toLocalInput(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function TimeCapsuleModal({ fileData, onSeal, onClose }) {
  const sealed = isSealed(fileData);
  const [presetId, setPresetId] = useState(TIME_CAPSULE_PRESETS[1].id);
  const [unlockInput, setUnlockInput] = useState(() =>
    toLocalInput(Date.now() + TIME_CAPSULE_PRESETS[1].ms),
  );
  const [message, setMessage] = useState("");
  const [ownerAccess, setOwnerAccess] = useState(true);
  const [busy, setBusy] = useState(false);
  const unlockInputRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const unlockAt = unlockInput ? new Date(unlockInput).getTime() : NaN;
  const now = Date.now();
  let dateError = "";
  if (!Number.isFinite(unlockAt)) dateError = "Pick a date and time";
  else if (unlockAt < now + MIN_SEAL_MS) dateError = "Pick a time at least 5 minutes from now";
  else if (unlockAt > now + MAX_SEAL_MS) dateError = "Time capsules can be sealed for up to 10 years";
  const valid = !dateError;

  const chooseCustom = () => {
    setPresetId(null);
    const input = unlockInputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // showPicker throws outside a user gesture or in unsupported browsers; focus is enough.
    }
  };

  const handleSeal = async (event) => {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    const ok = await onSeal(unlockAt, message.trim(), ownerAccess);
    if (!ok) setBusy(false);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <Backdrop onMouseDown={busy ? undefined : onClose}>
      <Card as="form" onSubmit={handleSeal} onMouseDown={(event) => event.stopPropagation()}>
        <CloseBtn type="button" onClick={onClose} disabled={busy} aria-label="Close">
          <CloseIcon />
        </CloseBtn>

        <IconBadge>
          <HourglassTopRoundedIcon />
        </IconBadge>

        <Title>Time capsule</Title>

        {sealed ? (
          <>
            <Sub>
              <strong title={fileData?.filename}>{fileData?.filename}</strong> is
              sealed until <strong>{formatUnlockDate(fileData)}</strong>.{" "}
              {fileData?.capsuleOwnerAccess
                ? "You can still open it. Share links open for others after that time."
                : "Nobody, including you, can open it before then."}
            </Sub>
            <ActiveNote>Opens in {getSealedRemainingLabel(fileData)}</ActiveNote>
            {fileData?.capsuleMessage && (
              <Hint>A note is attached. You&apos;ll see it when the capsule opens.</Hint>
            )}
            <Secondary type="button" onClick={onClose}>
              Close
            </Secondary>
          </>
        ) : (
          <>
            <Sub>
              Seal{" "}
              {fileData?.filename ? (
                <strong title={fileData.filename}>{fileData.filename}</strong>
              ) : (
                "this file"
              )}{" "}
              until a future date. Anyone you share it with sees a countdown
              until then. This can&apos;t be undone.
            </Sub>

            <ModeList role="radiogroup" aria-label="Who has to wait">
              <ModeOption
                type="button"
                role="radio"
                aria-checked={ownerAccess}
                $active={ownerAccess}
                onClick={() => setOwnerAccess(true)}
              >
                <strong>Others wait, I can open it</strong>
                <span>You can view and download it any time. Share links open after the date.</span>
              </ModeOption>
              <ModeOption
                type="button"
                role="radio"
                aria-checked={!ownerAccess}
                $active={!ownerAccess}
                onClick={() => setOwnerAccess(false)}
              >
                <strong>Lock it for me too</strong>
                <span>Completely blocked for everyone, including you, until the date.</span>
              </ModeOption>
            </ModeList>

            <PresetGrid>
              {TIME_CAPSULE_PRESETS.map((preset) => (
                <PresetBtn
                  key={preset.id}
                  type="button"
                  $active={presetId === preset.id}
                  onClick={() => {
                    setPresetId(preset.id);
                    setUnlockInput(toLocalInput(Date.now() + preset.ms));
                  }}
                >
                  {preset.label}
                </PresetBtn>
              ))}
              <CustomBtn type="button" $active={presetId === null} onClick={chooseCustom}>
                Custom date &amp; time
              </CustomBtn>
            </PresetGrid>

            <Field>
              <Label htmlFor="capsule-unlock">Opens on</Label>
              <Input
                ref={unlockInputRef}
                id="capsule-unlock"
                type="datetime-local"
                value={unlockInput}
                min={toLocalInput(now + MIN_SEAL_MS)}
                max={toLocalInput(now + MAX_SEAL_MS)}
                aria-invalid={!valid}
                $invalid={!valid}
                onChange={(event) => {
                  setPresetId(null);
                  setUnlockInput(event.target.value);
                }}
              />
              {dateError && <FieldError role="alert">{dateError}</FieldError>}
            </Field>

            <Field>
              <Label htmlFor="capsule-message">Note for when it opens (optional)</Label>
              <TextArea
                id="capsule-message"
                rows={3}
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Dear future me…"
              />
            </Field>

            <Primary type="submit" disabled={!valid || busy}>
              {busy ? "Sealing…" : "Seal time capsule"}
            </Primary>
          </>
        )}
      </Card>
    </Backdrop>,
    document.body,
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
`;

const Card = styled.div`
  position: relative;
  width: min(380px, 100%);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
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

  &:hover {
    background: var(--surface-2);
    color: var(--text-1);
  }

  svg {
    font-size: 20px;
  }
`;

const IconBadge = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);

  svg {
    font-size: 24px;
  }
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.2px;
`;

const Sub = styled.p`
  margin-top: 6px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-3);

  strong {
    color: var(--text-2);
    word-break: break-word;
  }
`;

const ActiveNote = styled.p`
  margin-top: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
`;

const Hint = styled.p`
  margin-top: 8px;
  font-size: 0.76rem;
  color: var(--text-3);
`;

const ModeList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModeOption = styled.button`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  border-radius: 10px;
  background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-2)")};
  text-align: left;
  cursor: pointer;

  strong {
    font-size: 0.84rem;
    color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-1)")};
  }

  span {
    font-size: 0.74rem;
    line-height: 1.4;
    color: var(--text-3);
  }
`;

const PresetGrid = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const PresetBtn = styled.button`
  height: 40px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  border-radius: var(--radius-md, 10px);
  background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-2)")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-1)")};
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
`;

const CustomBtn = styled(PresetBtn)`
  grid-column: 1 / -1;
`;

const Field = styled.div`
  margin-top: 14px;
  text-align: left;
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
  border: 1px solid ${(p) => (p.$invalid ? "var(--danger)" : "var(--border)")};
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.86rem;
  color-scheme: light dark;

  &:focus {
    outline: none;
    border-color: ${(p) => (p.$invalid ? "var(--danger)" : "var(--primary)")};
  }
`;

const FieldError = styled.p`
  margin-top: 6px;
  font-size: 0.74rem;
  color: var(--danger);
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.86rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Primary = styled.button`
  margin-top: 18px;
  width: 100%;
  height: 42px;
  border: none;
  border-radius: var(--radius-full, 999px);
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

const Secondary = styled.button`
  margin-top: 16px;
  width: 100%;
  height: 40px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full, 999px);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
`;

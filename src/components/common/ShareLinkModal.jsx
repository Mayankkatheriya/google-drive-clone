"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { Modal } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import {
  createShareLink,
  listShareLinks,
  revokeShareLink,
} from "@/lib/shareLink";
import { toast } from "react-toastify";

const PRESETS = [
  { id: "once", label: "One-time", maxViews: 1, expiresInHours: null },
  { id: "week", label: "7 days", maxViews: null, expiresInHours: 24 * 7 },
  { id: "password", label: "Password", maxViews: null, expiresInHours: 24 * 7, needsPassword: true },
  { id: "custom", label: "Custom", maxViews: null, expiresInHours: null },
];

export default function ShareLinkModal({ open, onClose, file }) {
  const [preset, setPreset] = useState("once");
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [expiresInHours, setExpiresInHours] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [links, setLinks] = useState([]);

  const fileId = file?.id;

  const refreshLinks = async () => {
    if (!fileId) return;
    try {
      const next = await listShareLinks(fileId);
      setLinks(next);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!open) return;
    setPreset("once");
    setPassword("");
    setMaxViews("");
    setExpiresInHours("");
    setAllowDownload(true);
    setCreatedUrl("");
    setBusy(false);
    refreshLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileId]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!fileId || busy) return;
    setBusy(true);
    try {
      const selected = PRESETS.find((p) => p.id === preset) || PRESETS[0];
      const options = {
        allowDownload,
        maxViews:
          preset === "custom"
            ? maxViews
              ? Number(maxViews)
              : null
            : selected.maxViews,
        expiresInHours:
          preset === "custom"
            ? expiresInHours
              ? Number(expiresInHours)
              : null
            : selected.expiresInHours,
      };
      if (selected.needsPassword || (preset === "custom" && password)) {
        options.password = password;
      }

      const result = await createShareLink(fileId, options);
      setCreatedUrl(result.url);
      await navigator.clipboard.writeText(result.url);
      toast.success("Share link created and copied");
      await refreshLinks();
    } catch (error) {
      toast.error(error.message || "Failed to create link");
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (token) => {
    try {
      await revokeShareLink(token);
      toast.success("Link revoked");
      await refreshLinks();
    } catch (error) {
      toast.error(error.message || "Failed to revoke");
    }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <Box as="form" onSubmit={handleCreate}>
        <Header>
          <div>
            <Title>Share link</Title>
            <Sub>{file?.data?.filename}</Sub>
          </div>
          <CloseBtn type="button" onClick={onClose} disabled={busy} aria-label="Close">
            <CloseRoundedIcon />
          </CloseBtn>
        </Header>

        <PresetRow>
          {PRESETS.map((p) => (
            <Preset
              key={p.id}
              type="button"
              $active={preset === p.id}
              onClick={() => setPreset(p.id)}
            >
              {p.label}
            </Preset>
          ))}
        </PresetRow>

        {(preset === "password" || preset === "custom") && (
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={preset === "password" ? "Required" : "Optional"}
            />
          </Field>
        )}

        {preset === "custom" && (
          <>
            <Field>
              <Label>Expires in (hours)</Label>
              <Input
                type="number"
                min="1"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                placeholder="No expiry"
              />
            </Field>
            <Field>
              <Label>Max views</Label>
              <Input
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Unlimited"
              />
            </Field>
          </>
        )}

        <CheckRow>
          <input
            id="allow-download"
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
          />
          <label htmlFor="allow-download">Allow download</label>
        </CheckRow>

        <Primary type="submit" disabled={busy || (preset === "password" && password.length < 4)}>
          {busy ? "Creating…" : "Create & copy link"}
        </Primary>

        {createdUrl && (
          <Created>
            <CreatedUrl>{createdUrl}</CreatedUrl>
            <IconBtn
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(createdUrl);
                toast.success("Copied");
              }}
              aria-label="Copy"
            >
              <ContentCopyRoundedIcon />
            </IconBtn>
          </Created>
        )}

        {links.length > 0 && (
          <Manage>
            <ManageTitle>Existing links</ManageTitle>
            {links.map((link) => (
              <LinkRow key={link.token}>
                <LinkMeta>
                  <span>
                    {link.maxViews === 1 ? "One-time" : "Link"} ·{" "}
                    {link.viewCount || 0}
                    {link.maxViews != null ? `/${link.maxViews}` : ""} views
                  </span>
                  <small>
                    {link.revoked
                      ? "Revoked"
                      : link.hasPassword
                        ? "Password"
                        : "Open"}
                    {link.allowDownload === false ? " · No download" : ""}
                  </small>
                </LinkMeta>
                {!link.revoked && (
                  <RevokeBtn type="button" onClick={() => handleRevoke(link.token)}>
                    Revoke
                  </RevokeBtn>
                )}
              </LinkRow>
            ))}
          </Manage>
        )}
      </Box>
    </Modal>
  );
}

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(460px, calc(100vw - 32px));
  max-height: min(85vh, 640px);
  overflow: auto;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
`;

const Sub = styled.p`
  margin-top: 4px;
  font-size: 0.78rem;
  color: var(--text-3);
  word-break: break-word;
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  cursor: pointer;
`;

const PresetRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
`;

const Preset = styled.button`
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${(p) => (p.$active ? "var(--primary)" : "var(--border-light)")};
  background: ${(p) => (p.$active ? "var(--primary-light)" : "var(--surface-2)")};
  color: ${(p) => (p.$active ? "var(--primary)" : "var(--text-2)")};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
`;

const Field = styled.div`
  margin-bottom: 10px;
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
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text-1);
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 16px;
  font-size: 0.84rem;
  color: var(--text-2);
`;

const Primary = styled.button`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 999px;
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

const Created = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
`;

const CreatedUrl = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.74rem;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--primary);
  cursor: pointer;
`;

const Manage = styled.div`
  margin-top: 18px;
  border-top: 1px solid var(--border-light);
  padding-top: 14px;
`;

const ManageTitle = styled.h3`
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const LinkMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  color: var(--text-1);

  small {
    color: var(--text-3);
    font-size: 0.72rem;
  }
`;

const RevokeBtn = styled.button`
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--border-light);
  background: var(--surface-2);
  color: var(--danger);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
`;

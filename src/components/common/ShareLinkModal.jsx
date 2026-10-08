"use client";

import { useEffect, useMemo, useState } from "react";
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

function isLinkAvailable(link) {
  if (!link || link.revoked) return false;
  if (link.expiresAt && link.expiresAt <= Date.now()) return false;
  if (link.maxViews != null && (link.viewCount || 0) >= link.maxViews) return false;
  return true;
}

function shareUrlFor(token) {
  if (typeof window === "undefined") return `/share/${token}`;
  return `${window.location.origin}/share/${token}`;
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return "No expiry";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.ceil(ms / 3600000);
  if (hours < 48) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

export default function ShareLinkModal({ open, onClose, file }) {
  const [preset, setPreset] = useState("once");
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [expiresInHours, setExpiresInHours] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [createdUrl, setCreatedUrl] = useState("");
  const [links, setLinks] = useState([]);

  const fileId = file?.id;

  const availableLinks = useMemo(
    () => (links || []).filter(isLinkAvailable),
    [links],
  );

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
    setRevoking(null);
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
    if (!token || revoking) return;
    setRevoking(token);
    const url = shareUrlFor(token);
    setLinks((prev) => prev.filter((l) => l.token !== token));
    if (createdUrl && (createdUrl === url || createdUrl.endsWith(`/share/${token}`))) {
      setCreatedUrl("");
    }
    try {
      await revokeShareLink(token);
      toast.success("Link revoked");
    } catch (error) {
      toast.error(error.message || "Failed to revoke");
      await refreshLinks();
    } finally {
      setRevoking(null);
    }
  };

  const copyLink = async (token) => {
    const url = shareUrlFor(token);
    await navigator.clipboard.writeText(url);
    toast.success("Copied");
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

        <CreateSection>
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
        </CreateSection>

        <Manage>
          <ManageTitle>
            Available links
            {availableLinks.length > 0 && (
              <Count>{availableLinks.length}</Count>
            )}
          </ManageTitle>
          {availableLinks.length === 0 ? (
            <EmptyLinks>No active share links for this file</EmptyLinks>
          ) : (
            <LinkList>
              {availableLinks.map((link) => {
                const url = shareUrlFor(link.token);
                return (
                  <LinkRow key={link.token}>
                    <LinkMeta>
                      <LinkUrl title={url}>{url}</LinkUrl>
                      <small>
                        {link.maxViews === 1 ? "One-time" : "Link"} ·{" "}
                        {link.viewCount || 0}
                        {link.maxViews != null ? `/${link.maxViews}` : ""} views
                        {" · "}
                        {link.hasPassword ? "Password" : "Open"}
                        {link.allowDownload === false ? " · No download" : ""}
                        {" · "}
                        {formatExpiry(link.expiresAt)}
                      </small>
                    </LinkMeta>
                    <LinkActions>
                      <IconBtn
                        type="button"
                        onClick={() => copyLink(link.token)}
                        aria-label="Copy link"
                        title="Copy"
                      >
                        <ContentCopyRoundedIcon />
                      </IconBtn>
                      <RevokeBtn
                        type="button"
                        disabled={revoking === link.token}
                        onClick={() => handleRevoke(link.token)}
                      >
                        {revoking === link.token ? "…" : "Revoke"}
                      </RevokeBtn>
                    </LinkActions>
                  </LinkRow>
                );
              })}
            </LinkList>
          )}
        </Manage>
      </Box>
    </Modal>
  );
}

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(480px, calc(100vw - 32px));
  max-height: min(88vh, 720px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
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

const CreateSection = styled.div`
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 46vh;
  padding-right: 2px;
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
  flex-shrink: 0;

  svg {
    font-size: 18px;
  }
`;

const Manage = styled.div`
  margin-top: 16px;
  border-top: 1px solid var(--border-light);
  padding-top: 14px;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ManageTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

const Count = styled.span`
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  background: var(--surface-3);
  color: var(--text-2);
  text-transform: none;
  letter-spacing: 0;
`;

const EmptyLinks = styled.p`
  font-size: 0.8rem;
  color: var(--text-3);
  padding: 8px 0 4px;
`;

const LinkList = styled.div`
  flex: 1;
  min-height: 0;
  max-height: min(280px, 32vh);
  overflow-y: auto;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 999px;
  }
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }
`;

const LinkMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-1);

  small {
    color: var(--text-3);
    font-size: 0.72rem;
  }
`;

const LinkUrl = styled.span`
  font-size: 0.74rem;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LinkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

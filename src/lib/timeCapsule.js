import { auth } from "@/firebase";

export const TIME_CAPSULE_PRESETS = [
  { id: "1w", label: "1 week", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "1m", label: "1 month", ms: 30 * 24 * 60 * 60 * 1000 },
  { id: "6m", label: "6 months", ms: 182 * 24 * 60 * 60 * 1000 },
  { id: "1y", label: "1 year", ms: 365 * 24 * 60 * 60 * 1000 },
];

export const MIN_SEAL_MS = 5 * 60 * 1000;
export const MAX_SEAL_MS = 10 * 365 * 24 * 60 * 60 * 1000;
export const MAX_CAPSULE_MESSAGE = 280;

/** Formats millis for a `datetime-local` input in the browser's timezone. */
export function toLocalInput(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function getUnlockInputError(unlockAt, now = Date.now()) {
  if (!Number.isFinite(unlockAt)) return "Pick a date and time";
  if (unlockAt < now + MIN_SEAL_MS) return "Pick a time at least 5 minutes from now";
  if (unlockAt > now + MAX_SEAL_MS) return "Time capsules can be sealed for up to 10 years";
  return "";
}

export function getUnlockMillis(fileData) {
  const value = fileData?.unlockAt;
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  if (typeof value === "number") return value;
  return null;
}

/** True while the capsule is closed to share-link recipients. */
export function isSealed(fileData, now = Date.now()) {
  const ms = getUnlockMillis(fileData);
  return ms != null && now < ms;
}

/** True while the owner is locked out too (sealed without owner access). */
export function isLockedForOwner(fileData, now = Date.now()) {
  return isSealed(fileData, now) && fileData?.capsuleOwnerAccess !== true;
}

export function getSealedRemainingLabel(fileData, now = Date.now()) {
  const ms = getUnlockMillis(fileData);
  if (ms == null) return null;

  const diff = ms - now;
  if (diff <= 0) return null;

  const totalMinutes = Math.floor(diff / 60000);
  if (totalMinutes < 60) return `${Math.max(totalMinutes, 1)}m`;

  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 365) return `${days}d`;

  return `${Math.floor(days / 365)}y`;
}

export function formatUnlockDate(fileDataOrMs) {
  const ms =
    typeof fileDataOrMs === "number" ? fileDataOrMs : getUnlockMillis(fileDataOrMs);
  if (ms == null) return "";
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function sealedError(fileData) {
  const error = new Error(`Sealed until ${formatUnlockDate(fileData)}`);
  error.code = "SEALED";
  return error;
}

export function shareBlockedError(fileData) {
  const error = new Error(
    `Time capsule: use Share link. Others can open it from ${formatUnlockDate(fileData)}`,
  );
  error.code = "SEALED";
  return error;
}

export async function sealTimeCapsule(fileId, unlockAt, message, ownerAccess) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const response = await fetch("/api/time-capsule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({ fileId, unlockAt, message, ownerAccess }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to seal file");
  }
  return data;
}

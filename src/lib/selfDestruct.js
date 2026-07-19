export const SELF_DESTRUCT_PRESETS = [
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "6h", label: "6 hours", ms: 6 * 60 * 60 * 1000 },
  { id: "24h", label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
];

export function getSelfDestructMillis(fileData) {
  const value = fileData?.selfDestructAt;
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  if (typeof value === "number") return value;
  return null;
}

export function hasSelfDestruct(fileData) {
  return getSelfDestructMillis(fileData) != null;
}

export function isSelfDestructExpired(fileData, now = Date.now()) {
  const ms = getSelfDestructMillis(fileData);
  return ms != null && now >= ms;
}

export function getSelfDestructRemainingLabel(fileData, now = Date.now()) {
  const ms = getSelfDestructMillis(fileData);
  if (ms == null) return null;

  const diff = ms - now;
  if (diff <= 0) return "now";

  const totalMinutes = Math.floor(diff / 60000);
  if (totalMinutes < 60) return `${Math.max(totalMinutes, 1)}m`;

  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

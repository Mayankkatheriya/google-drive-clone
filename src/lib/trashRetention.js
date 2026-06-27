export const TRASH_RETENTION_DAYS = 15;

export const TRASH_RETENTION_MS =
  TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function getTrashedAtMillis(fileData) {
  const trashedAt = fileData?.trashedAt;
  if (trashedAt?.toMillis) {
    return trashedAt.toMillis();
  }
  if (trashedAt?.seconds) {
    return trashedAt.seconds * 1000;
  }

  const timestamp = fileData?.timestamp;
  if (timestamp?.toMillis) {
    return timestamp.toMillis();
  }
  if (timestamp?.seconds) {
    return timestamp.seconds * 1000;
  }

  return null;
}

export function isTrashExpired(fileData, now = Date.now()) {
  const trashedAtMs = getTrashedAtMillis(fileData);
  if (!trashedAtMs) {
    return false;
  }
  return now - trashedAtMs >= TRASH_RETENTION_MS;
}

export function getTrashRetentionLabel() {
  return `${TRASH_RETENTION_DAYS} days`;
}

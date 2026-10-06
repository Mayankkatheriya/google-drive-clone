import { isFolder } from "./folders";
import { TRASH_RETENTION_DAYS } from "./trashRetention";

const UNUSED_DAYS = 30;
const LARGE_FILE_BYTES = 1 * 1024 * 1024;

function toMillis(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts.seconds != null) return ts.seconds * 1000;
  if (typeof ts === "number") return ts;
  return null;
}

function normalizeName(name = "") {
  return name.trim().toLowerCase();
}

function detectDuplicates(myFiles = []) {
  const groups = new Map();

  for (const file of myFiles) {
    if (isFolder(file) || !file.data?.s3Key) continue;
    const key = `${normalizeName(file.data.filename)}::${file.data.size || 0}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(file);
  }

  const recommendations = [];
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    const sorted = [...group].sort(
      (a, b) => (b.data.timestamp?.seconds || 0) - (a.data.timestamp?.seconds || 0),
    );
    const keep = sorted[0];
    for (const extra of sorted.slice(1)) {
      recommendations.push({
        id: `dup-${extra.id}`,
        kind: "duplicate",
        title: extra.data.filename,
        detail: `Duplicate of newer copy (${keep.data.filename})`,
        bytes: extra.data.size || 0,
        action: "trash",
        item: extra,
      });
    }
  }
  return recommendations;
}

function detectLargeFiles(myFiles = []) {
  return myFiles
    .filter((f) => !isFolder(f) && (f.data?.size || 0) >= LARGE_FILE_BYTES)
    .sort((a, b) => (b.data.size || 0) - (a.data.size || 0))
    .slice(0, 10)
    .map((file) => ({
      id: `large-${file.id}`,
      kind: "large",
      title: file.data.filename,
      detail: "Large file — consider trashing if unused",
      bytes: file.data.size || 0,
      action: "trash",
      item: file,
    }));
}

function detectUnusedFiles(myFiles = []) {
  const cutoff = Date.now() - UNUSED_DAYS * 24 * 60 * 60 * 1000;
  return myFiles
    .filter((f) => {
      if (isFolder(f) || f.data?.starred) return false;
      const opened = toMillis(f.data?.lastOpenedAt);
      const created = toMillis(f.data?.timestamp) || 0;
      const ref = opened ?? created;
      return ref < cutoff;
    })
    .map((file) => ({
      id: `unused-${file.id}`,
      kind: "unused",
      title: file.data.filename,
      detail: `Not opened in ${UNUSED_DAYS}+ days`,
      bytes: file.data.size || 0,
      action: "trash",
      item: file,
    }));
}

function detectExpiredLinks(links = []) {
  const now = Date.now();
  return links
    .filter((link) => {
      if (link.revoked) return true;
      if (link.expiresAt && link.expiresAt < now) return true;
      if (
        link.maxViews != null &&
        (link.viewCount || 0) >= link.maxViews
      ) {
        return true;
      }
      return false;
    })
    .map((link) => ({
      id: `link-${link.token}`,
      kind: "expiredLink",
      title: link.filename || "Share link",
      detail: link.revoked
        ? "Already revoked — safe to remove"
        : link.expiresAt && link.expiresAt < now
          ? "Expired share link"
          : "View limit reached",
      bytes: 0,
      action: "deleteLink",
      link,
    }));
}

function detectOldTrash(trashFiles = []) {
  const retentionMs = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const warnBefore = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return trashFiles
    .filter((f) => {
      const trashed = toMillis(f.data?.trashedAt) || toMillis(f.data?.timestamp);
      if (!trashed) return false;
      const age = now - trashed;
      return age >= retentionMs - warnBefore;
    })
    .map((file) => {
      const trashed = toMillis(file.data?.trashedAt) || toMillis(file.data?.timestamp);
      const overdue = now - trashed >= retentionMs;
      return {
        id: `trash-${file.id}`,
        kind: "oldTrash",
        title: file.data.filename,
        detail: overdue
          ? "Past retention — permanently delete"
          : "Nearing auto-purge",
        bytes: file.data.size || 0,
        action: "permanentDelete",
        item: file,
      };
    });
}

export function buildCleanupRecommendations({
  myFiles = [],
  trashFiles = [],
  shareLinks = [],
} = {}) {
  const items = [
    ...detectDuplicates(myFiles),
    ...detectLargeFiles(myFiles),
    ...detectUnusedFiles(myFiles),
    ...detectExpiredLinks(shareLinks),
    ...detectOldTrash(trashFiles),
  ];

  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

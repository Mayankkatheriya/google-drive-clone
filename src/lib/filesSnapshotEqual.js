function tsSeconds(ts) {
  return ts?.seconds ?? null;
}

function fileEntryEqual(a, b) {
  if (a.id !== b.id) return false;
  const da = a.data;
  const db = b.data;

  return (
    da.filename === db.filename &&
    Boolean(da.starred) === Boolean(db.starred) &&
    da.size === db.size &&
    da.contentType === db.contentType &&
    da.s3Key === db.s3Key &&
    da.userId === db.userId &&
    tsSeconds(da.timestamp) === tsSeconds(db.timestamp) &&
    tsSeconds(da.lastOpenedAt) === tsSeconds(db.lastOpenedAt) &&
    tsSeconds(da.trashedAt) === tsSeconds(db.trashedAt)
  );
}

export function filesSnapshotEqual(prev, next) {
  if (prev === next) return true;
  if (!prev || !next || prev.length !== next.length) return false;

  for (let i = 0; i < prev.length; i += 1) {
    if (!fileEntryEqual(prev[i], next[i])) return false;
  }

  return true;
}

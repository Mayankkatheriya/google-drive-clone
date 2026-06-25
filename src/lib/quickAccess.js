function getActivityTime(file) {
  return (
    file.data.lastOpenedAt?.seconds ??
    file.data.timestamp?.seconds ??
    0
  );
}

export function getQuickAccessFiles(files, limit = 6) {
  if (!files?.length) return [];

  const starred = files.filter((file) => file.data.starred);
  const recent = [...files].sort(
    (a, b) => getActivityTime(b) - getActivityTime(a)
  );

  const result = [];
  const seen = new Set();

  for (const file of starred.slice(0, 3)) {
    if (result.length >= limit) break;
    result.push(file);
    seen.add(file.id);
  }

  for (const file of recent) {
    if (result.length >= limit) break;
    if (!seen.has(file.id)) {
      result.push(file);
      seen.add(file.id);
    }
  }

  return result;
}

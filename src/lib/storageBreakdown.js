import {
  FILE_CATEGORY_DEFS,
  getFileTypeStyle,
} from "./fileTypeColors";

export { getFileTypeStyle };

function getCategoryId(contentType = "") {
  const ct = contentType.toLowerCase();
  const found = FILE_CATEGORY_DEFS.find(
    (cat) => cat.id !== "other" && cat.match(ct),
  );
  return found?.id ?? "other";
}

function sumFileSizes(files = []) {
  return files.reduce((total, file) => total + (file.data?.size || 0), 0);
}

export function computeStorageBreakdown(myFiles = [], trashFiles = []) {
  const driveBytes = sumFileSizes(myFiles);
  const trashBytes = sumFileSizes(trashFiles);
  const totalBytes = driveBytes + trashBytes;

  const categoryMap = Object.fromEntries(
    FILE_CATEGORY_DEFS.map((cat) => [
      cat.id,
      { ...cat, bytes: 0, count: 0 },
    ]),
  );

  const ingest = (files) => {
    for (const file of files) {
      const size = file.data?.size || 0;
      const catId = getCategoryId(file.data?.contentType);
      categoryMap[catId].bytes += size;
      categoryMap[catId].count += 1;
    }
  };

  ingest(myFiles);
  ingest(trashFiles);

  const categories = FILE_CATEGORY_DEFS.map((cat) => ({
    ...cat,
    bytes: categoryMap[cat.id].bytes,
    count: categoryMap[cat.id].count,
    percent: totalBytes > 0 ? (categoryMap[cat.id].bytes / totalBytes) * 100 : 0,
  })).filter((cat) => cat.bytes > 0);

  const topFiles = [...myFiles, ...trashFiles]
    .map((file) => ({
      id: file.id,
      filename: file.data?.filename ?? "Untitled",
      size: file.data?.size || 0,
      contentType: file.data?.contentType ?? "",
      location: trashFiles.some((t) => t.id === file.id) ? "trash" : "drive",
      data: file.data,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  const drivePercent =
    totalBytes > 0 ? (driveBytes / totalBytes) * 100 : 100;
  const trashPercent =
    totalBytes > 0 ? (trashBytes / totalBytes) * 100 : 0;

  return {
    totalBytes,
    driveBytes,
    trashBytes,
    drivePercent,
    trashPercent,
    fileCount: myFiles.length + trashFiles.length,
    categories,
    topFiles,
  };
}

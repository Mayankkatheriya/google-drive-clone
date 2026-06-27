const FILE_TYPE_DEFS = [
  {
    id: "pdf",
    label: "PDF",
    colorVar: "--file-pdf",
    bgVar: "--file-pdf-bg",
    match: (ct) => ct.includes("pdf"),
  },
  {
    id: "gif",
    label: "GIF",
    colorVar: "--file-gif",
    bgVar: "--file-gif-bg",
    match: (ct) => ct.includes("gif"),
  },
  {
    id: "png",
    label: "PNG",
    colorVar: "--file-image",
    bgVar: "--file-image-bg",
    match: (ct) => ct.includes("png"),
  },
  {
    id: "webp",
    label: "WEBP",
    colorVar: "--file-image",
    bgVar: "--file-image-bg",
    match: (ct) => ct.includes("webp"),
  },
  {
    id: "image",
    label: "IMG",
    colorVar: "--file-image",
    bgVar: "--file-image-bg",
    match: (ct) => ct.includes("image"),
    useExtLabel: true,
  },
  {
    id: "video",
    label: "VID",
    colorVar: "--file-video",
    bgVar: "--file-video-bg",
    match: (ct) => ct.includes("video") || ct.includes("mp4"),
    useExtLabel: true,
  },
  {
    id: "audio",
    label: "AUD",
    colorVar: "--file-audio",
    bgVar: "--file-audio-bg",
    match: (ct) => ct.includes("audio") || ct.includes("mp3"),
    useExtLabel: true,
  },
  {
    id: "other",
    label: "FILE",
    colorVar: "--file-other",
    bgVar: "--file-other-bg",
    match: () => true,
    useExtLabel: true,
  },
];

export const FILE_CATEGORY_DEFS = [
  {
    id: "images",
    label: "Images",
    colorVar: "--file-image",
    bgVar: "--file-image-bg",
    match: (ct) => ct.includes("image"),
  },
  {
    id: "pdfs",
    label: "PDFs",
    colorVar: "--file-pdf",
    bgVar: "--file-pdf-bg",
    match: (ct) => ct.includes("pdf"),
  },
  {
    id: "videos",
    label: "Videos",
    colorVar: "--file-video",
    bgVar: "--file-video-bg",
    match: (ct) => ct.includes("video"),
  },
  {
    id: "audio",
    label: "Audio",
    colorVar: "--file-audio",
    bgVar: "--file-audio-bg",
    match: (ct) => ct.includes("audio"),
  },
  {
    id: "other",
    label: "Other",
    colorVar: "--file-other",
    bgVar: "--file-other-bg",
    match: () => true,
  },
];

function resolveType(contentType = "") {
  const ct = contentType.toLowerCase();
  return (
    FILE_TYPE_DEFS.find((t) => t.id !== "other" && t.match(ct)) ??
    FILE_TYPE_DEFS.find((t) => t.id === "other")
  );
}

export function getFileTypeTokens(contentType = "", filename = "") {
  const type = resolveType(contentType);
  const ext = filename?.split(".").pop()?.toUpperCase().slice(0, 4) || "";
  const label = type.useExtLabel ? ext || type.label : type.label;

  return {
    colorVar: type.colorVar,
    bgVar: type.bgVar,
    label,
  };
}

/** @deprecated use getFileTypeTokens */
export function getFileTypeStyle(contentType = "") {
  const type = resolveType(contentType);
  return { colorVar: type.colorVar, bgVar: type.bgVar, label: type.label };
}

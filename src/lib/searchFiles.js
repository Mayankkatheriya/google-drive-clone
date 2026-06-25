const TYPE_KEYWORDS = {
  image: ["image", "images", "photo", "photos", "png", "jpg", "jpeg", "gif", "webp"],
  pdf: ["pdf", "document", "documents"],
  video: ["video", "videos", "mp4", "mov"],
  audio: ["audio", "music", "mp3", "wav"],
};

function getExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function matchesTypeKeyword(contentType = "", keyword) {
  const k = keyword.toLowerCase();
  if (TYPE_KEYWORDS.image.includes(k)) return contentType.includes("image");
  if (TYPE_KEYWORDS.pdf.includes(k)) return contentType.includes("pdf");
  if (TYPE_KEYWORDS.video.includes(k)) return contentType.includes("video");
  if (TYPE_KEYWORDS.audio.includes(k)) return contentType.includes("audio");
  return false;
}

function scoreFile(file, query) {
  const name = file.data.filename || "";
  const lowerName = name.toLowerCase();
  const ext = getExtension(name);
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  let score = 0;

  if (lowerName === q) score = 100;
  else if (lowerName.startsWith(q)) score = 85;
  else if (lowerName.includes(q)) score = 70;
  else if (ext === q.replace(/^\./, "")) score = 65;

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => lowerName.includes(w))) {
    score = Math.max(score, 75);
  }

  if (matchesTypeKeyword(file.data.contentType, q)) {
    score = Math.max(score, 60);
  }

  if (file.data.starred && lowerName.includes(q)) {
    score += 5;
  }

  return score;
}

export function searchFiles(files, query) {
  const q = query?.trim();
  if (!q) return [];

  return files
    .map((file) => ({ file, score: scoreFile(file, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ file }) => file);
}

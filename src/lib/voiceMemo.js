export function getSupportedVoiceMimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function getVoiceMemoExtension(mimeType = "") {
  if (mimeType.includes("mp4")) return ".m4a";
  if (mimeType.includes("ogg")) return ".ogg";
  return ".webm";
}

export function getDefaultVoiceMemoName(mimeType = "") {
  const ext = getVoiceMemoExtension(mimeType || getSupportedVoiceMimeType());
  const stamp = new Date()
    .toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(",", "");

  return `Voice memo ${stamp}${ext}`;
}

export function formatRecordingDuration(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function blobToVoiceFile(blob, filename) {
  return new File([blob], filename, {
    type: blob.type || "audio/webm",
    lastModified: Date.now(),
  });
}

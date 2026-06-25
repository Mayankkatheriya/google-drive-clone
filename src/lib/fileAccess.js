import { auth } from "@/firebase";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const idToken = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
}

export async function getFileDownloadUrl(fileData, { download = false } = {}) {
  const s3Key = fileData?.s3Key;
  if (!s3Key) {
    throw new Error("File not available");
  }

  const response = await fetch("/api/download-url", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      s3Key,
      filename: fileData.filename,
      disposition: download ? "attachment" : "inline",
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to get download URL");
  }

  const { downloadUrl } = await response.json();
  return downloadUrl;
}

export async function downloadFile(fileData) {
  const s3Key = fileData?.s3Key;
  if (!s3Key) {
    throw new Error("File not available");
  }

  const response = await fetch("/api/download-file", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      s3Key,
      filename: fileData.filename,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to download file");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileData.filename || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export async function deleteFileFromS3(s3Key) {
  if (!s3Key) {
    return;
  }

  const response = await fetch("/api/delete-file", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ s3Key }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete file");
  }
}

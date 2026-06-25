import { auth } from "@/firebase";
import {
  isFileWithinUploadLimit,
} from "@/lib/uploadLimits";

function uploadWithProgress(uploadUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}

export async function uploadFileToS3(file, onProgress, filename) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  if (!isFileWithinUploadLimit(file.size)) {
    throw new Error("File exceeds the 5 MB upload limit.");
  }

  const idToken = await user.getIdToken();
  const contentType = file.type || "application/octet-stream";
  const uploadName = filename || file.name;

  const response = await fetch("/api/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      filename: uploadName,
      contentType,
      fileSize: file.size,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to get upload URL");
  }

  const { uploadUrl, s3Key } = await response.json();
  await uploadWithProgress(uploadUrl, file, contentType, onProgress);

  return {
    s3Key,
    size: file.size,
    contentType,
  };
}

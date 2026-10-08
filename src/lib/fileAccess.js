import { auth } from "@/firebase";
import { toast } from "react-toastify";
import { collectZipEntries, isFolder } from "@/lib/folders";

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

export async function getFileDownloadUrl(
  fileData,
  { download = false, expiresIn } = {},
) {
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
      ...(expiresIn && { expiresIn }),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to get download URL");
  }

  const { downloadUrl } = await response.json();
  return downloadUrl;
}

export async function copyFileLinkWithToast(fileData) {
  const toastId = toast.loading("Copying link…");
  try {
    const url = await getFileDownloadUrl(fileData);
    await navigator.clipboard.writeText(url);
    toast.update(toastId, {
      render: "Link copied",
      type: "success",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    return url;
  } catch (error) {
    toast.update(toastId, {
      render: "Unable to copy link",
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    throw error;
  }
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

export async function downloadFileWithToast(fileData) {
  const toastId = toast.loading("Preparing download…");
  try {
    await downloadFile(fileData);
    toast.update(toastId, {
      render: "Download started",
      type: "success",
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: "Unable to download file",
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    throw error;
  }
}

function uniqueZipName(name, used) {
  const base = name || "file";
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  let i = 2;
  let next = `${stem} (${i})${ext}`;
  while (used.has(next)) {
    i += 1;
    next = `${stem} (${i})${ext}`;
  }
  used.add(next);
  return next;
}

function triggerBlobDownload(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Download selection as a zip (folders keep nested paths).
 * A single lone file still downloads directly (no zip).
 */
export async function downloadSelectionAsZip(selected, allFiles) {
  const items = selected || [];
  if (items.length === 0) {
    throw new Error("Nothing selected");
  }

  const onlyOneFile =
    items.length === 1 && !isFolder(items[0]) && items[0]?.data?.s3Key;
  if (onlyOneFile) {
    await downloadFile(items[0].data);
    return { kind: "file" };
  }

  const entries = collectZipEntries(items, allFiles);
  const fileEntries = entries.filter((e) => e.data?.s3Key);
  const emptyFolders = entries.filter((e) => e.emptyFolder);

  if (fileEntries.length === 0 && emptyFolders.length === 0) {
    throw new Error("No files to download");
  }

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const usedNames = new Set();
  let added = 0;

  for (const folder of emptyFolders) {
    zip.folder(folder.path.replace(/\/$/, ""));
  }

  for (const entry of fileEntries) {
    const data = entry.data;
    try {
      const response = await fetch("/api/download-file", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          s3Key: data.s3Key,
          filename: data.filename,
        }),
      });
      if (!response.ok) continue;
      const blob = await response.blob();
      zip.file(uniqueZipName(entry.path || data.filename || "file", usedNames), blob);
      added += 1;
    } catch {
      /* skip failed file */
    }
  }

  if (added === 0 && emptyFolders.length === 0) {
    throw new Error("Failed to download files");
  }

  const zipName =
    items.length === 1 && isFolder(items[0])
      ? `${items[0].data?.filename || "Folder"}.zip`
      : `Drive download (${added || items.length}).zip`;

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(zipBlob, zipName);
  return { kind: "zip", count: added };
}

export async function downloadSelectionAsZipWithToast(selected, allFiles) {
  const items = selected || [];
  const hasFolder = items.some((i) => isFolder(i));
  const toastId = toast.loading(
    hasFolder || items.length > 1
      ? "Preparing zip…"
      : "Preparing download…",
  );
  try {
    const result = await downloadSelectionAsZip(items, allFiles);
    toast.update(toastId, {
      render:
        result?.kind === "zip" ? "Zip download started" : "Download started",
      type: "success",
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: error?.message === "No files to download"
        ? "Folder is empty"
        : "Unable to download",
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    throw error;
  }
}

/** @deprecated use downloadSelectionAsZipWithToast */
export async function downloadFilesAsZipWithToast(fileItems, allFiles) {
  return downloadSelectionAsZipWithToast(fileItems, allFiles);
}

export async function purgeExpiredTrash() {
  const response = await fetch("/api/purge-trash", {
    method: "POST",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to purge trash");
  }

  return response.json();
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

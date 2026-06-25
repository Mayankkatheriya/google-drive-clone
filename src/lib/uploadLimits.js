export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB per file
export const MAX_USER_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB per user

export function isFileWithinUploadLimit(size) {
  return size <= MAX_UPLOAD_BYTES;
}

export function getUploadLimitLabel() {
  return "5 MB";
}

export function getUserStorageLimitLabel() {
  return "1 GB";
}

export function getTotalStorageBytes(myFiles = [], trashFiles = []) {
  const sumSizes = (files) =>
    files.reduce((total, file) => total + (file.data?.size || 0), 0);

  return sumSizes(myFiles) + sumSizes(trashFiles);
}

export function canAddToUserStorage(currentUsageBytes, newFileBytes) {
  return currentUsageBytes + newFileBytes <= MAX_USER_STORAGE_BYTES;
}

export function getStorageQuotaError() {
  return "Storage full. You have reached the 1 GB limit. Delete files to free space.";
}

export function getUploadHelpText() {
  return `Drag and drop files anywhere, or click New to upload. Max ${getUploadLimitLabel()} per file.`;
}

export function getUploadHelpTextMobile() {
  return `Tap New to upload files. Max ${getUploadLimitLabel()} per file.`;
}

export function getUploadModalHint() {
  return `Drag and drop a file here, or choose one below. Max ${getUploadLimitLabel()}.`;
}

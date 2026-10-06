import { auth } from "@/firebase";
import { toast } from "react-toastify";

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

export async function createShareLink(fileId, options = {}) {
  const response = await fetch("/api/share-link/create", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ fileId, ...options }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to create share link");
  }

  return data;
}

export async function listShareLinks(fileId) {
  const response = await fetch(
    `/api/share-link/list?fileId=${encodeURIComponent(fileId)}`,
    { headers: await getAuthHeaders() },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to list share links");
  }
  return data.links || [];
}

export async function listAllShareLinks() {
  const response = await fetch("/api/share-link/list", {
    headers: await getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to list share links");
  }
  return data.links || [];
}

export async function revokeShareLink(token) {
  const response = await fetch("/api/share-link/revoke", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to revoke link");
  }
  return data;
}

export async function deleteShareLink(token) {
  const response = await fetch("/api/share-link/delete", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ token }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete link");
  }
  return data;
}

export async function createAndCopyShareLink(fileId, options = {}) {
  const { url } = await createShareLink(fileId, options);
  await navigator.clipboard.writeText(url);
  return url;
}

export async function createAndCopyShareLinkWithToast(fileId, options = {}) {
  const toastId = toast.loading("Generating share link…");
  try {
    const url = await createAndCopyShareLink(fileId, {
      maxViews: 1,
      ...options,
    });
    toast.update(toastId, {
      render: "Share link copied",
      type: "success",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    return url;
  } catch (error) {
    toast.update(toastId, {
      render: "Unable to create share link",
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    throw error;
  }
}

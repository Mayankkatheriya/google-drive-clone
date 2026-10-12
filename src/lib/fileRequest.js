import { auth } from "@/firebase";

async function authFetch(url, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function fileRequestUrl(token) {
  if (typeof window === "undefined") return `/request/${token}`;
  return `${window.location.origin}/request/${token}`;
}

export function createFileRequest(options) {
  return authFetch("/api/file-request/create", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

export async function listFileRequests() {
  const data = await authFetch("/api/file-request/list");
  return data.requests || [];
}

export function deleteFileRequest(token) {
  return authFetch("/api/file-request/delete", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

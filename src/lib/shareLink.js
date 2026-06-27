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

export async function createShareLink(fileId) {
  const response = await fetch("/api/share-link/create", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ fileId }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to create share link");
  }

  return data;
}

export async function createAndCopyShareLink(fileId) {
  const { url } = await createShareLink(fileId);
  await navigator.clipboard.writeText(url);
  return url;
}

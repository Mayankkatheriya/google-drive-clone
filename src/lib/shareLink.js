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

export async function createAndCopyShareLinkWithToast(fileId) {
  const toastId = toast.loading("Generating one-time link…");
  try {
    const url = await createAndCopyShareLink(fileId);
    toast.update(toastId, {
      render: "One-time link copied — expires after first open",
      type: "success",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    return url;
  } catch (error) {
    toast.update(toastId, {
      render: "Unable to create one-time link",
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeOnClick: true,
    });
    throw error;
  }
}

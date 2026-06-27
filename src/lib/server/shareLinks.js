import { randomBytes } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "./firestoreAdmin";
import { createDownloadUrl } from "./cloudfront";
import { getObjectStream } from "./s3";

const COLLECTION = "shareLinks";

function shareLinkRef(token) {
  return getAdminFirestore().collection(COLLECTION).doc(token);
}

function assertValidToken(token) {
  if (!token || typeof token !== "string" || token.length < 16) {
    const error = new Error("Invalid share link");
    error.statusCode = 400;
    throw error;
  }
}

export async function getShareLinkRecord(token) {
  assertValidToken(token);

  const snap = await shareLinkRef(token).get();
  if (!snap.exists) {
    return null;
  }

  return snap.data();
}

async function getOwnedFile(fileId, userId) {
  const db = getAdminFirestore();
  const snap = await db.collection("myfiles").doc(fileId).get();

  if (!snap.exists) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  const data = snap.data();
  if (data.userId !== userId) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  if (!data.s3Key) {
    const error = new Error("File is not available to share");
    error.statusCode = 400;
    throw error;
  }

  return { id: snap.id, ...data };
}

export async function createShareLink({ fileId, userId, origin }) {
  const file = await getOwnedFile(fileId, userId);
  const token = randomBytes(24).toString("hex");

  await shareLinkRef(token).set({
    userId,
    fileId,
    s3Key: file.s3Key,
    filename: file.filename,
    contentType: file.contentType || "application/octet-stream",
    size: file.size || 0,
    redeemed: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  const baseOrigin = origin?.replace(/\/$/, "") || "";
  return {
    token,
    url: `${baseOrigin}/share/${token}`,
    filename: file.filename,
  };
}

export async function redeemShareLink(token) {
  assertValidToken(token);

  const ref = shareLinkRef(token);
  let fileMeta = null;

  await getAdminFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      const error = new Error("Share link not found");
      error.statusCode = 404;
      throw error;
    }

    const data = snap.data();
    if (data.redeemed) {
      const error = new Error("This one-time link has already been used");
      error.statusCode = 410;
      throw error;
    }

    tx.update(ref, {
      redeemed: true,
      redeemedAt: FieldValue.serverTimestamp(),
    });

    fileMeta = data;
  });

  const downloadUrl = await createDownloadUrl(fileMeta.s3Key, {
    filename: fileMeta.filename,
    disposition: "inline",
  });

  return {
    token,
    filename: fileMeta.filename,
    contentType: fileMeta.contentType,
    size: fileMeta.size,
    downloadUrl,
    viewUrl: `/api/share-link/${token}/content`,
  };
}

export async function streamShareLinkContent(token, { range } = {}) {
  if (!token || typeof token !== "string" || token.length < 16) {
    const error = new Error("Invalid share link");
    error.statusCode = 400;
    throw error;
  }

  const snap = await shareLinkRef(token).get();
  if (!snap.exists) {
    const error = new Error("Share link not found");
    error.statusCode = 404;
    throw error;
  }

  const data = snap.data();
  if (!data.redeemed) {
    const error = new Error("Share link has not been opened yet");
    error.statusCode = 403;
    throw error;
  }

  const stream = await getObjectStream(data.s3Key, { range });

  return {
    ...stream,
    filename: data.filename,
  };
}

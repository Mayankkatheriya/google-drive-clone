import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { buildObjectKey, createPresignedUploadUrl } from "@/lib/server/s3";
import { getUserStorageUsageBytes } from "@/lib/server/userStorage";
import {
  canAddToUserStorage,
  getStorageQuotaError,
  isFileWithinUploadLimit,
} from "@/lib/uploadLimits";

export async function POST(request) {
  try {
    const { filename, contentType, fileSize } = (await request.json()) ?? {};

    if (!filename || !contentType || fileSize == null) {
      return NextResponse.json(
        { error: "filename, contentType, and fileSize are required" },
        { status: 400 }
      );
    }

    if (typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    if (!isFileWithinUploadLimit(fileSize)) {
      return NextResponse.json(
        { error: "File exceeds the 5 MB upload limit." },
        { status: 413 }
      );
    }

    const decoded = await requireAuth(request.headers.get("authorization"));

    const currentUsage = await getUserStorageUsageBytes(decoded.uid);
    if (!canAddToUserStorage(currentUsage, fileSize)) {
      return NextResponse.json({ error: getStorageQuotaError() }, { status: 413 });
    }

    const s3Key = buildObjectKey(decoded.uid, filename);
    const uploadUrl = await createPresignedUploadUrl(s3Key, contentType);

    return NextResponse.json({ uploadUrl, s3Key });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

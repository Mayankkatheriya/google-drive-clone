import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { createDownloadUrl } from "@/lib/server/cloudfront";
import { assertUserOwnsKey } from "@/lib/server/s3";

export async function POST(request) {
  try {
    const { s3Key, filename, disposition = "inline" } = (await request.json()) ?? {};

    if (!s3Key) {
      return NextResponse.json({ error: "s3Key is required" }, { status: 400 });
    }

    const decoded = await requireAuth(request.headers.get("authorization"));
    assertUserOwnsKey(decoded.uid, s3Key);

    const safeDisposition = disposition === "attachment" ? "attachment" : "inline";
    const downloadUrl = await createDownloadUrl(s3Key, {
      disposition: safeDisposition,
      filename: filename || undefined,
    });

    return NextResponse.json({ downloadUrl });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import {
  assertUserOwnsKey,
  buildContentDisposition,
  getObjectBytes,
} from "@/lib/server/s3";

export async function POST(request) {
  try {
    const { s3Key, filename } = (await request.json()) ?? {};

    if (!s3Key) {
      return NextResponse.json({ error: "s3Key is required" }, { status: 400 });
    }

    const decoded = await requireAuth(request.headers.get("authorization"));
    assertUserOwnsKey(decoded.uid, s3Key);

    const { bytes, contentType, contentLength } = await getObjectBytes(s3Key);
    const displayName = filename || "download";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildContentDisposition(displayName, "attachment"),
        ...(contentLength != null && {
          "Content-Length": String(contentLength),
        }),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

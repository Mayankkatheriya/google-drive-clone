import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { assertUserOwnsKey, deleteObject } from "@/lib/server/s3";

export async function POST(request) {
  try {
    const { s3Key } = (await request.json()) ?? {};

    if (!s3Key) {
      return NextResponse.json({ error: "s3Key is required" }, { status: 400 });
    }

    const decoded = await requireAuth(request.headers.get("authorization"));
    assertUserOwnsKey(decoded.uid, s3Key);

    await deleteObject(s3Key);

    return NextResponse.json({ success: true });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

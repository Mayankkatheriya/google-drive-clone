import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { createShareLink } from "@/lib/server/shareLinks";

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const { fileId } = (await request.json()) ?? {};

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    const result = await createShareLink({
      fileId,
      userId: decoded.uid,
      origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

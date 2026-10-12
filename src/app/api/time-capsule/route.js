import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { sealFile } from "@/lib/server/timeCapsule";

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const { fileId, unlockAt, message, ownerAccess } = (await request.json()) ?? {};

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const result = await sealFile({
      fileId,
      userId: decoded.uid,
      unlockAt,
      message,
      ownerAccess,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

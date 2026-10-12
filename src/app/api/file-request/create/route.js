import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { createFileRequest } from "@/lib/server/fileRequests";

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const { folderId, title, expiresInHours, password, maxFiles } =
      (await request.json()) ?? {};

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    const result = await createFileRequest({
      userId: decoded.uid,
      ownerName: decoded.name || decoded.email?.split("@")[0],
      folderId,
      title,
      expiresInHours,
      password,
      maxFiles,
      origin,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

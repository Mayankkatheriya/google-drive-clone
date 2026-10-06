import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import {
  listShareLinksForFile,
  listShareLinksForUser,
} from "@/lib/server/shareLinks";

export async function GET(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const fileId = new URL(request.url).searchParams.get("fileId");

    const links = fileId
      ? await listShareLinksForFile({ fileId, userId: decoded.uid })
      : await listShareLinksForUser(decoded.uid);

    return NextResponse.json({ links });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

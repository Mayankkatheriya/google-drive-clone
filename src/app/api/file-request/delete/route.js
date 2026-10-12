import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { deleteFileRequest } from "@/lib/server/fileRequests";

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const { token } = (await request.json()) ?? {};
    const result = await deleteFileRequest({ token, userId: decoded.uid });
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

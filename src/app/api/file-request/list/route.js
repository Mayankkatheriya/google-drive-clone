import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { listFileRequestsForUser } from "@/lib/server/fileRequests";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const requests = await listFileRequestsForUser(decoded.uid);
    return NextResponse.json({ requests });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

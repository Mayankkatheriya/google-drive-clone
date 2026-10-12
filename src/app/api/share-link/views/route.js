import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { listShareLinkViews } from "@/lib/server/shareLinks";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    const views = await listShareLinkViews({ token, userId: decoded.uid });
    return NextResponse.json({ views });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

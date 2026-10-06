import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import { revokeShareLink } from "@/lib/server/shareLinks";

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const { token } = (await request.json()) ?? {};
    if (!token) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }
    const result = await revokeShareLink({ token, userId: decoded.uid });
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

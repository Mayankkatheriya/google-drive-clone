import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { unlockShareLink } from "@/lib/server/shareLinks";

export async function POST(request, { params }) {
  try {
    const { password } = (await request.json()) ?? {};
    const result = await unlockShareLink(params.token, password);
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

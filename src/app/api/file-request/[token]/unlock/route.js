import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { unlockFileRequest } from "@/lib/server/fileRequests";

export async function POST(request, { params }) {
  try {
    const { password } = (await request.json().catch(() => ({}))) ?? {};
    const result = await unlockFileRequest(params.token, password);
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

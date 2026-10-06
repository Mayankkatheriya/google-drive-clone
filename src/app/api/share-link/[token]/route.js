import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { redeemShareLink } from "@/lib/server/shareLinks";

export async function POST(request, { params }) {
  try {
    const body = (await request.json().catch(() => ({}))) ?? {};
    const result = await redeemShareLink(params.token, {
      unlockToken: body.unlockToken,
      password: body.password,
    });
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json(
      { error: message, code: error.code },
      { status: statusCode },
    );
  }
}

export async function GET(_request, { params }) {
  try {
    const result = await redeemShareLink(params.token);
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json(
      { error: message, code: error.code },
      { status: statusCode },
    );
  }
}

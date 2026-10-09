import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import {
  getShareLinkPublicMeta,
  getShareLinkRecord,
  redeemShareLink,
} from "@/lib/server/shareLinks";

export async function POST(request, { params }) {
  try {
    const body = (await request.json().catch(() => ({}))) ?? {};
    const result = await redeemShareLink(params.token, {
      unlockToken: body.unlockToken,
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

/** Metadata only — never redeems, so crawlers and prefetchers can't burn views. */
export async function GET(_request, { params }) {
  try {
    const record = await getShareLinkRecord(params.token);
    if (!record) {
      return NextResponse.json({ error: "Share link not found" }, { status: 404 });
    }
    return NextResponse.json(getShareLinkPublicMeta(record));
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

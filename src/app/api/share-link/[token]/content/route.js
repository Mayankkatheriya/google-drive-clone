import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { buildContentDisposition } from "@/lib/server/s3";
import { streamShareLinkContent } from "@/lib/server/shareLinks";

export async function GET(request, { params }) {
  try {
    const range = request.headers.get("range") || undefined;
    const accessToken =
      request.headers.get("x-share-access") ||
      new URL(request.url).searchParams.get("access") ||
      undefined;
    const result = await streamShareLinkContent(params.token, {
      range,
      accessToken,
    });

    const headers = new Headers({
      "Content-Type": result.contentType,
      "Content-Disposition": buildContentDisposition(
        result.filename,
        "inline",
      ),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "X-Content-Type-Options": "nosniff",
      // Content type is uploader-controlled; block scripts if opened as a page (e.g. HTML/SVG).
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; sandbox",
      "Accept-Ranges": result.acceptRanges,
    });

    if (result.contentLength != null) {
      headers.set("Content-Length", String(result.contentLength));
    }
    if (result.contentRange) {
      headers.set("Content-Range", result.contentRange);
    }

    return new NextResponse(result.body, {
      status: range ? 206 : 200,
      headers,
    });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

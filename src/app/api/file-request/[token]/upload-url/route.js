import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { createFileRequestUpload } from "@/lib/server/fileRequests";

export async function POST(request, { params }) {
  try {
    const { filename, contentType, fileSize, unlockToken } =
      (await request.json().catch(() => ({}))) ?? {};
    const result = await createFileRequestUpload(params.token, {
      filename,
      contentType,
      fileSize,
      unlockToken,
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

import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { completeFileRequestUpload } from "@/lib/server/fileRequests";

export async function POST(request, { params }) {
  try {
    const { s3Key, ticket, filename, contentType, fileSize, uploaderName, capsule } =
      (await request.json().catch(() => ({}))) ?? {};
    const result = await completeFileRequestUpload(params.token, {
      s3Key,
      ticket,
      filename,
      contentType,
      fileSize,
      uploaderName,
      capsule,
    });
    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

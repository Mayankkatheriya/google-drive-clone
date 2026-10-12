import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/server/auth";
import { purgeAllSelfDestructedFiles } from "@/lib/server/selfDestructPurge";

function isAuthorizedCron(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request) {
  try {
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movedCount = await purgeAllSelfDestructedFiles();

    return NextResponse.json({ success: true, movedCount });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

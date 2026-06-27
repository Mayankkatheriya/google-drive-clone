import { NextResponse } from "next/server";
import { requireAuth, toErrorResponse } from "@/lib/server/auth";
import {
  purgeAllExpiredTrash,
  purgeExpiredTrashForUser,
} from "@/lib/server/trashPurge";

function isAuthorizedCron(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request) {
  try {
    const decoded = await requireAuth(request.headers.get("authorization"));
    const deletedCount = await purgeExpiredTrashForUser(decoded.uid);

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function GET(request) {
  try {
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedCount = await purgeAllExpiredTrash();

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    const { statusCode, message } = toErrorResponse(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

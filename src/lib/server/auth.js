import { verifyIdToken } from "./firebaseAdmin";

function unauthorized() {
  const error = new Error("Unauthorized");
  error.statusCode = 401;
  return error;
}

export async function requireAuth(authorizationHeader) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw unauthorized();
  }

  const token = authorizationHeader.slice(7);
  try {
    return await verifyIdToken(token);
  } catch (error) {
    if (error?.code?.startsWith?.("auth/")) {
      throw unauthorized();
    }
    throw error;
  }
}

export function toErrorResponse(error) {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error(error);
    return { statusCode, message: "Internal server error" };
  }
  return {
    statusCode,
    message: error.message || "Request failed",
  };
}

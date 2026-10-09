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
  let decoded;
  try {
    decoded = await verifyIdToken(token);
  } catch (error) {
    if (error?.code?.startsWith?.("auth/")) {
      throw unauthorized();
    }
    throw error;
  }

  if (decoded.firebase?.sign_in_provider === "password" && decoded.email_verified !== true) {
    const error = new Error("Verify your email to continue");
    error.statusCode = 403;
    throw error;
  }
  return decoded;
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

import { verifyIdToken } from "./firebaseAdmin";

export async function requireAuth(authorizationHeader) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }

  const token = authorizationHeader.slice(7);
  return verifyIdToken(token);
}

export function toErrorResponse(error) {
  const statusCode = error.statusCode || 500;
  return {
    statusCode,
    message: error.message || "Internal server error",
  };
}

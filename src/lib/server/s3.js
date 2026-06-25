import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getS3Client() {
  return new S3Client({
    region: getRequiredEnv("AWS_REGION"),
    credentials: {
      accessKeyId: getRequiredEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getRequiredEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildObjectKey(userId, filename) {
  return `files/${userId}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

export function assertUserOwnsKey(userId, s3Key) {
  const prefix = `files/${userId}/`;
  if (!s3Key?.startsWith(prefix)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }
}

function encodeRFC5987(value) {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export function buildContentDisposition(filename, disposition = "attachment") {
  // HTTP headers must be Latin-1; macOS filenames often contain U+202F etc.
  const asciiFallback =
    filename
      .replace(/[^\x20-\x7E]/g, "_")
      .replace(/["\\;]/g, "_")
      .slice(0, 200) || "download";

  const encoded = encodeRFC5987(filename);

  return `${disposition}; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export async function createPresignedUploadUrl(s3Key, contentType) {
  const command = new PutObjectCommand({
    Bucket: getRequiredEnv("S3_BUCKET_NAME"),
    Key: s3Key,
    ContentType: contentType,
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 900 });
}

export async function createPresignedDownloadUrl(
  s3Key,
  { disposition = "inline", filename } = {}
) {
  const command = new GetObjectCommand({
    Bucket: getRequiredEnv("S3_BUCKET_NAME"),
    Key: s3Key,
    ...(filename && {
      ResponseContentDisposition: buildContentDisposition(filename, disposition),
    }),
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 900 });
}

export async function deleteObject(s3Key) {
  const command = new DeleteObjectCommand({
    Bucket: getRequiredEnv("S3_BUCKET_NAME"),
    Key: s3Key,
  });

  await getS3Client().send(command);
}

export async function getObjectBytes(s3Key) {
  const result = await getS3Client().send(
    new GetObjectCommand({
      Bucket: getRequiredEnv("S3_BUCKET_NAME"),
      Key: s3Key,
    })
  );

  const bytes = await result.Body.transformToByteArray();

  return {
    bytes,
    contentType: result.ContentType || "application/octet-stream",
    contentLength: result.ContentLength,
  };
}

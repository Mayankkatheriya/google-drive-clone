import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { buildContentDisposition, createPresignedDownloadUrl } from "./s3";

const URL_EXPIRY_SECONDS = 900;

function getCloudFrontConfig() {
  const domain = process.env.CLOUDFRONT_DOMAIN?.replace(/^https?:\/\//, "").replace(
    /\/$/,
    ""
  );
  const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID?.trim();
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, "\n")
    ?.trim();

  const hasValidKey =
    privateKey?.includes("BEGIN") && privateKey?.includes("END");

  if (!domain || !keyPairId || !hasValidKey) {
    return null;
  }

  return { domain, keyPairId, privateKey };
}

function createCloudFrontSignedUrl(
  s3Key,
  config,
  { disposition, filename, expiresIn = URL_EXPIRY_SECONDS } = {}
) {
  const params = new URLSearchParams();

  if (filename) {
    params.set(
      "response-content-disposition",
      buildContentDisposition(filename, disposition || "inline")
    );
  }

  const query = params.toString();
  const url = `https://${config.domain}/${s3Key}${query ? `?${query}` : ""}`;

  return getSignedUrl({
    url,
    keyPairId: config.keyPairId,
    privateKey: config.privateKey,
    dateLessThan: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
}

export async function createDownloadUrl(
  s3Key,
  { disposition = "inline", filename, expiresIn = URL_EXPIRY_SECONDS } = {}
) {
  const cloudFrontConfig = getCloudFrontConfig();

  if (cloudFrontConfig) {
    try {
      return createCloudFrontSignedUrl(s3Key, cloudFrontConfig, {
        disposition,
        filename,
        expiresIn,
      });
    } catch (error) {
      console.error("CloudFront signing failed, falling back to S3:", error.message);
    }
  }

  return createPresignedDownloadUrl(s3Key, { disposition, filename, expiresIn });
}

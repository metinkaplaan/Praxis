import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";

let client: S3Client | undefined;

function r2(): S3Client {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

/**
 * Uploads a file and returns its public URL. The bucket must have public
 * access enabled (r2.dev subdomain) — the Instagram Graph API fetches media
 * from this URL, it does not accept direct uploads.
 */
export async function uploadPublic(
  key: string,
  body: Buffer | string,
  contentType: string,
): Promise<string> {
  await r2().send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  const url = `${requireEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "")}/${key}`;
  logger.info("uploaded to R2", { key, url });
  return url;
}

export async function getObjectText(key: string): Promise<string> {
  const res = await r2().send(
    new GetObjectCommand({ Bucket: requireEnv("R2_BUCKET"), Key: key }),
  );
  return (await res.Body?.transformToString()) ?? "";
}

/** Like getObjectText, but returns null instead of throwing when the key doesn't exist. */
export async function getObjectTextOrNull(key: string): Promise<string | null> {
  try {
    return await getObjectText(key);
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw error;
  }
}

export async function listObjects(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const res = await r2().send(
      new ListObjectsV2Command({
        Bucket: requireEnv("R2_BUCKET"),
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);
  return keys;
}

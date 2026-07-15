import { requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import type { Draft, InstagramAccount } from "../lib/types.js";

const GRAPH = "https://graph.instagram.com/v21.0";

function credentials(account: InstagramAccount): { token: string; userId: string } {
  const suffix = account.toUpperCase();
  return {
    token: requireEnv(`IG_TOKEN_${suffix}`),
    userId: requireEnv(`IG_USER_ID_${suffix}`),
  };
}

async function graphPost(
  path: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${GRAPH}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`Graph API ${path} failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

/**
 * Instagram Content Publishing: two-step server-to-server flow.
 * 1) create a media container pointing at a PUBLIC image URL (R2),
 * 2) publish the container.
 * No webhook, tunnel or always-on server is involved anywhere.
 */
export async function publishImagePost(draft: Draft): Promise<{ mediaId: string }> {
  const { token, userId } = credentials(draft.account);

  const caption = [
    draft.caption.en,
    "",
    draft.caption.tr,
    "",
    draft.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  ].join("\n");

  const container = await graphPost(`${userId}/media`, {
    image_url: draft.imageUrl,
    caption,
    access_token: token,
  });
  const creationId = String(container.id);
  logger.info("media container created", { creationId });

  const published = await graphPost(`${userId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = String(published.id);
  logger.info("published to Instagram", { mediaId, account: draft.account });
  return { mediaId };
}

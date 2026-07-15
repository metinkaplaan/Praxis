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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface WaitOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

/**
 * Instagram processes containers asynchronously after fetching the media
 * from R2 — publishing immediately races that and fails with error 9007
 * ("Media is not ready for publishing"). Poll status_code until FINISHED.
 * Video (Reels) processing takes much longer than images, hence the
 * configurable interval/timeout.
 */
async function waitForContainer(
  creationId: string,
  token: string,
  opts: WaitOptions = {},
): Promise<void> {
  const intervalMs = opts.intervalMs ?? 3000;
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const start = Date.now();

  for (;;) {
    const url = new URL(`${GRAPH}/${creationId}`);
    url.searchParams.set("fields", "status_code");
    url.searchParams.set("access_token", token);
    const res = await fetch(url);
    const json = (await res.json()) as { status_code?: string };
    const status = json.status_code ?? "UNKNOWN";
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Media container ${status}: ${JSON.stringify(json)}`);
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Media container not ready after ${timeoutMs}ms (last status: ${status})`);
    }
    logger.info("waiting for media container", { creationId, status });
    await sleep(intervalMs);
  }
}

function buildCaptionText(draft: Draft): string {
  return [
    draft.caption.en,
    "",
    draft.caption.tr,
    "",
    draft.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  ].join("\n");
}

/**
 * Instagram Content Publishing: two-step server-to-server flow.
 * 1) create a media container pointing at a PUBLIC image URL (R2),
 * 2) publish the container.
 * No webhook, tunnel or always-on server is involved anywhere.
 */
export async function publishImagePost(
  draft: Extract<Draft, { format: "single" }>,
): Promise<{ mediaId: string }> {
  const { token, userId } = credentials(draft.account);
  const caption = buildCaptionText(draft);

  const container = await graphPost(`${userId}/media`, {
    image_url: draft.imageUrl,
    caption,
    access_token: token,
  });
  const creationId = String(container.id);
  logger.info("media container created", { creationId });

  await waitForContainer(creationId, token);

  const published = await graphPost(`${userId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = String(published.id);
  logger.info("published to Instagram", { mediaId, account: draft.account });
  return { mediaId };
}

/**
 * Carousel: each slide is its own item container (is_carousel_item=true),
 * then a parent container referencing all item IDs via `children`, then publish.
 */
export async function publishCarouselPost(
  draft: Extract<Draft, { format: "carousel" }>,
): Promise<{ mediaId: string }> {
  const { token, userId } = credentials(draft.account);
  const caption = buildCaptionText(draft);

  const itemIds: string[] = [];
  for (const url of draft.imageUrls) {
    const item = await graphPost(`${userId}/media`, {
      image_url: url,
      is_carousel_item: "true",
      access_token: token,
    });
    const itemId = String(item.id);
    await waitForContainer(itemId, token);
    itemIds.push(itemId);
  }
  logger.info("carousel item containers ready", { count: itemIds.length });

  const parent = await graphPost(`${userId}/media`, {
    media_type: "CAROUSEL",
    children: itemIds.join(","),
    caption,
    access_token: token,
  });
  const creationId = String(parent.id);
  await waitForContainer(creationId, token);

  const published = await graphPost(`${userId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = String(published.id);
  logger.info("published carousel to Instagram", { mediaId, account: draft.account });
  return { mediaId };
}

/**
 * Reels: same container→publish flow as images, but media_type=REELS with a
 * video_url, and a much longer wait — video processing is far slower than
 * image processing.
 */
export async function publishReelPost(
  draft: Extract<Draft, { format: "reel" }>,
): Promise<{ mediaId: string }> {
  const { token, userId } = credentials(draft.account);
  const caption = buildCaptionText(draft);

  const container = await graphPost(`${userId}/media`, {
    media_type: "REELS",
    video_url: draft.videoUrl,
    caption,
    access_token: token,
  });
  const creationId = String(container.id);
  logger.info("reel container created", { creationId });

  await waitForContainer(creationId, token, { intervalMs: 5000, timeoutMs: 10 * 60_000 });

  const published = await graphPost(`${userId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  });
  const mediaId = String(published.id);
  logger.info("published reel to Instagram", { mediaId, account: draft.account });
  return { mediaId };
}

/** Single entry point — orchestrator calls this, the format switch lives here. */
export async function publishDraft(draft: Draft): Promise<{ mediaId: string }> {
  switch (draft.format) {
    case "single":
      return publishImagePost(draft);
    case "carousel":
      return publishCarouselPost(draft);
    case "reel":
      return publishReelPost(draft);
  }
}

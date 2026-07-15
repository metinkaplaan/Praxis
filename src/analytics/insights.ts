import { requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import type { InstagramAccount, PostFormat } from "../lib/types.js";
import type { MediaMetrics } from "./performance-ledger.js";

const GRAPH = "https://graph.instagram.com/v21.0";

function tokenFor(account: InstagramAccount): string {
  return requireEnv(`IG_TOKEN_${account.toUpperCase()}`);
}

/**
 * Fetches metrics for a published media item. Uses two calls deliberately:
 * `/insights` for reach/saved/shares(/plays), and the media node's own
 * `like_count`/`comments_count` fields — those are stable node fields, not
 * insights, and don't disappear if Meta reshuffles the insights metric list
 * (which it does between API versions; unsupported metrics 400 the whole
 * request, so we degrade gracefully rather than let one bad metric name
 * break insights collection for every post).
 */
export async function fetchMediaInsights(
  mediaId: string,
  account: InstagramAccount,
  format: PostFormat,
): Promise<MediaMetrics> {
  const token = tokenFor(account);

  const metrics = ["reach", "saved", "shares"];
  if (format === "reel") metrics.push("plays");

  const insightsUrl = new URL(`${GRAPH}/${mediaId}/insights`);
  insightsUrl.searchParams.set("metric", metrics.join(","));
  insightsUrl.searchParams.set("access_token", token);

  const insightsRes = await fetch(insightsUrl);
  const insightsJson = (await insightsRes.json()) as {
    data?: { name: string; values?: { value: number }[] }[];
    error?: unknown;
  };
  if (!insightsRes.ok) {
    logger.warn("insights fetch failed, treating unavailable metrics as 0", {
      mediaId,
      status: insightsRes.status,
      error: insightsJson.error,
    });
  }

  const valueOf = (name: string): number => {
    const entry = insightsJson.data?.find((d) => d.name === name);
    return entry?.values?.[0]?.value ?? 0;
  };

  const nodeUrl = new URL(`${GRAPH}/${mediaId}`);
  nodeUrl.searchParams.set("fields", "like_count,comments_count");
  nodeUrl.searchParams.set("access_token", token);
  const nodeRes = await fetch(nodeUrl);
  const nodeJson = (await nodeRes.json()) as { like_count?: number; comments_count?: number };
  if (!nodeRes.ok) {
    throw new Error(`Failed to fetch media node fields: ${nodeRes.status} ${JSON.stringify(nodeJson)}`);
  }

  const metricsResult: MediaMetrics = {
    reach: valueOf("reach"),
    saved: valueOf("saved"),
    shares: valueOf("shares"),
    likeCount: nodeJson.like_count ?? 0,
    commentCount: nodeJson.comments_count ?? 0,
  };
  if (format === "reel") metricsResult.plays = valueOf("plays");

  logger.info("fetched media insights", { mediaId, ...metricsResult });
  return metricsResult;
}

import { requireEnv } from "../lib/env.js";
import { putRepoSecret } from "../lib/github-secrets.js";
import { logger } from "../lib/logger.js";
import { notifyFailure, sendMessage } from "../notify/telegram.js";

/**
 * Refreshes 60-day long-lived Instagram tokens and rotates them back into
 * GitHub Actions Secrets. Run daily by token-refresh.yml — refreshing well
 * before expiry means a couple of failed days never break publishing.
 */
const ACCOUNTS = ["MIDNIGHTCOUPLEGAME"] as const; // Phase 2: add "GIRLSOFMIDNIGHT"

async function refreshToken(current: string): Promise<string> {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", current);

  const res = await fetch(url);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!res.ok || !json.access_token) {
    throw new Error(`Token refresh failed: ${res.status} ${JSON.stringify(json)}`);
  }
  logger.info("token refreshed", { expiresInDays: Math.floor((json.expires_in ?? 0) / 86400) });
  return json.access_token;
}

async function main(): Promise<void> {
  for (const account of ACCOUNTS) {
    const secretName = `IG_TOKEN_${account}`;
    try {
      const fresh = await refreshToken(requireEnv(secretName));
      await putRepoSecret(secretName, fresh);
      logger.info("secret rotated", { secretName });
    } catch (error) {
      await notifyFailure(`token refresh (${account})`, error);
      throw error;
    }
  }
  await sendMessage("🔄 Instagram token yenileme başarılı / token refresh OK");
}

main().catch((error) => {
  logger.error("token refresh run failed", { error: String(error) });
  process.exitCode = 1;
});

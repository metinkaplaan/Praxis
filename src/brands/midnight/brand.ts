import type { BilingualCopy, InstagramAccount } from "../../lib/types.js";

/** Real Instagram handles, keyed by the env-safe account keys. */
export const IG_HANDLES: Record<InstagramAccount, string> = {
  midnightcouplegame: "midnight.couplegame",
  girlsofmidnight: "girlsofmidnight",
};

export const MIDNIGHT_BRAND = {
  name: "Midnight",
  packageName: "com.midstudio.midnight",
  slogan: {
    en: "Your night, your rules.",
    tr: "Bu gece, senin kuralların.",
  } satisfies BilingualCopy,
  /** Single-line (line-art) identity: crescent moon + M + kissing couple. */
  visualIdentity:
    "minimal single-line line-art, crescent moon merged with the letter M and a kissing couple silhouette, " +
    "deep midnight black background, elegant, sensual but tasteful",
  landingUrl: "https://midnight-landing.vercel.app",
  markets: ["EN", "TR", "RU", "ES"] as const,
} as const;

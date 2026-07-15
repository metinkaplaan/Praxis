import type { BilingualCopy } from "../../lib/types.js";

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
    "deep midnight black background, elegant, sensual but tasteful, no text in image",
  landingUrl: "https://midnight-landing.vercel.app",
  markets: ["EN", "TR", "RU", "ES"] as const,
} as const;

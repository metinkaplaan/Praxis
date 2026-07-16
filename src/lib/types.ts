/**
 * Every piece of user-facing English copy in Praxis must carry its Turkish
 * translation. `tr` is intentionally NOT optional — the brand's standing rule
 * is enforced by the type system, not by convention.
 */
export interface BilingualCopy {
  en: string;
  tr: string;
}

export type MarketCode = "EN" | "TR" | "RU" | "ES";

/**
 * Env-safe account keys (no dots — they become secret-name suffixes, e.g.
 * IG_TOKEN_MIDNIGHTCOUPLEGAME). Real IG handles live in IG_HANDLES in
 * brands/midnight/brand.ts.
 */
export type InstagramAccount = "midnightcouplegame" | "girlsofmidnight";

export type PostFormat = "single" | "carousel" | "reel";

/**
 * Psychological hook categories — single source of truth shared by the zod
 * schemas, the Gemini responseSchema enums, and the H2 section ids in
 * knowledge/instagram/hooks.md (the loader warns when they drift apart).
 */
export const HOOK_CATEGORIES = [
  "curiosity",
  "fear",
  "humor",
  "surprise",
  "authority",
  "story",
  "numbers",
  "conflict",
  "forbidden",
  "reverse",
] as const;
export type HookCategory = (typeof HOOK_CATEGORIES)[number];

/** CTA types — mirrors knowledge/instagram/cta-bank.md. */
export const CTA_TYPES = [
  "save",
  "share",
  "comment",
  "send_to_partner",
  "profile_visit",
  "dm",
  "follow",
] as const;
export type CtaType = (typeof CTA_TYPES)[number];

export interface CarouselSlide {
  order: number;
  role: "hook" | "build" | "payoff" | "cta";
  imagePrompt: string;
}

export type GeneratedPost =
  | { format: "single"; caption: BilingualCopy; hashtags: string[]; imagePrompt: string }
  | { format: "carousel"; caption: BilingualCopy; hashtags: string[]; slides: CarouselSlide[] }
  | { format: "reel"; caption: BilingualCopy; hashtags: string[]; videoPrompt: string };

interface DraftBase {
  id: string;
  createdAt: string;
  account: InstagramAccount;
  market: MarketCode;
  category: string;
  intensity: string;
  caption: BilingualCopy;
  hashtags: string[];
  status: "pending_approval" | "published" | "rejected";
  /** Filled in by publish-draft.ts once the Graph API confirms publication. */
  mediaId?: string;
  publishedAt?: string;
  /** Filled in by collect-insights once metrics have been recorded. */
  insightsCollectedAt?: string;
}

export type Draft =
  | (DraftBase & { format: "single"; imageUrl: string })
  | (DraftBase & { format: "carousel"; imageUrls: string[] })
  | (DraftBase & { format: "reel"; videoUrl: string });

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

export interface GeneratedPost {
  caption: BilingualCopy;
  hashtags: string[];
  imagePrompt: string;
}

export interface Draft {
  id: string;
  createdAt: string;
  account: InstagramAccount;
  market: MarketCode;
  category: string;
  intensity: string;
  caption: BilingualCopy;
  hashtags: string[];
  /** Public R2 URL — the Graph API fetches media from here. */
  imageUrl: string;
  status: "pending_approval" | "published" | "rejected";
}

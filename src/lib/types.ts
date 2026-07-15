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

export type InstagramAccount = "joinmidnight" | "girlsofmidnight";

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

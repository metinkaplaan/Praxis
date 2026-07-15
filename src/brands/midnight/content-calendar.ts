import type { InstagramAccount, MarketCode } from "../../lib/types.js";
import { CATEGORIES, INTENSITIES, type Category } from "./categories.js";

export interface ContentSlot {
  account: InstagramAccount;
  market: MarketCode;
  category: Category;
  intensity: (typeof INTENSITIES)[number];
}

/**
 * Deterministic rotation: every 2-hour cycle picks the next combination.
 * Using the cycle index (hours since epoch / 2) keeps the schedule stable
 * across stateless GitHub Actions runs — no database needed.
 *
 * MVP: single account (@joinmidnight), EN+TR markets only.
 * Phase 2 adds @girlsofmidnight; Phase 4 adds RU/ES.
 */
const ACTIVE_ACCOUNTS: InstagramAccount[] = ["joinmidnight"];
const ACTIVE_MARKETS: MarketCode[] = ["EN", "TR"];

export function pickSlot(now: Date = new Date()): ContentSlot {
  const cycleIndex = Math.floor(now.getTime() / (2 * 60 * 60 * 1000));

  const category = CATEGORIES[cycleIndex % CATEGORIES.length]!;
  const intensity = INTENSITIES[cycleIndex % INTENSITIES.length]!;
  const market = ACTIVE_MARKETS[cycleIndex % ACTIVE_MARKETS.length]!;
  const account = ACTIVE_ACCOUNTS[cycleIndex % ACTIVE_ACCOUNTS.length]!;

  return { account, market, category, intensity };
}

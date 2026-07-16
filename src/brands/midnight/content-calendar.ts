import { pickFormat } from "../../analytics/format-selector.js";
import type { InstagramAccount, MarketCode, PostFormat } from "../../lib/types.js";
import { CATEGORIES, INTENSITIES, type Category } from "./categories.js";

export interface ContentSlot {
  account: InstagramAccount;
  market: MarketCode;
  category: Category;
  intensity: (typeof INTENSITIES)[number];
  format: PostFormat;
}

/**
 * Deterministic rotation for category/intensity/market/account, keyed off
 * wall-clock time (hours since epoch / 2) rather than an invocation counter —
 * this keeps the rotation stable across stateless GitHub Actions runs no
 * matter how often (or irregularly) the workflow actually fires. The content
 * cycle itself now runs on a fixed daily plan (5 posts/day: 3 reels + 2
 * carousels, see content-cycle.yml), not a rotating N-hour cycle.
 *
 * `format` is the one dimension that's NOT deterministic — it's picked by
 * format-selector.ts (epsilon-greedy against the R2 performance ledger), which
 * needs real randomness to actually explore. That's safe now because the
 * ledger in R2 is the shared state that keeps format learning consistent
 * across stateless runs; category/intensity/market/account rotation doesn't
 * need that.
 *
 * MVP: single account (@midnight.couplegame), EN+TR markets only.
 * Phase 2 adds @girlsofmidnight; Phase 4 adds RU/ES.
 */
const ACTIVE_ACCOUNTS: InstagramAccount[] = ["midnightcouplegame"];
const ACTIVE_MARKETS: MarketCode[] = ["EN", "TR"];

export async function pickSlot(now: Date = new Date()): Promise<ContentSlot> {
  const cycleIndex = Math.floor(now.getTime() / (2 * 60 * 60 * 1000));

  const category = CATEGORIES[cycleIndex % CATEGORIES.length]!;
  const intensity = INTENSITIES[cycleIndex % INTENSITIES.length]!;
  const market = ACTIVE_MARKETS[cycleIndex % ACTIVE_MARKETS.length]!;
  const account = ACTIVE_ACCOUNTS[cycleIndex % ACTIVE_ACCOUNTS.length]!;

  const format = await pickFormat({ category: category.id, intensity: intensity.id, market, account });

  return { account, market, category, intensity, format };
}

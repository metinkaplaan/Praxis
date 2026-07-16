import { optionalEnv } from "../lib/env.js";
import type { InstagramAccount, MarketCode, PostFormat } from "../lib/types.js";
import { keyFor, loadLedger, type PerformanceLedger, type PerformanceLedgerEntry } from "./performance-ledger.js";

export interface FormatSelectionContext {
  category: string;
  intensity: string;
  market: MarketCode;
  account: InstagramAccount;
}

/**
 * "single" is intentionally excluded from rotation — the operator decided
 * plain single-photo posts are retired; every post is now a carousel or a
 * reel. `PostFormat` (in lib/types.ts) still includes "single" because past
 * published drafts have that format and publishing/insights code needs to
 * keep handling them — it's just never selected for new posts.
 */
const FORMATS: PostFormat[] = ["carousel", "reel"];

/** Bootstrap weights used until the performance ledger has enough samples to trust. */
const DEFAULT_WEIGHTS: Record<PostFormat, number> = { single: 0, carousel: 0.6, reel: 0.4 };

function weightedPick(weights: Record<PostFormat, number>): PostFormat {
  const total = FORMATS.reduce((sum, f) => sum + weights[f], 0);
  let roll = Math.random() * total;
  for (const format of FORMATS) {
    roll -= weights[format];
    if (roll <= 0) return format;
  }
  return FORMATS[FORMATS.length - 1]!;
}

/**
 * Falls back from the exact (category, intensity, market, account, format)
 * combination to the coarser (market, account, format) aggregate when the
 * exact combo has no data yet — with 6 categories × 3 intensities, waiting
 * for exact-combo samples would take far too long to ever learn anything.
 */
function findBestMatchingEntry(
  ledger: PerformanceLedger,
  ctx: FormatSelectionContext & { format: PostFormat },
): PerformanceLedgerEntry | undefined {
  const exact = ledger.entries[keyFor(ctx)];
  if (exact) return exact;

  const sameFormat = Object.values(ledger.entries).filter(
    (e) => e.market === ctx.market && e.account === ctx.account && e.format === ctx.format,
  );
  if (sameFormat.length === 0) return undefined;

  const postCount = sameFormat.reduce((sum, e) => sum + e.postCount, 0);
  const weightedAvg = (pick: (e: PerformanceLedgerEntry) => number) =>
    sameFormat.reduce((sum, e) => sum + pick(e) * e.postCount, 0) / postCount;

  return {
    key: `aggregate|${ctx.market}|${ctx.account}|${ctx.format}`,
    category: "*",
    intensity: "*",
    market: ctx.market,
    account: ctx.account,
    format: ctx.format,
    postCount,
    lastUpdated: sameFormat.map((e) => e.lastUpdated).sort().at(-1) ?? new Date(0).toISOString(),
    avgReach: weightedAvg((e) => e.avgReach),
    avgSaveRate: weightedAvg((e) => e.avgSaveRate),
    avgShareRate: weightedAvg((e) => e.avgShareRate),
    avgLikeRate: weightedAvg((e) => e.avgLikeRate),
    avgCommentRate: weightedAvg((e) => e.avgCommentRate),
    score: weightedAvg((e) => e.score),
  };
}

/**
 * Pure (no IO) — epsilon-greedy format selection, unit-testable with a fake
 * ledger. Mostly picks the best-scoring format for this context, but explores
 * under-sampled formats at rate `epsilon` so the system keeps trying variety
 * instead of ossifying around whatever performed well first.
 */
export function chooseFormat(ledger: PerformanceLedger, ctx: FormatSelectionContext): PostFormat {
  const epsilon = Number(optionalEnv("FORMAT_EXPLORATION_RATE", "0.2"));
  const minSamples = Number(optionalEnv("FORMAT_MIN_SAMPLES", "3"));

  const perFormat = FORMATS.map((format) => ({
    format,
    entry: findBestMatchingEntry(ledger, { ...ctx, format }),
  }));

  const hasAnyData = perFormat.some((f) => f.entry);

  // Cold start (no ledger data for ANY format yet): use the cost-aware
  // bootstrap weights, not a uniform coin flip. Reels cost ~20x a carousel
  // (see docs/COSTS.md) — picking formats blind to that burned through the
  // Gemini credits fast. This branch is deterministic (no randomness) so
  // spend stays predictable until real performance data exists to learn from.
  if (!hasAnyData) {
    return weightedPick(DEFAULT_WEIGHTS);
  }

  const underSampled = perFormat.filter((f) => (f.entry?.postCount ?? 0) < minSamples);
  if (Math.random() < epsilon) {
    const pool = underSampled.length > 0 ? underSampled : perFormat;
    return pool[Math.floor(Math.random() * pool.length)]!.format;
  }

  const qualified = perFormat.filter((f) => (f.entry?.postCount ?? 0) >= minSamples);
  if (qualified.length === 0) return weightedPick(DEFAULT_WEIGHTS);

  return qualified.reduce((best, cur) => (cur.entry!.score > best.entry!.score ? cur : best)).format;
}

export async function pickFormat(ctx: FormatSelectionContext): Promise<PostFormat> {
  const ledger = await loadLedger();
  return chooseFormat(ledger, ctx);
}

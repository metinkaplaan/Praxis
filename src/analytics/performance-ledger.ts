import { getObjectTextOrNull, uploadPublic } from "../storage/r2.js";
import type { InstagramAccount, MarketCode, PostFormat } from "../lib/types.js";

export interface PerformanceLedgerEntry {
  key: string; // `${category}|${intensity}|${market}|${account}|${format}`
  category: string;
  intensity: string;
  market: MarketCode;
  account: InstagramAccount;
  format: PostFormat;
  postCount: number;
  lastUpdated: string;
  avgReach: number;
  avgSaveRate: number; // saved / reach
  avgShareRate: number; // shares / reach
  avgLikeRate: number;
  avgCommentRate: number;
  avgPlayRate?: number; // reels only — informational, not part of the score
  /** 0.4*saveRate + 0.3*shareRate + 0.2*likeRate + 0.1*commentRate — saves/shares weighted highest. */
  score: number;
}

export interface PerformanceLedger {
  updatedAt: string;
  entries: Record<string, PerformanceLedgerEntry>;
}

const LEDGER_KEY = "analytics/performance-ledger.json";

function emptyLedger(): PerformanceLedger {
  return { updatedAt: new Date(0).toISOString(), entries: {} };
}

export async function loadLedger(): Promise<PerformanceLedger> {
  const text = await getObjectTextOrNull(LEDGER_KEY);
  if (!text) return emptyLedger();
  return JSON.parse(text) as PerformanceLedger;
}

export async function saveLedger(ledger: PerformanceLedger): Promise<void> {
  await uploadPublic(LEDGER_KEY, JSON.stringify(ledger, null, 2), "application/json");
}

export function keyFor(slot: {
  category: string;
  intensity: string;
  market: MarketCode;
  account: InstagramAccount;
  format: PostFormat;
}): string {
  return `${slot.category}|${slot.intensity}|${slot.market}|${slot.account}|${slot.format}`;
}

function scoreOf(rates: { save: number; share: number; like: number; comment: number }): number {
  return 0.4 * rates.save + 0.3 * rates.share + 0.2 * rates.like + 0.1 * rates.comment;
}

export interface MediaMetrics {
  reach: number;
  saved: number;
  shares: number;
  likeCount: number;
  commentCount: number;
  plays?: number;
}

/**
 * Reach-normalizes a single post's raw metrics into the same 0.4/0.3/0.2/0.1
 * (save/share/like/comment) weighted score used by the ledger, so a single
 * observation (observations.ts) and a ledger entry are directly comparable.
 */
export function scorePost(metrics: MediaMetrics): number {
  const reach = Math.max(metrics.reach, 1);
  return scoreOf({
    save: metrics.saved / reach,
    share: metrics.shares / reach,
    like: metrics.likeCount / reach,
    comment: metrics.commentCount / reach,
  });
}

/** Pure — incremental running average, no IO. Used by collect-insights.ts. */
export function recordOutcome(
  ledger: PerformanceLedger,
  slot: { category: string; intensity: string; market: MarketCode; account: InstagramAccount; format: PostFormat },
  metrics: MediaMetrics,
): PerformanceLedger {
  const key = keyFor(slot);
  const existing = ledger.entries[key];
  const n = existing?.postCount ?? 0;
  const reach = Math.max(metrics.reach, 1); // avoid div-by-zero on brand-new/low-reach posts

  const saveRate = metrics.saved / reach;
  const shareRate = metrics.shares / reach;
  const likeRate = metrics.likeCount / reach;
  const commentRate = metrics.commentCount / reach;
  const playRate = metrics.plays !== undefined ? metrics.plays / reach : undefined;

  const avg = (prev: number, next: number) => (prev * n + next) / (n + 1);

  const entry: PerformanceLedgerEntry = {
    key,
    category: slot.category,
    intensity: slot.intensity,
    market: slot.market,
    account: slot.account,
    format: slot.format,
    postCount: n + 1,
    lastUpdated: new Date().toISOString(),
    avgReach: avg(existing?.avgReach ?? 0, metrics.reach),
    avgSaveRate: avg(existing?.avgSaveRate ?? 0, saveRate),
    avgShareRate: avg(existing?.avgShareRate ?? 0, shareRate),
    avgLikeRate: avg(existing?.avgLikeRate ?? 0, likeRate),
    avgCommentRate: avg(existing?.avgCommentRate ?? 0, commentRate),
    ...(playRate !== undefined ? { avgPlayRate: avg(existing?.avgPlayRate ?? 0, playRate) } : {}),
    score: 0, // computed below
  };
  entry.score = scoreOf({
    save: entry.avgSaveRate,
    share: entry.avgShareRate,
    like: entry.avgLikeRate,
    comment: entry.avgCommentRate,
  });

  return {
    updatedAt: new Date().toISOString(),
    entries: { ...ledger.entries, [key]: entry },
  };
}

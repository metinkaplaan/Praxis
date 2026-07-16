import { getObjectTextOrNull, uploadPublic } from "../storage/r2.js";
import type { CtaType, Draft, HookCategory, InstagramAccount, MarketCode, PostFormat } from "../lib/types.js";
import { type MediaMetrics, scorePost } from "./performance-ledger.js";

/**
 * A single published post's full context + outcome. Deliberately NOT keyed
 * like the performance ledger (category|intensity|market|account|format) —
 * adding hook/CTA/hour/duration as extra key dimensions would blow up the
 * key space to thousands of near-empty cells at our posting volume. Instead
 * we keep every observation as a flat, raw record and aggregate on read
 * (learnings.ts). This also means adding a new dimension later never
 * requires a migration — old observations just have that field undefined.
 */
export interface Observation {
  draftId: string;
  collectedAt: string;
  category: string;
  intensity: string;
  market: MarketCode;
  account: InstagramAccount;
  format: PostFormat;
  hookCategory?: HookCategory;
  ctaType?: CtaType;
  postHourUtc?: number;
  videoDurationSec?: number;
  slideCount?: number;
  metrics: MediaMetrics;
  score: number;
}

export interface ObservationLog {
  version: 1;
  updatedAt: string;
  observations: Observation[];
}

const OBSERVATIONS_KEY = "analytics/observations.json";

function emptyLog(): ObservationLog {
  return { version: 1, updatedAt: new Date(0).toISOString(), observations: [] };
}

export async function loadObservations(): Promise<ObservationLog> {
  const text = await getObjectTextOrNull(OBSERVATIONS_KEY);
  if (!text) return emptyLog();
  return JSON.parse(text) as ObservationLog;
}

export async function saveObservations(log: ObservationLog): Promise<void> {
  await uploadPublic(OBSERVATIONS_KEY, JSON.stringify(log, null, 2), "application/json");
}

/**
 * Pure — builds an Observation from a published draft + its collected
 * metrics. Optional fields are added conditionally (not as `key: undefined`)
 * to satisfy exactOptionalPropertyTypes.
 */
export function observationFromDraft(draft: Draft, metrics: MediaMetrics): Observation {
  return {
    draftId: draft.id,
    collectedAt: new Date().toISOString(),
    category: draft.category,
    intensity: draft.intensity,
    market: draft.market,
    account: draft.account,
    format: draft.format,
    ...(draft.hookCategory !== undefined ? { hookCategory: draft.hookCategory } : {}),
    ...(draft.ctaType !== undefined ? { ctaType: draft.ctaType } : {}),
    ...(draft.postHourUtc !== undefined ? { postHourUtc: draft.postHourUtc } : {}),
    ...(draft.format === "reel" && draft.videoDurationSec !== undefined
      ? { videoDurationSec: draft.videoDurationSec }
      : {}),
    ...(draft.format === "carousel" ? { slideCount: draft.imageUrls.length } : {}),
    metrics,
    score: scorePost(metrics),
  };
}

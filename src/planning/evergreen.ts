import { keyFor, type PerformanceLedger } from "../analytics/performance-ledger.js";
import type { ObservationLog } from "../analytics/observations.js";
import type { CtaType, HookCategory } from "../lib/types.js";
import type { ContentPlan } from "./content-plan.js";

export interface EvergreenCandidate {
  category: string;
  intensity: string;
  hookCategory: HookCategory;
  goal: CtaType;
  sourceDraftId: string;
}

const EVERGREEN_MIN_SAMPLES = 3;
const EVERGREEN_SCORE_MULTIPLIER = 1.2; // consistent with learnings.ts's own +20% PREFER threshold
const EVERGREEN_COOLDOWN_DAYS = 90;

function daysSince(dateIso: string, now: Date): number {
  return (now.getTime() - new Date(dateIso).getTime()) / (24 * 60 * 60 * 1000);
}

/**
 * Pure — finds at most one "replay the winning recipe" evergreen candidate
 * per call. Gated globally on a ~90-day cooldown since the last evergreen
 * plan entry, and — when picking among several qualifying observations —
 * avoids repeating the immediately previous evergreen's category for
 * variety. Returns undefined when no qualifying observation exists yet (the
 * realistic state until enough posts mature) or the cooldown hasn't elapsed.
 */
export function findEvergreenCandidate(
  observations: ObservationLog,
  ledger: PerformanceLedger,
  existingPlan: ContentPlan,
  now: Date = new Date(),
): EvergreenCandidate | undefined {
  const pastEvergreens = existingPlan.entries
    .filter((e) => e.isEvergreen)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastEvergreen = pastEvergreens[0];

  if (lastEvergreen && daysSince(lastEvergreen.date, now) < EVERGREEN_COOLDOWN_DAYS) {
    return undefined;
  }

  const all = observations.observations;
  if (all.length === 0) return undefined;
  const meanScore = all.reduce((sum, o) => sum + o.score, 0) / all.length;

  const qualified = all.filter((o) => {
    if (o.score <= meanScore * EVERGREEN_SCORE_MULTIPLIER) return false;
    if (o.hookCategory === undefined || o.ctaType === undefined) return false;
    const ledgerEntry = ledger.entries[keyFor(o)];
    return (ledgerEntry?.postCount ?? 0) >= EVERGREEN_MIN_SAMPLES;
  });
  if (qualified.length === 0) return undefined;

  const avoidCategory = lastEvergreen?.category;
  const pool = qualified.filter((o) => o.category !== avoidCategory);
  const candidates = pool.length > 0 ? pool : qualified;

  const winner = candidates.reduce((best, cur) => (cur.score > best.score ? cur : best));
  return {
    category: winner.category,
    intensity: winner.intensity,
    hookCategory: winner.hookCategory!,
    goal: winner.ctaType!,
    sourceDraftId: winner.draftId,
  };
}

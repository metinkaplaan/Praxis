import { CATEGORIES, INTENSITIES } from "../brands/midnight/categories.js";
import { optionalEnv } from "../lib/env.js";
import { CTA_TYPES, HOOK_CATEGORIES, type CtaType, type HookCategory } from "../lib/types.js";
import type { Learnings } from "../analytics/learnings.js";

export interface TopicPick {
  category: string;
  /** No learnings dimension tracks intensity today — plain deterministic rotation, same as content-calendar.ts's live pickSlot(). */
  intensity: string;
  hookCategory: HookCategory;
  goal: CtaType;
}

/**
 * Bootstrap weights for `goal` until the learnings loop has enough matured
 * `ctaType` data — biased toward the growth-critical CTAs already prioritized
 * in captions.ts's copywriting rules. `dm` is 0: no DM automation exists yet.
 */
const DEFAULT_GOAL_WEIGHTS: Record<CtaType, number> = {
  save: 0.25,
  share: 0.2,
  follow: 0.2,
  send_to_partner: 0.15,
  comment: 0.1,
  profile_visit: 0.1,
  dm: 0,
};

function weightedPick<T extends string>(weights: Record<T, number>): T {
  const keys = Object.keys(weights) as T[];
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  let roll = Math.random() * total;
  for (const key of keys) {
    roll -= weights[key];
    if (roll <= 0) return key;
  }
  return keys[keys.length - 1]!;
}

/** Zeroes out AVOID'd keys; falls back to the original weights if that would zero everything out. */
function withoutAvoided<T extends string>(weights: Record<T, number>, avoided: string[]): Record<T, number> {
  if (avoided.length === 0) return weights;
  const avoidedSet = new Set(avoided);
  const filtered = { ...weights };
  for (const key of Object.keys(filtered) as T[]) {
    if (avoidedSet.has(key)) filtered[key] = 0;
  }
  const total = Object.values(filtered).reduce((sum: number, v) => sum + (v as number), 0);
  return total > 0 ? filtered : weights;
}

/**
 * Pure — cold start (no PREFER'd learnings for this dimension yet) is a
 * deterministic variety rotation over `domain`, skipping AVOID'd values when
 * possible; consecutive `cycleIndex` values always land on a different
 * domain entry, so adjacent plan slots never repeat without extra bookkeeping.
 * Once matured data exists, epsilon-greedy: keep rotating `epsilon` of the
 * time (mirrors format-selector.ts's chooseFormat exactly), otherwise exploit
 * the best-scoring PREFER'd value.
 */
function pickDimensionValue(
  dimension: "category" | "hookCategory",
  domain: string[],
  cycleIndex: number,
  learnings: Learnings | undefined,
  epsilon: number,
): string {
  const top = learnings?.top.filter((i) => i.dimension === dimension) ?? [];
  const bottom = learnings?.bottom.filter((i) => i.dimension === dimension) ?? [];
  const avoided = new Set(bottom.map((i) => i.value));
  const rotationPool = domain.filter((v) => !avoided.has(v));
  const pool = rotationPool.length > 0 ? rotationPool : domain;

  if (top.length === 0 || Math.random() < epsilon) {
    return pool[cycleIndex % pool.length]!;
  }

  return top.reduce((best, cur) => (cur.deltaPct > best.deltaPct ? cur : best)).value;
}

function pickGoal(learnings: Learnings | undefined, epsilon: number): CtaType {
  const top = learnings?.top.filter((i) => i.dimension === "ctaType") ?? [];
  const bottom = learnings?.bottom.filter((i) => i.dimension === "ctaType") ?? [];

  if (top.length === 0 || Math.random() < epsilon) {
    const avoided = bottom.map((i) => i.value);
    return weightedPick(withoutAvoided(DEFAULT_GOAL_WEIGHTS, avoided));
  }

  return top.reduce((best, cur) => (cur.deltaPct > best.deltaPct ? cur : best)).value as CtaType;
}

/**
 * `cycleIndex` is the slot's position in the PLAN sequence, not wall-clock
 * time — the planner looks days ahead of "now", unlike content-calendar.ts's
 * pickSlot() which resolves the live slot for right now.
 */
export function pickTopicHookGoal(cycleIndex: number, learnings: Learnings | undefined): TopicPick {
  const epsilon = Number(optionalEnv("PLANNER_EXPLORATION_RATE", "0.2"));

  const category = pickDimensionValue(
    "category",
    CATEGORIES.map((c) => c.id),
    cycleIndex,
    learnings,
    epsilon,
  );
  const hookCategory = pickDimensionValue(
    "hookCategory",
    [...HOOK_CATEGORIES],
    cycleIndex,
    learnings,
    epsilon,
  ) as HookCategory;
  const goal = pickGoal(learnings, epsilon);
  const intensity = INTENSITIES[cycleIndex % INTENSITIES.length]!.id;

  return { category, intensity, hookCategory, goal };
}

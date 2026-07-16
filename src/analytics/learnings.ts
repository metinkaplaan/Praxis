import { getObjectTextOrNull, uploadPublic } from "../storage/r2.js";
import type { Observation, ObservationLog } from "./observations.js";

type Dimension = "hookCategory" | "ctaType" | "postHourUtc" | "format" | "category";

export interface LearningItem {
  dimension: Dimension;
  value: string;
  postCount: number;
  avgScore: number;
  /** % deviation from the overall mean score across all observations. */
  deltaPct: number;
}

export interface Learnings {
  updatedAt: string;
  totalObservations: number;
  meanScore: number;
  top: LearningItem[];
  bottom: LearningItem[];
  /** Pre-rendered English lines, ready to drop into a generation prompt. */
  promptLines: string[];
}

const LEARNINGS_KEY = "analytics/learnings.json";
const DELTA_THRESHOLD_PCT = 20;
const MAX_PREFER_LINES = 5;
const MAX_AVOID_LINES = 3;

function dimensionValue(obs: Observation, dimension: Dimension): string | undefined {
  switch (dimension) {
    case "hookCategory":
      return obs.hookCategory;
    case "ctaType":
      return obs.ctaType;
    case "postHourUtc":
      return obs.postHourUtc !== undefined ? String(obs.postHourUtc) : undefined;
    case "format":
      return obs.format;
    case "category":
      return obs.category;
  }
}

function phraseFor(dimension: Dimension, value: string): string {
  switch (dimension) {
    case "hookCategory":
      return `'${value}' hooks`;
    case "ctaType":
      return `'${value}' CTAs`;
    case "postHourUtc":
      return `posts published around ${value.padStart(2, "0")}:00 UTC`;
    case "format":
      return `the '${value}' format`;
    case "category":
      return `the '${value}' category`;
  }
}

/**
 * Pure, rule-based aggregation — deliberately NOT an LLM summarizing the
 * ledger. A rule gives a deterministic, auditable "why"; a small sample
 * handed to an LLM risks confidently inventing patterns that aren't there.
 * That kind of interpretive analysis belongs to a future analysis-agent
 * wave, fed BY this data, not replacing it.
 */
export function buildLearnings(log: ObservationLog, minSamples = 3): Learnings {
  const observations = log.observations;
  const totalObservations = observations.length;
  const meanScore =
    totalObservations === 0 ? 0 : observations.reduce((sum, o) => sum + o.score, 0) / totalObservations;

  const dimensions: Dimension[] = ["hookCategory", "ctaType", "postHourUtc", "format", "category"];
  const items: LearningItem[] = [];

  for (const dimension of dimensions) {
    const groups = new Map<string, { sum: number; count: number }>();
    for (const obs of observations) {
      const value = dimensionValue(obs, dimension);
      if (value === undefined) continue;
      const group = groups.get(value) ?? { sum: 0, count: 0 };
      group.sum += obs.score;
      group.count += 1;
      groups.set(value, group);
    }
    for (const [value, { sum, count }] of groups) {
      const avgScore = sum / count;
      const deltaPct = meanScore === 0 ? (avgScore > 0 ? 100 : 0) : ((avgScore - meanScore) / meanScore) * 100;
      items.push({ dimension, value, postCount: count, avgScore, deltaPct });
    }
  }

  const qualified = items.filter((i) => i.postCount >= minSamples);
  const top = qualified
    .filter((i) => i.deltaPct > DELTA_THRESHOLD_PCT)
    .sort((a, b) => b.deltaPct - a.deltaPct)
    .slice(0, MAX_PREFER_LINES);
  const bottom = qualified
    .filter((i) => i.deltaPct < -DELTA_THRESHOLD_PCT)
    .sort((a, b) => a.deltaPct - b.deltaPct)
    .slice(0, MAX_AVOID_LINES);

  const promptLines = [
    ...top.map(
      (i) => `PREFER: ${phraseFor(i.dimension, i.value)} (n=${i.postCount}, score ${i.deltaPct >= 0 ? "+" : ""}${i.deltaPct.toFixed(0)}% vs mean).`,
    ),
    ...bottom.map(
      (i) =>
        `AVOID: ${phraseFor(i.dimension, i.value)} — underperformed (n=${i.postCount}, ${i.deltaPct.toFixed(0)}% vs mean). Do not use unless the concept strongly demands it.`,
    ),
  ];

  return { updatedAt: new Date().toISOString(), totalObservations, meanScore, top, bottom, promptLines };
}

export async function saveLearnings(learnings: Learnings): Promise<void> {
  await uploadPublic(LEARNINGS_KEY, JSON.stringify(learnings, null, 2), "application/json");
}

/** Returns "" if no learnings have been computed yet or there's nothing notable — never blocks generation. */
export async function loadLearningsPromptBlock(): Promise<string> {
  const text = await getObjectTextOrNull(LEARNINGS_KEY);
  if (!text) return "";
  const learnings = JSON.parse(text) as Learnings;
  return learnings.promptLines.join("\n");
}

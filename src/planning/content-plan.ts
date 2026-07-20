import { getObjectTextOrNull, uploadPublic } from "../storage/r2.js";
import type { CtaType, HookCategory, PostFormat } from "../lib/types.js";

/**
 * One planned slot, up to 30 days out. `plannedFormat` is informational only
 * (mirrors content-cycle.yml's cron→format mapping for the human-readable
 * table) — format selection stays fully owned by that workflow's
 * FORCE_FORMAT env, never by this plan. `goal` reuses CtaType rather than a
 * parallel enum: the Constitution's "gönderi hedefi" column and the existing
 * CTA_TYPES both describe the same seven objectives a post can optimize for.
 */
export interface ContentPlanEntry {
  date: string; // "2026-07-21"
  slotIndex: number; // 0-4, matches content-cycle.yml's cron order
  plannedFormat: PostFormat;
  category: string; // CATEGORIES[].id
  intensity: string; // INTENSITIES[].id
  hookCategory: HookCategory;
  goal: CtaType;
  isEvergreen: boolean;
  evergreenSourceId?: string; // draftId of the original high-performing post
  generatedAt: string;
}

export interface ContentPlan {
  updatedAt: string;
  entries: ContentPlanEntry[];
}

const PLAN_KEY = "planning/content-plan.json";

export function emptyContentPlan(): ContentPlan {
  return { updatedAt: new Date(0).toISOString(), entries: [] };
}

export async function loadContentPlan(): Promise<ContentPlan> {
  const text = await getObjectTextOrNull(PLAN_KEY);
  if (!text) return emptyContentPlan();
  return JSON.parse(text) as ContentPlan;
}

export async function saveContentPlan(plan: ContentPlan): Promise<void> {
  await uploadPublic(PLAN_KEY, JSON.stringify(plan, null, 2), "application/json");
}

export function entryFor(plan: ContentPlan, date: string, slotIndex: number): ContentPlanEntry | undefined {
  return plan.entries.find((e) => e.date === date && e.slotIndex === slotIndex);
}

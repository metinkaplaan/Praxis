import { loadLearnings } from "../analytics/learnings.js";
import { loadObservations } from "../analytics/observations.js";
import { loadLedger } from "../analytics/performance-ledger.js";
import { logger } from "../lib/logger.js";
import type { PostFormat } from "../lib/types.js";
import { notifyFailure, sendMessage } from "../notify/telegram.js";
import {
  entryFor,
  loadContentPlan,
  saveContentPlan,
  type ContentPlan,
  type ContentPlanEntry,
} from "../planning/content-plan.js";
import { findEvergreenCandidate } from "../planning/evergreen.js";
import { pickTopicHookGoal } from "../planning/topic-picker.js";

const HORIZON_DAYS = 30;
const SUMMARY_DAYS = 7;
const SLOTS_PER_DAY = 5;
// Mirrors content-cycle.yml's cron→format mapping (08:00/11:00/14:30/18:00/21:30 UTC) — informational only, format selection stays owned by that workflow.
const FORMAT_BY_SLOT_INDEX: PostFormat[] = ["reel", "carousel", "reel", "carousel", "reel"];
const EVERGREEN_SLOT_INDEX = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
// Fixed reference point so cycleIndex (and therefore the cold-start rotation) stays stable across runs regardless of when the planner happens to execute.
const EPOCH_MS = new Date("2026-01-01T00:00:00Z").getTime();

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function cycleIndexFor(date: Date, slotIndex: number): number {
  const daysSinceEpoch = Math.floor((date.getTime() - EPOCH_MS) / DAY_MS);
  return daysSinceEpoch * SLOTS_PER_DAY + slotIndex;
}

function buildWeeklySummary(plan: ContentPlan, from: Date): string {
  const fromIso = isoDate(from);
  const toIso = isoDate(addDays(from, SUMMARY_DAYS));
  const week = plan.entries
    .filter((e) => e.date >= fromIso && e.date < toIso)
    .sort((a, b) => (a.date === b.date ? a.slotIndex - b.slotIndex : a.date.localeCompare(b.date)));

  const rows = week.map(
    (e) =>
      `${e.date} · ${e.plannedFormat.padEnd(8)} · ${e.category.padEnd(7)} · ${e.hookCategory.padEnd(9)} · ${e.goal}` +
      (e.isEvergreen ? " 🔁" : ""),
  );

  const evergreenThisWeek = week.find((e) => e.isEvergreen);
  const lines = [
    `📅 Haftalık plan / Weekly plan (${SUMMARY_DAYS} gün):`,
    ...rows,
    ...(evergreenThisWeek
      ? [
          "",
          `🔁 Evergreen: ${evergreenThisWeek.date} → "${evergreenThisWeek.category}" teması yeniden kullanılacak (kaynak: ${evergreenThisWeek.evergreenSourceId}).`,
        ]
      : []),
  ];
  return lines.join("\n");
}

/**
 * Weekly top-up (content-planner.yml): extends the 30-day plan from wherever
 * it currently ends, never regenerating entries that already exist — so a
 * missed run just means the next one covers more ground, same tolerance for
 * cron drift as every other workflow in this repo. Reads learnings.ts fresh
 * every run, so the cold-start → data-driven transition happens gradually,
 * automatically, with zero separate "maturity" concept of its own.
 */
async function main(): Promise<void> {
  const [existingPlan, learnings, observations, ledger] = await Promise.all([
    loadContentPlan(),
    loadLearnings(),
    loadObservations(),
    loadLedger(),
  ]);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayIsoStr = isoDate(today);

  // Drop past entries — keeps the artifact bounded to the live horizon.
  const futureEntries = existingPlan.entries.filter((e) => e.date >= todayIsoStr);
  let plan: ContentPlan = { updatedAt: existingPlan.updatedAt, entries: futureEntries };

  const evergreenCandidate = findEvergreenCandidate(observations, ledger, plan);
  let evergreenPlaced = false;
  const newEntries: ContentPlanEntry[] = [];

  for (let dayOffset = 0; dayOffset < HORIZON_DAYS; dayOffset++) {
    const date = addDays(today, dayOffset);
    const dateStr = isoDate(date);

    for (let slotIndex = 0; slotIndex < SLOTS_PER_DAY; slotIndex++) {
      if (entryFor(plan, dateStr, slotIndex)) continue; // already planned — never touch existing entries

      const generatedAt = new Date().toISOString();
      const placeEvergreenHere = !evergreenPlaced && evergreenCandidate && slotIndex === EVERGREEN_SLOT_INDEX;

      const entry: ContentPlanEntry = placeEvergreenHere
        ? {
            date: dateStr,
            slotIndex,
            plannedFormat: FORMAT_BY_SLOT_INDEX[slotIndex]!,
            category: evergreenCandidate.category,
            intensity: evergreenCandidate.intensity,
            hookCategory: evergreenCandidate.hookCategory,
            goal: evergreenCandidate.goal,
            isEvergreen: true,
            evergreenSourceId: evergreenCandidate.sourceDraftId,
            generatedAt,
          }
        : {
            date: dateStr,
            slotIndex,
            plannedFormat: FORMAT_BY_SLOT_INDEX[slotIndex]!,
            ...pickTopicHookGoal(cycleIndexFor(date, slotIndex), learnings),
            isEvergreen: false,
            generatedAt,
          };

      if (placeEvergreenHere) evergreenPlaced = true;
      newEntries.push(entry);
    }
  }

  plan = { updatedAt: new Date().toISOString(), entries: [...plan.entries, ...newEntries] };
  await saveContentPlan(plan);
  logger.info("content plan updated", {
    totalEntries: plan.entries.length,
    newEntries: newEntries.length,
    evergreenPlaced,
  });

  await sendMessage(buildWeeklySummary(plan, today));
}

main().catch(async (error) => {
  logger.error("content planner failed", { error: String(error) });
  await notifyFailure("content planner", error).catch(() => {});
  process.exitCode = 1;
});

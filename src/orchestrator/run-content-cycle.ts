import { randomUUID } from "node:crypto";
import { CATEGORIES, INTENSITIES } from "../brands/midnight/categories.js";
import { pickSlot } from "../brands/midnight/content-calendar.js";
import { generatePost, type PlanHints } from "../generation/captions.js";
import { generateCarouselImages, generateImage } from "../generation/images.js";
import { generateVideo } from "../generation/video.js";
import { logger } from "../lib/logger.js";
import type { Draft, PostFormat } from "../lib/types.js";
import { notifyFailure, sendDraftPreview } from "../notify/telegram.js";
import { entryFor, loadContentPlan } from "../planning/content-plan.js";
import { saveDraft } from "../storage/drafts.js";
import { uploadPublic } from "../storage/r2.js";

const FORCE_FORMAT = process.env.FORCE_FORMAT as PostFormat | undefined;
const SLOT_INDEX = process.env.SLOT_INDEX !== undefined && process.env.SLOT_INDEX !== "" ? Number(process.env.SLOT_INDEX) : undefined;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The 2-hour cycle (content-cycle.yml): generate → store → ask for approval.
 * Publishing is deliberately NOT done here — adult-adjacent brand content
 * goes out only after a human taps "Approve" in Telegram (Phase 1 gate).
 */
async function main(): Promise<void> {
  const slot = await pickSlot();
  if (FORCE_FORMAT) {
    logger.info("FORCE_FORMAT override active", { from: slot.format, to: FORCE_FORMAT });
    slot.format = FORCE_FORMAT;
  }

  // Content planner (src/planning/) override — additive only. If the plan
  // hasn't been generated yet, R2 is briefly unavailable, or this is a manual
  // workflow_dispatch run without SLOT_INDEX, planEntry is undefined and
  // behavior is byte-for-byte identical to the live pickSlot() rotation.
  const planEntry = SLOT_INDEX !== undefined ? entryFor(await loadContentPlan(), todayIso(), SLOT_INDEX) : undefined;
  let hints: PlanHints | undefined;
  if (planEntry) {
    const plannedCategory = CATEGORIES.find((c) => c.id === planEntry.category);
    const plannedIntensity = INTENSITIES.find((i) => i.id === planEntry.intensity);
    if (plannedCategory) slot.category = plannedCategory;
    if (plannedIntensity) slot.intensity = plannedIntensity;
    hints = { targetHook: planEntry.hookCategory, targetGoal: planEntry.goal, isEvergreen: planEntry.isEvergreen };
    logger.info("content plan entry applied", {
      date: planEntry.date,
      slotIndex: planEntry.slotIndex,
      category: planEntry.category,
      hookCategory: planEntry.hookCategory,
      isEvergreen: planEntry.isEvergreen,
    });
  }

  logger.info("cycle start", {
    account: slot.account,
    market: slot.market,
    category: slot.category.id,
    intensity: slot.intensity.id,
    format: slot.format,
  });

  const post = await generatePost(slot, hints);

  const id = randomUUID();
  const base = {
    id,
    createdAt: new Date().toISOString(),
    account: slot.account,
    market: slot.market,
    category: slot.category.id,
    intensity: slot.intensity.id,
    caption: post.caption,
    hashtags: post.hashtags,
    hookCategory: post.hookCategory,
    ctaType: post.ctaType,
    status: "pending_approval" as const,
    ...(planEntry?.isEvergreen
      ? {
          evergreenNote: `🔁 Evergreen replay: '${planEntry.category}' teması, geçmişte iyi performans gösteren bir tarifin tekrarı.`,
        }
      : {}),
  };

  let draft: Draft;
  if (post.format === "single") {
    const image = await generateImage(post.imagePrompt);
    const imageUrl = await uploadPublic(`media/${id}.png`, image, "image/png");
    draft = { ...base, format: "single", imageUrl };
  } else if (post.format === "carousel") {
    const orderedSlides = [...post.slides].sort((a, b) => a.order - b.order);
    const images = await generateCarouselImages(orderedSlides.map((s) => s.imagePrompt));
    const imageUrls = await Promise.all(
      images.map((img, i) => uploadPublic(`media/${id}-${i}.png`, img, "image/png")),
    );
    draft = { ...base, format: "carousel", imageUrls };
  } else {
    const video = await generateVideo(post.videoPrompt);
    const videoUrl = await uploadPublic(`media/${id}.mp4`, video.bytes, "video/mp4");
    draft = { ...base, format: "reel", videoUrl, videoDurationSec: video.durationSec };
  }

  await saveDraft(draft);
  await sendDraftPreview(draft);
  logger.info("cycle complete — awaiting approval", { id, format: draft.format });
}

main().catch(async (error) => {
  logger.error("content cycle failed", { error: String(error) });
  await notifyFailure("content cycle", error).catch(() => {});
  process.exitCode = 1;
});

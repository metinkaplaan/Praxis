import { randomUUID } from "node:crypto";
import { pickSlot } from "../brands/midnight/content-calendar.js";
import { generatePost } from "../generation/captions.js";
import { generateCarouselImages, generateImage } from "../generation/images.js";
import { generateVideo } from "../generation/video.js";
import { logger } from "../lib/logger.js";
import type { Draft, PostFormat } from "../lib/types.js";
import { notifyFailure, sendDraftPreview } from "../notify/telegram.js";
import { saveDraft } from "../storage/drafts.js";
import { uploadPublic } from "../storage/r2.js";

const FORCE_FORMAT = process.env.FORCE_FORMAT as PostFormat | undefined;

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
  logger.info("cycle start", {
    account: slot.account,
    market: slot.market,
    category: slot.category.id,
    intensity: slot.intensity.id,
    format: slot.format,
  });

  const post = await generatePost(slot);

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
    status: "pending_approval" as const,
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
    const videoUrl = await uploadPublic(`media/${id}.mp4`, video, "video/mp4");
    draft = { ...base, format: "reel", videoUrl };
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

import { randomUUID } from "node:crypto";
import { pickSlot } from "../brands/midnight/content-calendar.js";
import { generatePost } from "../generation/captions.js";
import { generateImage } from "../generation/images.js";
import { logger } from "../lib/logger.js";
import type { Draft } from "../lib/types.js";
import { notifyFailure, sendDraftPreview } from "../notify/telegram.js";
import { saveDraft } from "../storage/drafts.js";
import { uploadPublic } from "../storage/r2.js";

/**
 * The 2-hour cycle (content-cycle.yml): generate → store → ask for approval.
 * Publishing is deliberately NOT done here — adult-adjacent brand content
 * goes out only after a human taps "Approve" in Telegram (Phase 1 gate).
 */
async function main(): Promise<void> {
  const slot = pickSlot();
  logger.info("cycle start", {
    account: slot.account,
    market: slot.market,
    category: slot.category.id,
    intensity: slot.intensity.id,
  });

  const post = await generatePost(slot);
  const image = await generateImage(post.imagePrompt);

  const id = randomUUID();
  const imageUrl = await uploadPublic(`media/${id}.png`, image, "image/png");

  const draft: Draft = {
    id,
    createdAt: new Date().toISOString(),
    account: slot.account,
    market: slot.market,
    category: slot.category.id,
    intensity: slot.intensity.id,
    caption: post.caption,
    hashtags: post.hashtags,
    imageUrl,
    status: "pending_approval",
  };

  await saveDraft(draft);
  await sendDraftPreview(draft);
  logger.info("cycle complete — awaiting approval", { id });
}

main().catch(async (error) => {
  logger.error("content cycle failed", { error: String(error) });
  await notifyFailure("content cycle", error).catch(() => {});
  process.exitCode = 1;
});

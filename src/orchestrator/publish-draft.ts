import { logger } from "../lib/logger.js";
import { notifyFailure, notifyPublished, sendMessage } from "../notify/telegram.js";
import { publishDraft } from "../publishing/instagram.js";
import { loadDraft, saveDraft } from "../storage/drafts.js";

/**
 * Entry point for publish-approved.yml (repository_dispatch from the
 * Telegram webhook) and for manual workflow_dispatch runs.
 * Env: DRAFT_ID (required), ACTION ("approve" | "reject", default approve).
 */
async function main(): Promise<void> {
  const draftId = process.env.DRAFT_ID;
  if (!draftId) throw new Error("DRAFT_ID is required");
  const action = process.env.ACTION === "reject" ? "reject" : "approve";

  const draft = await loadDraft(draftId);
  if (draft.status !== "pending_approval") {
    logger.warn("draft already handled, skipping", { draftId, status: draft.status });
    return;
  }

  if (action === "reject") {
    draft.status = "rejected";
    await saveDraft(draft);
    await sendMessage(`🗑 Taslak reddedildi / Draft rejected: ${draft.category} (${draftId})`);
    return;
  }

  const { mediaId } = await publishDraft(draft);
  draft.status = "published";
  draft.mediaId = mediaId;
  draft.publishedAt = new Date().toISOString();
  draft.postHourUtc = new Date().getUTCHours();
  await saveDraft(draft);
  await notifyPublished(draft, `media id: ${mediaId}`);
}

main().catch(async (error) => {
  logger.error("publish draft failed", { error: String(error) });
  await notifyFailure("publish draft", error).catch(() => {});
  process.exitCode = 1;
});

import { fetchMediaInsights } from "../analytics/insights.js";
import { keyFor, loadLedger, recordOutcome, saveLedger } from "../analytics/performance-ledger.js";
import { optionalEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import type { Draft } from "../lib/types.js";
import { notifyFailure, sendMessage } from "../notify/telegram.js";
import { loadAllDrafts, saveDraft } from "../storage/drafts.js";

function isEligible(draft: Draft, maturationDays: number): draft is Draft & { mediaId: string; publishedAt: string } {
  if (draft.status !== "published" || !draft.mediaId || !draft.publishedAt) return false;
  if (draft.insightsCollectedAt) return false;
  const ageMs = Date.now() - new Date(draft.publishedAt).getTime();
  return ageMs >= maturationDays * 24 * 60 * 60 * 1000;
}

async function main(): Promise<void> {
  const maturationDays = Number(optionalEnv("INSIGHTS_MATURATION_DAYS", "3"));
  const allDrafts = await loadAllDrafts();
  const eligible = allDrafts.filter((d) => isEligible(d, maturationDays));

  logger.info("collect-insights start", { totalDrafts: allDrafts.length, eligible: eligible.length });

  let ledger = await loadLedger();
  let collected = 0;

  for (const draft of eligible) {
    try {
      const metrics = await fetchMediaInsights(draft.mediaId!, draft.account, draft.format);
      const slot = { category: draft.category, intensity: draft.intensity, market: draft.market, account: draft.account, format: draft.format };
      ledger = recordOutcome(ledger, slot, metrics);
      draft.insightsCollectedAt = new Date().toISOString();
      await saveDraft(draft);
      collected++;
      logger.info("insights recorded", { id: draft.id, key: keyFor(slot) });
    } catch (error) {
      // Best-effort: one bad media ID shouldn't block the rest of the batch.
      logger.error("failed to collect insights for draft", { id: draft.id, error: String(error) });
    }
  }

  if (collected > 0) {
    await saveLedger(ledger);
  }
  await sendMessage(`📊 Insights toplandı / collected: ${collected}/${eligible.length} gönderi. Ledger güncellendi.`);
}

main().catch(async (error) => {
  logger.error("collect-insights failed", { error: String(error) });
  await notifyFailure("collect insights", error).catch(() => {});
  process.exitCode = 1;
});

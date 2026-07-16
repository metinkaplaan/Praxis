import { buildLearnings, saveLearnings } from "../analytics/learnings.js";
import { fetchMediaInsights } from "../analytics/insights.js";
import { loadObservations, observationFromDraft, saveObservations } from "../analytics/observations.js";
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
  let observationLog = await loadObservations();
  let collected = 0;

  for (const draft of eligible) {
    try {
      const metrics = await fetchMediaInsights(draft.mediaId!, draft.account, draft.format);
      const slot = { category: draft.category, intensity: draft.intensity, market: draft.market, account: draft.account, format: draft.format };
      ledger = recordOutcome(ledger, slot, metrics);
      observationLog = {
        version: 1,
        updatedAt: new Date().toISOString(),
        observations: [...observationLog.observations, observationFromDraft(draft, metrics)],
      };
      draft.insightsCollectedAt = new Date().toISOString();
      await saveDraft(draft);
      collected++;
      logger.info("insights recorded", { id: draft.id, key: keyFor(slot) });
    } catch (error) {
      // Best-effort: one bad media ID shouldn't block the rest of the batch.
      logger.error("failed to collect insights for draft", { id: draft.id, error: String(error) });
    }
  }

  let summaryLine = "";
  if (collected > 0) {
    await saveLedger(ledger);
    await saveObservations(observationLog);

    const learnings = buildLearnings(observationLog);
    await saveLearnings(learnings);
    if (learnings.top.length > 0 || learnings.bottom.length > 0) {
      const best = learnings.top[0];
      const worst = learnings.bottom[0];
      summaryLine = [
        "\n🧠",
        best ? `En iyi: ${best.dimension}=${best.value} (${best.deltaPct >= 0 ? "+" : ""}${best.deltaPct.toFixed(0)}%).` : "",
        worst ? `Kaçınılan: ${worst.dimension}=${worst.value} (${worst.deltaPct.toFixed(0)}%).` : "",
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  await sendMessage(`📊 Insights toplandı / collected: ${collected}/${eligible.length} gönderi. Ledger güncellendi.${summaryLine}`);
}

main().catch(async (error) => {
  logger.error("collect-insights failed", { error: String(error) });
  await notifyFailure("collect insights", error).catch(() => {});
  process.exitCode = 1;
});

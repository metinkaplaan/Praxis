import { logger } from "../lib/logger.js";
import type { Draft } from "../lib/types.js";
import { getObjectText, listObjects, uploadPublic } from "./r2.js";

/**
 * Drafts awaiting approval are stored as JSON manifests in R2 under
 * `drafts/<id>.json`. GitHub Actions runs are stateless; R2 is the only
 * shared state between the generation cycle and the approved-publish run.
 */
export async function saveDraft(draft: Draft): Promise<void> {
  await uploadPublic(`drafts/${draft.id}.json`, JSON.stringify(draft, null, 2), "application/json");
  logger.info("draft saved", { id: draft.id, status: draft.status });
}

export async function loadDraft(id: string): Promise<Draft> {
  const text = await getObjectText(`drafts/${id}.json`);
  if (!text) throw new Error(`Draft not found: ${id}`);
  return JSON.parse(text) as Draft;
}

/**
 * Lists every draft ever written. Fine at MVP volume (a few posts/day); if
 * this ever gets slow, switch to a maintained `drafts/index.json` manifest
 * instead of listing the whole prefix.
 */
export async function loadAllDrafts(): Promise<Draft[]> {
  const keys = await listObjects("drafts/");
  const drafts = await Promise.all(
    keys.map(async (key) => JSON.parse(await getObjectText(key)) as Draft),
  );
  return drafts;
}

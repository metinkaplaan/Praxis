import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates a Reel via Veo (confirmed working with a plain Gemini Developer
 * API key — see scripts/smoke-test-veo.ts). Generation is async: the API
 * returns an operation that must be polled until done. A ~9:16 vertical clip
 * takes roughly 60-90s in practice; the timeout below gives generous headroom.
 */
export async function generateVideo(videoPrompt: string): Promise<Buffer> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("VEO_MODEL", "veo-3.1-generate-preview");

  let operation = await ai.models.generateVideos({
    model,
    prompt: videoPrompt,
    config: { aspectRatio: "9:16", numberOfVideos: 1 },
  });
  logger.info("veo generation started", { model });

  const intervalMs = Number(optionalEnv("VEO_POLL_INTERVAL_MS", "15000"));
  const timeoutMs = Number(optionalEnv("VEO_MAX_POLL_MS", "600000"));
  const start = Date.now();

  while (!operation.done) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Veo generation timed out after ${timeoutMs}ms`);
    }
    await sleep(intervalMs);
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (operation.error) {
    throw new Error(`Veo generation failed: ${JSON.stringify(operation.error)}`);
  }
  const generatedVideo = operation.response?.generatedVideos?.[0];
  if (!generatedVideo?.video) {
    throw new Error("Veo returned no video");
  }

  // The Gemini Developer API returns a file `uri`, not inline bytes — download
  // it to a temp file (the SDK's supported way to materialize a GeneratedVideo)
  // and read it back into a Buffer for uploadPublic().
  const downloadPath = join(tmpdir(), `praxis-veo-${randomUUID()}.mp4`);
  try {
    await ai.files.download({ file: generatedVideo, downloadPath });
    const bytes = await readFile(downloadPath);
    logger.info("video generated", { model, bytes: bytes.length, durationMs: Date.now() - start });
    return bytes;
  } finally {
    await rm(downloadPath, { force: true });
  }
}

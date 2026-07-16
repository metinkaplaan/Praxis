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
export interface GeneratedVideoResult {
  bytes: Buffer;
  durationSec: number;
}

export async function generateVideo(videoPrompt: string): Promise<GeneratedVideoResult> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("VEO_MODEL", "veo-3.1-fast-generate-preview");
  // IG target is 1080x1920; if the model/region rejects 9:16+1080p, set
  // VEO_RESOLUTION=720p (IG upscales fine). fps is deliberately NOT set —
  // Veo outputs ~24fps which Instagram accepts (23-60fps).
  const resolution = optionalEnv("VEO_RESOLUTION", "1080p") as "720p" | "1080p";
  const durationSec = Number(optionalEnv("VEO_DURATION_SEC", "8"));

  let operation = await ai.models.generateVideos({
    model,
    prompt: videoPrompt,
    config: { aspectRatio: "9:16", numberOfVideos: 1, resolution, durationSeconds: durationSec },
  });
  logger.info("veo generation started", { model, resolution, durationSec });

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
    return { bytes, durationSec };
  } finally {
    await rm(downloadPath, { force: true });
  }
}

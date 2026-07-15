import { GoogleGenAI } from "@google/genai";
import { requireEnv } from "../src/lib/env.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One-off check: does GEMINI_API_KEY have Veo access? Some Veo models require
 * a Vertex AI project/billing instead of a plain Gemini Developer API key —
 * this script answers that before we build the full video.ts pipeline.
 * Not part of the production orchestrator; safe to delete after use.
 */
async function main(): Promise<void> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = process.env.VEO_MODEL || "veo-3.0-generate-001";
  console.log(`Requesting video generation with model: ${model}`);

  const start = Date.now();
  let operation = await ai.models.generateVideos({
    model,
    prompt: "A single lit candle flickering gently in a dark room, cinematic, slow motion",
    config: { aspectRatio: "9:16", numberOfVideos: 1 },
  });
  console.log(`generateVideos accepted the request in ${Date.now() - start}ms. Polling...`);

  const maxPollMs = 4 * 60 * 1000;
  const pollStart = Date.now();
  while (!operation.done) {
    if (Date.now() - pollStart > maxPollMs) {
      console.log(`Still processing after ${maxPollMs}ms — API access confirmed, generation is just slow. Stopping smoke test here.`);
      process.exit(0);
    }
    await sleep(15000);
    operation = await ai.operations.getVideosOperation({ operation });
    console.log(`Poll at +${Math.round((Date.now() - pollStart) / 1000)}s: done=${operation.done}`);
  }

  if (operation.error) {
    console.error("Operation finished with error:", JSON.stringify(operation.error));
    process.exit(1);
  }
  const video = operation.response?.generatedVideos?.[0]?.video;
  console.log(`Total time: ${Date.now() - start}ms`);
  console.log("Video result:", JSON.stringify({ hasUri: Boolean(video?.uri), hasBytes: Boolean(video?.videoBytes), mimeType: video?.mimeType }));
}

main().catch((err) => {
  console.error("Veo smoke test FAILED:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});

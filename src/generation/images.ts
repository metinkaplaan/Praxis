import { GoogleGenAI } from "@google/genai";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";

/**
 * Generates a single feed image via Gemini's image model ("Nano Banana").
 * Instagram feed target is 4:5 (1080×1350) — the aspect ratio is pinned in
 * the prompt because it matters more than raw resolution for feed cropping.
 */
export async function generateImage(imagePrompt: string): Promise<Buffer> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image");

  const response = await ai.models.generateContent({
    model,
    contents: `${imagePrompt}\n\nPortrait 4:5 aspect ratio, high quality, no text or watermarks.`,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      logger.info("image generated", { model, bytes: part.inlineData.data.length });
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  throw new Error("Image model returned no image data");
}

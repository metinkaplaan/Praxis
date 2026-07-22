import { GoogleGenAI } from "@google/genai";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";

/**
 * No blanket "no text" ban — informational carousel slides (captions.ts)
 * deliberately describe on-image text for a text-card design. Instead: no
 * watermarks/logos ever, and no STRAY/incidental text, but if the art
 * direction above explicitly calls for on-image text, render exactly that,
 * large and legible.
 */
function buildImageDirective(imagePrompt: string): string {
  return (
    `${imagePrompt}\n\nPortrait 4:5 aspect ratio, high quality, no watermarks or logos. ` +
    "No stray/incidental text — but if the art direction above explicitly calls for on-image text " +
    "(e.g. a text-card design with specific wording), render exactly that text, large and perfectly legible."
  );
}

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
    contents: buildImageDirective(imagePrompt),
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

/**
 * Generates carousel slide images sequentially (not in parallel) — the Gemini
 * image model has per-minute rate limits that a 3-5-way burst can trip, and
 * a failed slide 4 of 5 would waste the slides already generated anyway.
 */
export async function generateCarouselImages(imagePrompts: string[]): Promise<Buffer[]> {
  const images: Buffer[] = [];
  for (const prompt of imagePrompts) {
    images.push(await generateImage(prompt));
  }
  return images;
}

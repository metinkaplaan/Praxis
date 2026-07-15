import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { IG_HANDLES, MIDNIGHT_BRAND } from "../brands/midnight/brand.js";
import type { ContentSlot } from "../brands/midnight/content-calendar.js";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import type { GeneratedPost } from "../lib/types.js";

/**
 * The schema is the enforcement point for the bilingual rule: `tr` is a
 * required field, so a caption without its Turkish translation is invalid
 * output and the run fails loudly instead of publishing English-only copy.
 */
const postSchema = z.object({
  caption: z.object({
    en: z.string().min(1),
    tr: z.string().min(1),
  }),
  hashtags: z.array(z.string()).min(3).max(15),
  imagePrompt: z.string().min(1),
});

export async function generatePost(slot: ContentSlot): Promise<GeneratedPost> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("GEMINI_TEXT_MODEL", "gemini-2.5-flash");

  const prompt = [
    `You write Instagram captions for "${MIDNIGHT_BRAND.name}", a couples' game app.`,
    `Brand slogan: "${MIDNIGHT_BRAND.slogan.en}" / "${MIDNIGHT_BRAND.slogan.tr}".`,
    `Tonight's theme: ${slot.category.theme.en} (category "${slot.category.id}", intensity "${slot.intensity.label.en}").`,
    `Primary market: ${slot.market}. Account: @${IG_HANDLES[slot.account]}.`,
    "",
    "Rules:",
    "- Tasteful and suggestive, never explicit. Must comply with Instagram content policies.",
    "- The caption invites couples to play together tonight; end with a soft call to action.",
    "- Write the English caption AND its natural Turkish translation (not literal, same energy).",
    "- 3-8 relevant hashtags, mixing English and Turkish, no banned/spammy tags.",
    "- Also produce `imagePrompt`: a single-image art direction for this post, consistent with:",
    `  "${MIDNIGHT_BRAND.visualIdentity}" and "${slot.category.visualHint}".`,
    "  The image must contain no text and be safe for Instagram.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caption: {
            type: Type.OBJECT,
            properties: {
              en: { type: Type.STRING },
              tr: { type: Type.STRING },
            },
            required: ["en", "tr"],
          },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          imagePrompt: { type: Type.STRING },
        },
        required: ["caption", "hashtags", "imagePrompt"],
      },
    },
  });

  const parsed = postSchema.parse(JSON.parse(response.text ?? "{}"));
  logger.info("caption generated", {
    category: slot.category.id,
    market: slot.market,
    account: slot.account,
  });
  return parsed;
}

import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { IG_HANDLES, MIDNIGHT_BRAND } from "../brands/midnight/brand.js";
import type { ContentSlot } from "../brands/midnight/content-calendar.js";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { loadGrowthNotes } from "../lib/growth-notes.js";
import { logger } from "../lib/logger.js";
import type { GeneratedPost } from "../lib/types.js";

const bilingualSchema = z.object({ en: z.string().min(1), tr: z.string().min(1) });

/**
 * The bilingual `caption` field is the enforcement point for the brand's
 * standing rule: `tr` is required, so output without a Turkish translation
 * is invalid and the run fails loudly instead of publishing English-only copy.
 */
const singleSchema = z.object({
  caption: bilingualSchema,
  hashtags: z.array(z.string()).min(3).max(15),
  imagePrompt: z.string().min(1),
});

const carouselSchema = z.object({
  caption: bilingualSchema,
  hashtags: z.array(z.string()).min(3).max(15),
  slides: z
    .array(
      z.object({
        order: z.number().int().min(1),
        role: z.enum(["hook", "build", "payoff", "cta"]),
        imagePrompt: z.string().min(1),
      }),
    )
    .min(3)
    .max(5),
});

const reelSchema = z.object({
  caption: bilingualSchema,
  hashtags: z.array(z.string()).min(3).max(15),
  videoPrompt: z.string().min(1),
});

async function buildSharedContext(slot: ContentSlot): Promise<string[]> {
  const growthNotes = await loadGrowthNotes();
  const lines = [
    `You write Instagram content for "${MIDNIGHT_BRAND.name}", a couples' game app.`,
    `Brand slogan: "${MIDNIGHT_BRAND.slogan.en}" / "${MIDNIGHT_BRAND.slogan.tr}".`,
    `Tonight's theme: ${slot.category.theme.en} (category "${slot.category.id}", intensity "${slot.intensity.label.en}").`,
    `Primary market: ${slot.market}. Account: @${IG_HANDLES[slot.account]}. Format: ${slot.format}.`,
    "",
    "General rules:",
    "- Tasteful and suggestive, never explicit. Must comply with Instagram content policies.",
    "- Write the English caption AND its natural Turkish translation (not literal, same energy).",
    "- No text/watermarks in any generated image.",
    "",
    "Growth-oriented copywriting (this account is trying to grow):",
    '- Open the caption with a hook in the first sentence — a bold claim, a question, or tension that stops the scroll.',
    "- Write for saves and shares, not just likes: give the reader a reason to bookmark this post or send it to their partner.",
    "- End with one clear, low-friction call to action (not multiple asks).",
    "- Hashtags: 2-3 broad/high-volume + 4-6 niche/specific — mix English and Turkish, no banned or spammy tags.",
  ];
  if (growthNotes) {
    lines.push(
      "",
      "Operatörden stratejik ek talimatlar (apply these where relevant, use judgment):",
      growthNotes,
    );
  }
  return lines;
}

export async function generatePost(slot: ContentSlot): Promise<GeneratedPost> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("GEMINI_TEXT_MODEL", "gemini-2.5-flash");
  const shared = await buildSharedContext(slot);

  if (slot.format === "single") {
    const prompt = [
      ...shared,
      "",
      "Produce `imagePrompt`: a single-image art direction for this post, consistent with:",
      `"${MIDNIGHT_BRAND.visualIdentity}" and "${slot.category.visualHint}".`,
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
              properties: { en: { type: Type.STRING }, tr: { type: Type.STRING } },
              required: ["en", "tr"],
            },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING },
          },
          required: ["caption", "hashtags", "imagePrompt"],
        },
      },
    });

    const parsed = singleSchema.parse(JSON.parse(response.text ?? "{}"));
    logger.info("caption generated", { format: "single", category: slot.category.id, market: slot.market });
    return { format: "single", ...parsed };
  }

  if (slot.format === "carousel") {
    const prompt = [
      ...shared,
      "",
      "This is a CAROUSEL post (3-5 slides swiped in order). Produce `slides`: an array where each item has",
      "`order` (1-based), `role` (hook|build|payoff|cta), and `imagePrompt` (art direction for that slide,",
      `consistent with "${MIDNIGHT_BRAND.visualIdentity}" and "${slot.category.visualHint}").`,
      "Build a micro-narrative across slides: hook grabs attention, build develops it, payoff delivers the",
      "insight/punchline, cta is a final slide encouraging a save/share/follow.",
      'The caption should explicitly encourage swiping (e.g. "Sona kadar kaydır" / "Swipe to the end").',
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
              properties: { en: { type: Type.STRING }, tr: { type: Type.STRING } },
              required: ["en", "tr"],
            },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  order: { type: Type.INTEGER },
                  role: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                },
                required: ["order", "role", "imagePrompt"],
              },
            },
          },
          required: ["caption", "hashtags", "slides"],
        },
      },
    });

    const parsed = carouselSchema.parse(JSON.parse(response.text ?? "{}"));
    logger.info("caption generated", { format: "carousel", category: slot.category.id, market: slot.market, slides: parsed.slides.length });
    return { format: "carousel", ...parsed };
  }

  // reel
  const prompt = [
    ...shared,
    "",
    "This is a REEL (short vertical video). Produce `videoPrompt`: a single, vivid video generation prompt",
    "(scene, motion, camera, mood) consistent with:",
    `"${MIDNIGHT_BRAND.visualIdentity}" and "${slot.category.visualHint}".`,
    "Describe what happens in the first 1-2 seconds explicitly — that's the hook that decides whether",
    "someone keeps watching. Keep the caption energetic and short compared to a feed post.",
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
            properties: { en: { type: Type.STRING }, tr: { type: Type.STRING } },
            required: ["en", "tr"],
          },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          videoPrompt: { type: Type.STRING },
        },
        required: ["caption", "hashtags", "videoPrompt"],
      },
    },
  });

  const parsed = reelSchema.parse(JSON.parse(response.text ?? "{}"));
  logger.info("caption generated", { format: "reel", category: slot.category.id, market: slot.market });
  return { format: "reel", ...parsed };
}

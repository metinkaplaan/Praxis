import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { IG_HANDLES, MIDNIGHT_BRAND } from "../brands/midnight/brand.js";
import type { ContentSlot } from "../brands/midnight/content-calendar.js";
import { optionalEnv, requireEnv } from "../lib/env.js";
import { loadLearningsPromptBlock } from "../analytics/learnings.js";
import { loadGrowthNotes } from "../lib/growth-notes.js";
import { buildKnowledgeBlock } from "../lib/knowledge.js";
import { logger } from "../lib/logger.js";
import { CTA_TYPES, HOOK_CATEGORIES, type CtaType, type GeneratedPost, type HookCategory } from "../lib/types.js";

const bilingualSchema = z.object({ en: z.string().min(1), tr: z.string().min(1) });

/**
 * The bilingual `caption` field is the enforcement point for the brand's
 * standing rule: `tr` is required, so output without a Turkish translation
 * is invalid and the run fails loudly instead of publishing English-only copy.
 * hookCategory/ctaType are the model's self-labels feeding the learning loop.
 */
const labeledBase = {
  caption: bilingualSchema,
  hashtags: z.array(z.string()).min(3).max(15),
  hookCategory: z.enum(HOOK_CATEGORIES),
  ctaType: z.enum(CTA_TYPES),
};

const singleSchema = z.object({
  ...labeledBase,
  imagePrompt: z.string().min(1),
});

const carouselSchema = z.object({
  ...labeledBase,
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
  ...labeledBase,
  videoPrompt: z.string().min(1),
});

/** Gemini responseSchema fragments for the shared labeled fields. */
const labelResponseProperties = {
  caption: {
    type: Type.OBJECT,
    properties: { en: { type: Type.STRING }, tr: { type: Type.STRING } },
    required: ["en", "tr"],
  },
  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  hookCategory: { type: Type.STRING, enum: [...HOOK_CATEGORIES] },
  ctaType: { type: Type.STRING, enum: [...CTA_TYPES] },
} as const;
const labelRequired = ["caption", "hashtags", "hookCategory", "ctaType"];

/**
 * Generic aesthetic buzzwords ("dramatic lighting, elegant") reliably produce
 * the glossy, symmetrical, slightly plastic look that reads as obviously
 * AI-generated — and specifically fails to capture genuine chemistry/passion
 * between two people, which was exactly the operator's complaint. Forcing
 * one concrete, small, imperfect physical/emotional detail per prompt is what
 * actually breaks that pattern; this is appended to every imagePrompt/
 * videoPrompt instruction, not to the caption instructions.
 */
const REALISM_DIRECTIVE = [
  "Visual direction — avoid the generic 'AI-generated' look:",
  "- Do not rely on aesthetic buzzwords alone. Specify ONE concrete, small, imperfect physical or emotional",
  "  detail a real photograph would catch: a specific hand placement, an asymmetric pose, a genuine facial",
  "  micro-expression, uneven breathing, a wrinkle in fabric, a stray hair, weight shifted unevenly.",
  "- Prefer candid/documentary framing (a caught moment) over posed/symmetrical/magazine-cover framing.",
  "- Real couples are not perfectly symmetrical or glossy — describe a slightly imperfect, in-the-moment",
  "  instant, not a staged tableau.",
  "- Where it fits the mood, reference real photographic qualities (35mm film grain, natural light falloff,",
  "  slight motion blur) rather than smooth, over-rendered CGI-like polish.",
].join("\n");

/**
 * Approved templates for the INFORMATIONAL carousel style (operator-approved
 * 2026-07-22). Concrete enough to generate from directly, general enough to
 * cover any theme — the model still picks which one fits tonight's category.
 */
const INFORMATIONAL_CAROUSEL_TEMPLATES = [
  "Pick ONE of these templates (or a close variant of one), whichever fits tonight's theme:",
  "- Myth vs Reality: each slide names a common belief about relationships/intimacy, then corrects it in one",
  "  short line. Contrarian/authority tone (e.g. 'Most couples think X. They're wrong.').",
  "- Signs Checklist: a numbered list of signs pointing at a problem or opportunity (e.g. '5 signs your date",
  "  nights need a reset') — practical, save-worthy, mild loss-framing per slide.",
  "- Stat-Driven Facts: each slide states one statistic or claim in an authoritative tone (e.g. '9 in 10",
  "  couples have never asked this question'), followed by a one-line takeaway. Use plausible/soft ratios,",
  "  never invented hard numbers that read as fake.",
].join("\n");

export interface PlanHints {
  targetHook: HookCategory;
  targetGoal: CtaType;
  isEvergreen: boolean;
}

async function buildSharedContext(slot: ContentSlot, hints?: PlanHints): Promise<string[]> {
  const growthNotes = await loadGrowthNotes();
  const knowledge = await buildKnowledgeBlock(slot.format);
  const learnings = await loadLearningsPromptBlock();
  const lines = [
    `You write Instagram content for "${MIDNIGHT_BRAND.name}", a couples' game app.`,
    "Mission: every post exists to grow the Midnight app — follower growth, profile visits, app installs. Optimize for saves and shares.",
    `Brand slogan: "${MIDNIGHT_BRAND.slogan.en}" / "${MIDNIGHT_BRAND.slogan.tr}".`,
    `Tonight's theme: ${slot.category.theme.en} (category "${slot.category.id}", intensity "${slot.intensity.label.en}").`,
    `Primary market: ${slot.market}. Account: @${IG_HANDLES[slot.account]}. Format: ${slot.format}.`,
    "",
    "General rules:",
    "- Tasteful and suggestive, never explicit. Must comply with Instagram content policies.",
    "- Write the English caption AND its natural Turkish translation (not literal, same energy).",
    "- No watermarks/logos ever, and no stray/incidental text in any generated image — the one exception is",
    "  informational carousel text-card slides, see carousel-specific instructions below.",
    "- HARD BRAND RULE, no exceptions: whenever a couple/two people appear in an image or video, it is",
    "  always exactly one man and one woman — never two people of the same sex. When writing imagePrompt/",
    "  slides[].imagePrompt/videoPrompt, always state this explicitly (e.g. 'a man and a woman...') so the",
    "  image/video model is never left to guess.",
    "- HARD BRAND RULE, no exceptions: our audience is 20-35 years old — everyone depicted (single subject",
    "  or couple) must look 20-35, a youthful twenties/early-thirties adult appearance. Never depict anyone",
    "  who reads as older/mature (grey or greying hair, visible age wrinkles, an older appearance) or as a",
    "  minor. When writing imagePrompt/slides[].imagePrompt/videoPrompt, always state the age range explicitly",
    "  (e.g. 'a man and a woman in their late 20s...') so the image/video model is never left to guess.",
    "- HARD BRAND RULE, no exceptions: both people depicted (the man and the woman) have a British phenotype —",
    "  fair/light skin tone and typical British-European facial features. When writing imagePrompt/",
    "  slides[].imagePrompt/videoPrompt, always state this explicitly (e.g. 'a British man and a British",
    "  woman...') so the image/video model is never left to guess.",
    "- HARD BRAND RULE, no exceptions: wardrobe/framing always leans bold — a deep neckline/cleavage and",
    "  lingerie or lingerie-adjacent attire (bodysuits, bralettes, corsetry) are the default styling, not the",
    "  exception. This still stays within the 'tasteful, suggestive, never explicit' ceiling above: no nipple",
    "  or genital exposure, no fully nude poses. When writing imagePrompt/slides[].imagePrompt/videoPrompt,",
    "  describe the wardrobe explicitly so the image/video model is never left to guess.",
    "",
    "Growth-oriented copywriting (this account is trying to grow):",
    '- Open the caption with a hook in the first sentence — a bold claim, a question, or tension that stops the scroll.',
    "- Write for saves and shares, not just likes: give the reader a reason to bookmark this post or send it to their partner.",
    "- End with one clear, low-friction call to action (not multiple asks).",
    "- Hashtags: 2-3 broad/high-volume + 4-6 niche/specific — mix English and Turkish, no banned or spammy tags.",
    "",
    "Self-labeling (feeds a learning loop — label honestly, not aspirationally):",
    `- \`hookCategory\`: which psychological hook category the caption's FIRST sentence actually uses (one of: ${HOOK_CATEGORIES.join(", ")}).`,
    `- \`ctaType\`: the single CTA you close with (one of: ${CTA_TYPES.join(", ")}).`,
  ];
  if (hints) {
    lines.push(
      "",
      `Today's content plan targets a '${hints.targetHook}' hook and a '${hints.targetGoal}' CTA for this slot` +
        `${hints.isEvergreen ? " (replaying a past high-performing recipe)" : ""} — aim for these, but keep` +
        " self-labeling honest (see above) rather than forcing an unnatural fit.",
    );
  }
  if (knowledge) {
    lines.push("", "Instagram playbook (apply these):", knowledge);
  }
  if (learnings) {
    lines.push("", "Learned from OUR OWN past performance (own-account Insights — trust these):", learnings);
  }
  if (growthNotes) {
    lines.push(
      "",
      "Operatörden stratejik ek talimatlar (apply these where relevant, use judgment):",
      growthNotes,
    );
  }
  return lines;
}

export async function generatePost(slot: ContentSlot, hints?: PlanHints): Promise<GeneratedPost> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const model = optionalEnv("GEMINI_TEXT_MODEL", "gemini-2.5-flash");
  const shared = await buildSharedContext(slot, hints);

  if (slot.format === "single") {
    const prompt = [
      ...shared,
      "",
      "Produce `imagePrompt`: a single-image art direction for this post, consistent with:",
      `"${MIDNIGHT_BRAND.visualIdentity}" and "${slot.category.visualHint}".`,
      "",
      REALISM_DIRECTIVE,
    ].join("\n");

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ...labelResponseProperties,
            imagePrompt: { type: Type.STRING },
          },
          required: [...labelRequired, "imagePrompt"],
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
      "",
      "Choose ONE of two carousel styles, whichever better fits tonight's theme:",
      "1. NARRATIVE (photo) — the default: each imagePrompt is a photographic scene per the visual direction below.",
      "2. INFORMATIONAL (text-card) — use this when the theme suits a tip, a list, a 'did you know' fact, or a",
      "   step-by-step idea better than a photo story. Each imagePrompt describes a clean text-card design: a",
      "   simple textured or solid background (paper texture, soft gradient, brand color) with ONE short,",
      "   large, perfectly legible line of text overlaid per slide (a tip, a step, a fact) — this is the ONE",
      "   exception to the 'no text in images' rule above. Keep the text genuinely short (under ~8 words) so an",
      "   image model can render it legibly; describe the exact wording in the imagePrompt. The on-image text is",
      "   always in ENGLISH ONLY, regardless of market — the bilingual rule (EN caption first, then TR) still",
      "   applies to the caption field as always, this is just about the words rendered inside the image itself.",
      "   REALISM_DIRECTIVE below does not apply to informational slides (no need for candid framing/film grain",
      "   on a text card) — it applies only if you choose the narrative style.",
      "",
      INFORMATIONAL_CAROUSEL_TEMPLATES,
      "(Only relevant if you chose the INFORMATIONAL style above.)",
      "",
      REALISM_DIRECTIVE,
      "Apply this to EVERY slide's imagePrompt individually, not just the overall series — only if you chose",
      "the NARRATIVE style above.",
    ].join("\n");

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ...labelResponseProperties,
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
          required: [...labelRequired, "slides"],
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
    "",
    REALISM_DIRECTIVE,
    "For video specifically: describe natural, slightly imperfect human motion (weight shifting, a real",
    "exhale, hair moving with the body) rather than smooth/floating motion, which is what reads as synthetic.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ...labelResponseProperties,
          videoPrompt: { type: Type.STRING },
        },
        required: [...labelRequired, "videoPrompt"],
      },
    },
  });

  const parsed = reelSchema.parse(JSON.parse(response.text ?? "{}"));
  logger.info("caption generated", { format: "reel", category: slot.category.id, market: slot.market });
  return { format: "reel", ...parsed };
}

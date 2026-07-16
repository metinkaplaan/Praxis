import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { logger } from "./logger.js";
import { HOOK_CATEGORIES, type PostFormat } from "./types.js";

export type KnowledgeDoc =
  | "algorithm"
  | "video-standards"
  | "hooks"
  | "psychology"
  | "reel-structure"
  | "cta-bank";

function docPath(doc: KnowledgeDoc): string {
  return fileURLToPath(new URL(`../../knowledge/instagram/${doc}.md`, import.meta.url));
}

/**
 * Returns the body of an H2 section ("## <heading>" up to the next "## ").
 * Follows the growth-notes.ts pattern: a missing file or section returns ""
 * and never takes the production cycle down.
 */
export async function loadSection(doc: KnowledgeDoc, heading: string): Promise<string> {
  let raw: string;
  try {
    raw = await readFile(docPath(doc), "utf8");
  } catch {
    return "";
  }
  const sections = raw.split(/^## /m).slice(1); // drop preamble before first H2
  for (const section of sections) {
    const newline = section.indexOf("\n");
    const title = (newline === -1 ? section : section.slice(0, newline)).trim();
    if (title === heading || title.startsWith(`${heading} `)) {
      return (newline === -1 ? "" : section.slice(newline + 1))
        .split("\n")
        .filter((line) => !line.trim().startsWith("<!--"))
        .join("\n")
        .trim();
    }
  }
  return "";
}

export async function loadCheatSheet(doc: KnowledgeDoc): Promise<string> {
  return loadSection(doc, "Cheat Sheet");
}

/**
 * Samples `perCategory` random bullet lines from every hook category in
 * hooks.md. Randomness is deliberate: it keeps variety in generation instead
 * of anchoring Gemini to the same few examples every cycle. H2 ids that don't
 * match HOOK_CATEGORIES are warned about — that's the file<->code sync guard.
 */
export async function sampleHooks(perCategory = 2): Promise<string> {
  let raw: string;
  try {
    raw = await readFile(docPath("hooks"), "utf8");
  } catch {
    return "";
  }

  const sections = raw.split(/^## /m).slice(1);
  const byId = new Map<string, string[]>();
  for (const section of sections) {
    const newline = section.indexOf("\n");
    const title = (newline === -1 ? section : section.slice(0, newline)).trim();
    if (title === "Cheat Sheet") continue;
    const id = title.split("—")[0]!.trim();
    if (!(HOOK_CATEGORIES as readonly string[]).includes(id)) {
      logger.warn("hooks.md section id does not match HOOK_CATEGORIES", { id });
      continue;
    }
    const bullets = (newline === -1 ? "" : section.slice(newline + 1))
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "));
    byId.set(id, bullets);
  }

  const lines: string[] = [];
  for (const category of HOOK_CATEGORIES) {
    const bullets = byId.get(category);
    if (!bullets || bullets.length === 0) continue;
    const shuffled = [...bullets].sort(() => Math.random() - 0.5);
    for (const bullet of shuffled.slice(0, perCategory)) {
      lines.push(`- [${category}] ${bullet.slice(2)}`);
    }
  }
  return lines.join("\n");
}

const FORMAT_DOCS: Record<PostFormat, KnowledgeDoc[]> = {
  reel: ["algorithm", "reel-structure", "cta-bank"],
  carousel: ["algorithm", "psychology", "cta-bank"],
  single: ["algorithm", "cta-bank"], // legacy — no longer produced, kept for type completeness
};

/**
 * Composes the per-format knowledge block injected into caption generation.
 * Budget: cheat sheets are capped at ~150 words each and hooks are sampled,
 * so the whole block stays around 700-900 words. video-standards is
 * deliberately excluded — that's Veo config's job, not the text model's.
 */
export async function buildKnowledgeBlock(format: PostFormat): Promise<string> {
  const parts: string[] = [];
  for (const doc of FORMAT_DOCS[format]) {
    const sheet = await loadCheatSheet(doc);
    if (sheet) parts.push(`[${doc}]\n${sheet}`);
  }
  const hooks = await sampleHooks(2);
  if (hooks) {
    parts.push(`[hook examples — pick ONE psychological angle that fits the theme]\n${hooks}`);
  }
  return parts.join("\n\n");
}

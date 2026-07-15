import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const NOTES_PATH = fileURLToPath(new URL("../../knowledge/growth-notes.md", import.meta.url));

/**
 * Reads the operator's manually-curated growth notes (see knowledge/growth-notes.md)
 * and returns the last `maxItems` bullet points as plain text, for injection into
 * the caption-generation prompt. This is the ONLY channel through which external
 * knowledge reaches content generation — Praxis does not scrape or follow other
 * accounts (Instagram's official API doesn't support that, and doing it
 * unofficially risks the account being banned).
 */
export async function loadGrowthNotes(maxItems = 10): Promise<string> {
  try {
    const raw = await readFile(NOTES_PATH, "utf8");
    const bullets = raw
      .split("\n")
      .filter((line) => line.trim().startsWith("- "))
      .slice(-maxItems);
    return bullets.join("\n");
  } catch {
    return "";
  }
}

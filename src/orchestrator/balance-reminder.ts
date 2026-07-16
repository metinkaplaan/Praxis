import { logger } from "../lib/logger.js";
import { sendMessage } from "../notify/telegram.js";

/**
 * Operator explicitly declined Gemini API auto-reload (wants manual control
 * over top-ups) — this is the safety net instead: a periodic Telegram nudge
 * so the prepaid balance never runs out silently again.
 */
async function main(): Promise<void> {
  await sendMessage(
    [
      "💰 <b>Gemini bakiyeni kontrol etme zamanı</b>",
      "",
      "Sabit plan (günde 3 reel + 2 carousel) ~$3.92/gün (~$117.60/ay) harcıyor.",
      "AI Studio'daki bakiyeni kontrol et: https://aistudio.google.com",
    ].join("\n"),
  );
  logger.info("balance reminder sent");
}

main().catch((error) => {
  logger.error("balance reminder failed", { error: String(error) });
  process.exitCode = 1;
});

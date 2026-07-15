import { IG_HANDLES } from "../brands/midnight/brand.js";
import { requireEnv } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import type { Draft } from "../lib/types.js";

async function callTelegram(method: string, payload: Record<string, unknown>): Promise<void> {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Telegram ${method} failed: ${res.status} ${await res.text()}`);
  }
}

export async function sendMessage(text: string): Promise<void> {
  await callTelegram("sendMessage", {
    chat_id: requireEnv("TELEGRAM_CHAT_ID"),
    text,
    parse_mode: "HTML",
  });
}

/**
 * Sends the draft preview: image + EN/TR captions + approve/reject buttons.
 * Button presses arrive at web/app/api/telegram/webhook, which converts them
 * into a repository_dispatch that triggers publish-approved.yml.
 */
export async function sendDraftPreview(draft: Draft): Promise<void> {
  const caption = [
    `<b>Midnight draft — @${IG_HANDLES[draft.account]}</b>`,
    `Kategori: ${draft.category} · Yoğunluk: ${draft.intensity} · Pazar: ${draft.market}`,
    "",
    `🇬🇧 ${draft.caption.en}`,
    "",
    `🇹🇷 ${draft.caption.tr}`,
    "",
    draft.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  ].join("\n");

  await callTelegram("sendPhoto", {
    chat_id: requireEnv("TELEGRAM_CHAT_ID"),
    photo: draft.imageUrl,
    caption,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Onayla / Approve", callback_data: `approve:${draft.id}` },
          { text: "❌ Reddet / Reject", callback_data: `reject:${draft.id}` },
        ],
      ],
    },
  });
  logger.info("draft preview sent to Telegram", { id: draft.id });
}

export async function notifyPublished(draft: Draft, permalink?: string): Promise<void> {
  await sendMessage(
    `✅ Yayınlandı / Published: @${IG_HANDLES[draft.account]} — ${draft.category}\n${permalink ?? ""}`.trim(),
  );
}

export async function notifyFailure(context: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  // Token/permission failures are called out loudly — a silently expired
  // token would break every future publish until someone notices.
  const isAuthIssue = /token|oauth|permission|expired/i.test(message);
  await sendMessage(
    `${isAuthIssue ? "🚨 YETKİ/TOKEN HATASI" : "⚠️ Hata"} — ${context}\n<code>${message.slice(0, 500)}</code>`,
  );
}

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

function buildPreviewText(draft: Draft): string {
  return [
    `<b>Midnight draft — @${IG_HANDLES[draft.account]} (${draft.format})</b>`,
    `Kategori: ${draft.category} · Yoğunluk: ${draft.intensity} · Pazar: ${draft.market}`,
    ...(draft.evergreenNote ? [draft.evergreenNote] : []),
    "",
    `🇬🇧 ${draft.caption.en}`,
    "",
    `🇹🇷 ${draft.caption.tr}`,
    "",
    draft.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "),
  ].join("\n");
}

/**
 * `callback_data` scheme (`approve:<uuid>` / `reject:<uuid>`) is shared across
 * every format on purpose — web/app/api/telegram/webhook/route.ts parses it
 * the same way regardless of what kind of draft it points to.
 */
function approveRejectKeyboard(draftId: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Onayla / Approve", callback_data: `approve:${draftId}` },
        { text: "❌ Reddet / Reject", callback_data: `reject:${draftId}` },
      ],
    ],
  };
}

/**
 * Sends the draft preview (photo, album, or video) with EN/TR captions and
 * approve/reject buttons. Media captions (sendPhoto/sendVideo/sendMediaGroup)
 * are capped by Telegram at 1024 chars — our growth-aware captions (hook +
 * CTA + hashtags) routinely exceed that. So media always goes out WITHOUT a
 * caption, followed by a separate sendMessage (4096-char limit) carrying the
 * full text and the buttons. sendMediaGroup never supported inline keyboards
 * anyway, so this also makes all three formats behave the same way.
 */
export async function sendDraftPreview(draft: Draft): Promise<void> {
  const chatId = requireEnv("TELEGRAM_CHAT_ID");
  const caption = buildPreviewText(draft);

  if (draft.format === "single") {
    await callTelegram("sendPhoto", { chat_id: chatId, photo: draft.imageUrl });
  } else if (draft.format === "carousel") {
    await callTelegram("sendMediaGroup", {
      chat_id: chatId,
      media: draft.imageUrls.map((url) => ({ type: "photo", media: url })),
    });
  } else {
    await callTelegram("sendVideo", { chat_id: chatId, video: draft.videoUrl });
  }

  // Telegram's sendMessage text limit is 4096 chars — truncate defensively
  // rather than let an unusually long caption take down the whole cycle.
  const text = caption.length > 4096 ? `${caption.slice(0, 4090)}\n[…]` : caption;
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: approveRejectKeyboard(draft.id),
  });
  logger.info("draft preview sent to Telegram", { id: draft.id, format: draft.format });
}

export async function notifyPublished(draft: Draft, permalink?: string): Promise<void> {
  await sendMessage(
    `✅ Yayınlandı / Published: @${IG_HANDLES[draft.account]} — ${draft.category} (${draft.format})\n${permalink ?? ""}`.trim(),
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

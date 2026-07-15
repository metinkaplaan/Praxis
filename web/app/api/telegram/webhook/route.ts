import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TelegramUpdate {
  callback_query?: {
    id: string;
    data?: string;
  };
}

/**
 * Receives Telegram button presses ("approve:<draftId>" / "reject:<draftId>")
 * and converts them into a repository_dispatch that triggers
 * publish-approved.yml. Protected by Telegram's secret-token header, set
 * when registering the webhook via setWebhook(secret_token=...).
 */
export async function POST(req: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-telegram-bot-api-secret-token") !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;
  const cb = update.callback_query;
  // Non-button updates (plain messages etc.) are acknowledged and ignored.
  if (!cb?.data) return NextResponse.json({ ok: true });

  const match = /^(approve|reject):([0-9a-f-]{36})$/.exec(cb.data);
  if (!match) {
    await answerCallback(cb.id, "Tanınmayan komut / unknown action");
    return NextResponse.json({ ok: true });
  }
  const [, action, draftId] = match;

  const ghRes = await fetch(
    `https://api.github.com/repos/${process.env.GH_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GH_PAT_DISPATCH}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        event_type: "publish-draft",
        client_payload: { draft_id: draftId, action },
      }),
    },
  );

  await answerCallback(
    cb.id,
    ghRes.ok
      ? action === "approve"
        ? "✅ Yayın kuyruğa alındı / queued for publishing"
        : "🗑 Reddedildi / rejected"
      : "⚠️ GitHub tetiklenemedi / dispatch failed",
  );
  return NextResponse.json({ ok: true });
}

async function answerCallback(callbackQueryId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  }).catch(() => {});
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * One-time bootstrap endpoint for the Meta OAuth flow ("Instagram API with
 * Instagram Login"). Meta redirects here with ?code=; we exchange it for a
 * short-lived token, then for a 60-day long-lived token, and show it ONCE
 * so it can be copied into GitHub Actions Secrets (IG_TOKEN_*).
 * Daily refresh afterwards happens in GitHub Actions, not here.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error_description");
  if (error) return page(`<h2>Meta returned an error</h2><p>${escapeHtml(error)}</p>`, 400);
  if (!code) return page("<h2>Missing ?code parameter</h2>", 400);

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    return page("<h2>Server not configured (META_APP_ID / META_APP_SECRET)</h2>", 500);
  }
  const redirectUri = `${req.nextUrl.origin}/api/auth/instagram/callback`;

  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const short = (await shortRes.json()) as { access_token?: string; user_id?: string };
  if (!shortRes.ok || !short.access_token) {
    return page(
      `<h2>Short-lived token exchange failed</h2><pre>${escapeHtml(JSON.stringify(short))}</pre>`,
      502,
    );
  }

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", appSecret);
  longUrl.searchParams.set("access_token", short.access_token);
  const longRes = await fetch(longUrl);
  const long = (await longRes.json()) as { access_token?: string; expires_in?: number };
  if (!longRes.ok || !long.access_token) {
    return page(
      `<h2>Long-lived token exchange failed</h2><pre>${escapeHtml(JSON.stringify(long))}</pre>`,
      502,
    );
  }

  const days = Math.floor((long.expires_in ?? 0) / 86400);
  return page(`
    <h2>✅ Long-lived token ready (expires in ~${days} days)</h2>
    <p>Copy these into GitHub → Settings → Secrets and variables → Actions, then close this tab.
       Bu değerleri GitHub Actions Secrets'a kaydedip bu sekmeyi kapat — token bir daha gösterilmez.</p>
    <p><b>IG_USER_ID_*</b></p><pre>${escapeHtml(String(short.user_id ?? ""))}</pre>
    <p><b>IG_TOKEN_*</b></p><pre style="white-space:break-spaces">${escapeHtml(long.access_token)}</pre>
  `);
}

function page(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;background:#000;color:#eee;max-width:720px;margin:40px auto;padding:0 16px">${body}</body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

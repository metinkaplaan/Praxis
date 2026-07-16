# Praxis

Content automation for the **Midnight** brand: AI content generation (Gemini), Instagram publishing (Meta Graph API), Telegram notifications, and a 2-hour autonomous production cycle — all running on free infrastructure (GitHub Actions + Vercel + Cloudflare R2), no purchased domain and no always-on server required.

**Türkçe:** Midnight markası için içerik otomasyonu: yapay zekâ ile içerik üretimi (Gemini), Instagram yayınlama (Meta Graph API), Telegram bildirimleri ve 2 saatlik otonom üretim döngüsü — tamamı ücretsiz altyapıda (GitHub Actions + Vercel + Cloudflare R2), satın alınmış domain ve sürekli açık sunucu gerektirmeden.

## Architecture / Mimari

```
GitHub Actions (cron, every 2h)          Vercel (praxis web/, serverless)
┌──────────────────────────────┐        ┌───────────────────────────────┐
│ content-cycle.yml            │        │ /api/auth/instagram/callback  │ ← Meta OAuth
│  generate captions (Gemini)  │        │ /api/telegram/webhook         │ ← approve buttons
│  generate image (Nano Banana)│        └──────────────┬────────────────┘
│  upload → Cloudflare R2      │                       │ repository_dispatch
│  notify → Telegram (preview) │        ┌──────────────▼────────────────┐
└──────────────────────────────┘        │ publish-approved.yml          │
                                        │  Graph API media + publish    │
┌──────────────────────────────┐        └───────────────────────────────┘
│ token-refresh.yml (daily)    │
│  refresh 60-day IG tokens    │
└──────────────────────────────┘
```

- **Why no server/tunnel:** the Instagram Content Publishing API is a server-to-server REST flow. Nothing needs to listen 24/7; the only public HTTPS endpoints needed (OAuth callback, Telegram webhook) are event-driven and live on Vercel's free `*.vercel.app` subdomain.
- **Media hosting:** the Graph API requires a public `image_url` — media is uploaded to Cloudflare R2 first.
- **Bilingual rule:** every English copy is generated together with its Turkish translation, enforced at the type level (`BilingualCopy` — `tr` is not optional).

## Layout

| Path | Purpose |
|---|---|
| `src/brands/midnight/` | Brand constants, 6 categories × 3 intensities, content calendar rotation |
| `src/generation/` | Captions (Gemini structured output) and images (Nano Banana) |
| `src/publishing/instagram.ts` | Graph API: create media container → publish |
| `src/storage/` | Cloudflare R2 uploads, draft manifests |
| `src/notify/telegram.ts` | Notifications + approval previews |
| `src/auth/instagram-token.ts` | Long-lived token refresh + GitHub secret rotation |
| `src/orchestrator/` | Entrypoints wired to the workflows |
| `web/` | Minimal Next.js app deployed as a **separate** Vercel project |
| `.github/workflows/` | The scheduler — see diagram above |

## Setup

1. Copy `.env.example` → `.env` for local runs (never commit it). In CI everything comes from **GitHub Actions Secrets**.
2. Complete the external setup checklist in [`docs/SETUP.md`](docs/SETUP.md) (Meta App, Telegram bot, R2 bucket, Vercel project).
3. `npm install && npm run typecheck`
4. Trigger a dry run: Actions → *content-cycle* → *Run workflow*.

## Security

No secret is ever committed. `.gitignore` blocks `.env*` from the first commit; enable **Secret Scanning + Push Protection** in the repo settings. The `GH_PAT_SECRETS_WRITE` token must be fine-grained, scoped to this repo only, with only *Secrets: Read and write*.

## Costs

Reels (Veo) are ~20x more expensive than carousels. See [`docs/COSTS.md`](docs/COSTS.md) for the full per-unit/per-post/monthly breakdown and cost-reduction levers.

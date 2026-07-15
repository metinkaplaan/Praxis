# Praxis — Agent Instructions

- **Bilingual rule (hard requirement):** any user-facing English copy produced anywhere in this codebase (captions, Reddit posts, store descriptions, subtitles) must always carry a Turkish translation. Use `BilingualCopy` from `src/lib/types.ts` — never a bare English string.
- **Secrets:** never write credentials into tracked files. Local dev uses `.env` (gitignored); CI uses GitHub Actions Secrets. If you spot a hardcoded secret, flag it immediately.
- **Scope discipline:** MVP is Midnight brand + Instagram only. `reddit.ts` / `tiktok.ts` / other brands are placeholders for later phases — don't flesh them out unless asked.
- **Runtime:** Node 22+, ESM (`"type": "module"`), TypeScript strict. Scripts run via `tsx`, there is no build step for `src/`.
- **`web/` is a separate Vercel project** (Next.js). It deliberately does NOT share code with `src/` — keep it minimal, it only handles the Meta OAuth callback and the Telegram webhook.
- **No scraping / following other accounts, ever.** Instagram's official Graph API doesn't support reading other accounts' content or automated following — doing it unofficially risks the account being banned. The two legitimate inspiration channels are `knowledge/growth-notes.md` (operator-curated, edited by hand or by Claude on request) and the performance ledger (`src/analytics/`, own-account Insights data).
- **`Draft`/`GeneratedPost` are discriminated unions on `format`** (`single` | `carousel` | `reel`) — when adding a new format, update the union in `src/lib/types.ts` first, then let `tsc`'s exhaustiveness checks in `publishing/instagram.ts` and `notify/telegram.ts` guide you to every switch that needs a new case.
- Typecheck with `npm run typecheck` before committing.

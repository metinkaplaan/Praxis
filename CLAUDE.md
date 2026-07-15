# Praxis — Agent Instructions

- **Bilingual rule (hard requirement):** any user-facing English copy produced anywhere in this codebase (captions, Reddit posts, store descriptions, subtitles) must always carry a Turkish translation. Use `BilingualCopy` from `src/lib/types.ts` — never a bare English string.
- **Secrets:** never write credentials into tracked files. Local dev uses `.env` (gitignored); CI uses GitHub Actions Secrets. If you spot a hardcoded secret, flag it immediately.
- **Scope discipline:** MVP is Midnight brand + Instagram only. `reddit.ts` / `tiktok.ts` / other brands are placeholders for later phases — don't flesh them out unless asked.
- **Runtime:** Node 22+, ESM (`"type": "module"`), TypeScript strict. Scripts run via `tsx`, there is no build step for `src/`.
- **`web/` is a separate Vercel project** (Next.js). It deliberately does NOT share code with `src/` — keep it minimal, it only handles the Meta OAuth callback and the Telegram webhook.
- Typecheck with `npm run typecheck` before committing.

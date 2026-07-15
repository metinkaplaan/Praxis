# Kurulum Checklist / Setup Checklist

Bu adımlar senin hesaplarında yapılır, kod tarafı hazır. Sırayla ilerle; her bölümün sonunda hangi secret'ın nereye gireceği yazıyor.

> **Güvenlik:** Token/şifre değerlerini asla dosyaya, nota veya sohbete yapıştırma. Tek istisna: GitHub → Settings → Secrets and variables → Actions ve Vercel → Project Settings → Environment Variables.

## 1. Vercel — `web/` projesini deploy et

1. vercel.com → Add New Project → bu repoyu (`Praxis`) seç
2. **Root Directory**: `web` olarak ayarla (önemli — repo kökü değil)
3. Deploy et; sana `https://<proje-adı>.vercel.app` gibi bir URL verecek → bunu not al, aşağıda "WEB_URL" olarak geçiyor
4. Vercel → Project → Settings → Environment Variables'a şunları ekle (değerleri sonraki adımlarda alacaksın):
   - `META_APP_ID`, `META_APP_SECRET` (adım 2'den)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` (adım 4'ten)
   - `GH_PAT_DISPATCH`, `GH_REPO=metinkaplaan/Praxis` (adım 5'ten)

## 2. Meta App — Instagram API

1. `@joinmidnight` Instagram hesabını **Professional (Business veya Creator)** hesaba çevir (Instagram ayarları → Hesap türü)
2. developers.facebook.com → Create App → use case olarak **"Instagram API with Instagram Login"** seç (Facebook Page bağlamak GEREKMEZ)
3. App ayarlarında:
   - Privacy Policy URL: midnight-privacy sayfanın canlı URL'i
   - **Valid OAuth Redirect URIs**: `WEB_URL/api/auth/instagram/callback`
4. App Roles → Instagram Testers → `@joinmidnight` hesabını ekle ve Instagram tarafından daveti kabul et (App Review'a gerek yok, Development Mode yeterli)
5. App ID ve App Secret'ı → Vercel env'e (`META_APP_ID`, `META_APP_SECRET`)

## 3. Instagram token'ı al (tek seferlik)

1. Tarayıcıda şu URL'i aç (APP_ID ve WEB_URL'i doldur):
   ```
   https://www.instagram.com/oauth/authorize?client_id=APP_ID&redirect_uri=WEB_URL/api/auth/instagram/callback&scope=instagram_business_basic,instagram_business_content_publish&response_type=code
   ```
2. `@joinmidnight` ile giriş yap, izin ver → callback sayfası sana **IG_USER_ID** ve **60 günlük token** gösterecek
3. Bunları GitHub → Praxis repo → Settings → Secrets and variables → Actions'a kaydet:
   - `IG_USER_ID_JOINMIDNIGHT`
   - `IG_TOKEN_JOINMIDNIGHT`

## 4. Telegram bot

1. Telegram'da @BotFather → `/newbot` → token'ı al → GitHub Secrets'a `TELEGRAM_BOT_TOKEN` VE Vercel env'e aynı isimle ekle
2. Botunla bir sohbet başlat, sonra `https://api.telegram.org/bot<TOKEN>/getUpdates` adresinden `chat.id` değerini bul → GitHub Secrets'a `TELEGRAM_CHAT_ID`
3. Rastgele uzun bir string üret (webhook doğrulaması için) → Vercel env'e `TELEGRAM_WEBHOOK_SECRET`
4. Webhook'u bağla (tarayıcıdan tek sefer):
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=WEB_URL/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
   ```

## 5. GitHub PAT'ler (fine-grained)

GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token. **Yalnızca `Praxis` reposunu seç.**

- `GH_PAT_SECRETS_WRITE`: izin = Secrets: **Read and write** → GitHub Actions Secrets'a ekle (token-refresh workflow'u IG token'ını döndürmek için kullanır)
- `GH_PAT_DISPATCH`: izin = Contents: **Read and write** → Vercel env'e ekle (Telegram onay butonu repository_dispatch tetiklemek için kullanır)

## 6. Cloudflare R2

1. dash.cloudflare.com → R2 → Create bucket → adı: `praxis-media`
2. Bucket → Settings → **Public access → r2.dev subdomain'i etkinleştir** → verilen `https://pub-....r2.dev` URL'ini not al
3. R2 → Manage R2 API Tokens → Create API Token (Object Read & Write, sadece bu bucket)
4. GitHub Actions Secrets'a ekle: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=praxis-media`, `R2_PUBLIC_BASE_URL=https://pub-....r2.dev`

## 7. Gemini API

- aistudio.google.com → API key al → GitHub Actions Secrets'a `GEMINI_API_KEY`

## 8. İlk test

1. Repo → Actions → **content-cycle** → Run workflow (manuel tetik)
2. Telegram'a görsel + EN/TR caption + Onayla/Reddet butonlu bir önizleme düşmeli
3. "Onayla"ya bas → **publish-approved** workflow'u tetiklenmeli → `@joinmidnight` hesabında gönderi yayınlanmalı
4. Repo → Settings → Security → **Secret scanning + Push protection**'ı aç

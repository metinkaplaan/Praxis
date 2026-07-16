# Maliyet Tablosu / Cost Reference

> Fiyatlar Temmuz 2026 itibarıyla resmi Gemini API fiyatlandırma sayfasından
> alınmıştır (bkz. Kaynaklar). GitHub Actions/R2/Vercel/Telegram/Meta
> ücretsizdir — tek gerçek maliyet kalemi Gemini API (metin+görsel+Veo).

## Birim Maliyetler

| Kalem | Model | Fiyat | Not |
|---|---|---|---|
| Caption/metin üretimi | `gemini-2.5-flash` | $0.30 / 1M girdi token, $2.50 / 1M çıktı token | Tek üretim ~1-1.5K token (knowledge+growth-notes dahil) → **~$0.001-0.003** |
| Görsel üretimi | `gemini-2.5-flash-image` | $30 / 1M çıktı token (~1290 token/görsel, ≤1024px) | **~$0.039/görsel** |
| Video üretimi | `veo-3.1-fast-generate-preview` (mevcut config) | **$0.15 / saniye** (ses dahil) | Bizim ayarımız 8sn → **~$1.20/video** — sistemin ezici çoğunluk maliyeti hâlâ burada, ama Standard'a (`veo-3.1-generate-preview`, $0.40/sn) göre ~%63 daha düşük |

## Gönderi Başına Maliyet

| Format | İçerik | Tahmini maliyet |
|---|---|---|
| Carousel (3-5 slayt, ort. 4) | 1 caption + 4 görsel | **~$0.16** |
| Reel (8sn, `VEO_DURATION_SEC=8`) | 1 caption + 1 video | **~$1.20** |

**Reel, carousel'den ~7.5 kat daha pahalı** (Veo Fast'e geçmeden önce ~20 kattı).

## ✅ Düzeltildi: Cold-start artık %60/%40, saf %50/%50 değil

`format-selector.ts`'teki `DEFAULT_WEIGHTS` (carousel %60 / reel %40) daha
önce ledger tamamen **boşken** hiç uygulanmıyordu — `hasAnyData` `false`
olduğunda kod doğrudan "keşif" dalına düşüp carousel/reel arasında saf
%50/%50 rastgele seçiyordu (maliyet farkını hesaba katmadan). Bu, kredi
tükenmesinin doğrudan sebebiydi. Artık `chooseFormat`, ledger'da hiç veri
yokken doğrudan `weightedPick(DEFAULT_WEIGHTS)` çağırıyor — 2000 seçimlik
istatistiksel testte %60.4/%39.6 çıktı (beklenen dağılıma uygun). Ledger'da
veri birikmeye başladıktan sonra epsilon-greedy öğrenme mantığı (mevcut
davranış, değişmedi) devreye girecek.

## ✅ Sabit Günlük Plan (2026-07-16 itibarıyla): rotasyon değil, 5 gönderi/gün

Döngü artık N saatte bir dönen bir rotasyon değil — **sabit bir günlük plan**:
her gün 5 gönderi, **3 reel + 2 carousel**, `content-cycle.yml`'de 5 ayrı cron
zamanına bağlanmış (her biri `github.event.schedule` ile eşleştirilip
`FORCE_FORMAT` olarak enjekte ediliyor — format-selector.ts'in epsilon-greedy
mantığı artık sadece manuel `workflow_dispatch` çalıştırmalarında devreye
giriyor). Zamanlar (UTC / TR):

| Saat (UTC) | Saat (TR) | Format |
|---|---|---|
| 08:00 | 11:00 | Reel |
| 11:00 | 14:00 | Carousel |
| 14:30 | 17:30 | Reel |
| 18:00 | 21:00 | Carousel |
| 21:30 | 00:30 | Reel |

## Aylık Projeksiyon (sabit plan: günde 3 reel + 2 carousel)

| Kalem | Adet/gün | Birim maliyet | Günlük |
|---|---|---|---|
| Reel | 3 | $1.20 | $3.60 |
| Carousel | 2 | $0.16 | $0.32 |
| **Toplam** | **5** | — | **$3.92/gün** |

**Aylık (30 gün): ~$117.60**

Karşılaştırma: Veo Fast'e geçmeden önceki 12-gönderi/gün rotasyonu (%40 reel)
~$495/ay'a mal oluyordu — sabit 5-gönderi/gün plan + Veo Fast birlikte aylık
maliyeti **~%76 düşürdü**.

## Maliyeti Daha Da Düşürme Seçenekleri

1. ✅ **Uygulandı — `veo-3.1-fast-generate-preview`'a geçildi** — $0.15/sn
   ($0.40 yerine), reel maliyetini $3.20'den **$1.20**'ye indirdi (~%63
   tasarruf, kalite biraz düşer).
2. ✅ **Uygulandı — sabit günlük plan** — rotasyondaki günde 12 üretim yerine
   günde 5 sabit gönderi (3 reel + 2 carousel), aylık maliyeti öngörülebilir
   kıldı ve düşürdü.
3. Reel/carousel oranı daha da düşürülmek istenirse (ör. 2 reel + 3 carousel),
   `content-cycle.yml`'deki 5 cron satırının format eşlemesi değiştirilir —
   kod değişikliği gerekmez.

## Ücretsiz Altyapı (mevcut ölçekte $0)

| Servis | Ücretsiz kota | Kullanımımız |
|---|---|---|
| GitHub Actions (private repo) | 2000 dk/ay | content-cycle+publish-approved+token-refresh+collect-insights, ayda ~900 dk |
| Cloudflare R2 | 10GB depolama, egress her zaman ücretsiz | Birkaç yüz MB (medya+drafts+analytics) |
| Vercel (`web/`, Hobby plan) | Bol miktarda | Minimal trafik (sadece OAuth callback + Telegram webhook) |
| Telegram Bot API | Tamamen ücretsiz | — |
| Meta Graph API (Instagram) | Tamamen ücretsiz | — |

## Kaynaklar

- Gemini API fiyatlandırma: [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing) (Temmuz 2026)
- Veo 3.1 fiyatlandırma: [ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview](https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview) (Temmuz 2026)

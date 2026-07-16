# Maliyet Tablosu / Cost Reference

> Fiyatlar Temmuz 2026 itibarıyla resmi Gemini API fiyatlandırma sayfasından
> alınmıştır (bkz. Kaynaklar). GitHub Actions/R2/Vercel/Telegram/Meta
> ücretsizdir — tek gerçek maliyet kalemi Gemini API (metin+görsel+Veo).

## Birim Maliyetler

| Kalem | Model | Fiyat | Not |
|---|---|---|---|
| Caption/metin üretimi | `gemini-2.5-flash` | $0.30 / 1M girdi token, $2.50 / 1M çıktı token | Tek üretim ~1-1.5K token (knowledge+growth-notes dahil) → **~$0.001-0.003** |
| Görsel üretimi | `gemini-2.5-flash-image` | $30 / 1M çıktı token (~1290 token/görsel, ≤1024px) | **~$0.039/görsel** |
| Video üretimi | `veo-3.1-generate-preview` (mevcut config) | **$0.40 / saniye** (ses dahil) | Bizim ayarımız 8sn → **~$3.20/video** — sistemin ezici çoğunluk maliyeti burada |

## Gönderi Başına Maliyet

| Format | İçerik | Tahmini maliyet |
|---|---|---|
| Carousel (3-5 slayt, ort. 4) | 1 caption + 4 görsel | **~$0.16** |
| Reel (8sn, `VEO_DURATION_SEC=8`) | 1 caption + 1 video | **~$3.21** |

**Reel, carousel'den ~20 kat daha pahalı.**

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

## Aylık Projeksiyon (2 saatlik döngü = günde 12 üretim)

| Senaryo | Reel oranı | Gönderi başına ort. maliyet | Günlük | Aylık |
|---|---|---|---|---|
| **Şu anki davranış (düzeltme sonrası, cold-start)** | %40 | $1.376 | $16.51 | **~$495** |
| Reel %15'e düşürülürse | %15 | $0.617 | $7.40 | ~$222 |
| Sadece carousel (reel geçici kapalı) | %0 | $0.16 | $1.92 | ~$58 |

## Maliyeti Daha Da Düşürme Seçenekleri (öncelik sırasıyla)

1. **`veo-3.1-fast-generate-preview`'a geç** — $0.15/sn ($0.40 yerine),
   reel maliyetini $3.20'den **$1.20**'ye indirir (~%63 tasarruf, kalite
   biraz düşer).
2. **Döngü sıklığını seyrelt** — 2 saatten 4-6 saate çıkarmak günlük gönderi
   sayısını 12'den 4-6'ya indirir, maliyeti orantılı düşürür.
3. **Reel ağırlığını manuel düşür** — `DEFAULT_WEIGHTS`'i `carousel: 0.85,
   reel: 0.15` yap (artık cold-start'ta da gerçekten uygulanıyor).

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

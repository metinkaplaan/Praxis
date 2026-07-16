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

## ⚠️ Bulgu: Format dağılımı şu an %60/%40 değil, %50/%50 rastgele

`format-selector.ts`'teki `DEFAULT_WEIGHTS` (carousel %60 / reel %40) yalnızca
ledger'da *kısmi* veri olup hiçbir format `FORMAT_MIN_SAMPLES`'a ulaşmadığı dar
bir ara durumda devreye giriyor. Ledger tamamen **boşken** (şu anki durum —
henüz hiç insight toplanmadı), `hasAnyData` `false` olduğu için kod her zaman
"keşif" dalına düşüyor ve carousel/reel arasında **saf %50/%50** seçiyor —
maliyet farkını hesaba katmadan. Bu, kredi tükenmesinin doğrudan sebebi.

## Aylık Projeksiyon (2 saatlik döngü = günde 12 üretim)

| Senaryo | Reel oranı | Gönderi başına ort. maliyet | Günlük | Aylık |
|---|---|---|---|---|
| **Şu anki gerçek davranış** | %50 | $1.685 | $20.22 | **~$607** |
| Kodun "hedeflediği" oran (veri birikince) | %40 | $1.376 | $16.51 | ~$495 |
| Reel %15'e düşürülürse | %15 | $0.617 | $7.40 | ~$222 |
| Sadece carousel (reel geçici kapalı) | %0 | $0.16 | $1.92 | ~$58 |

## Maliyeti Düşürme Seçenekleri (öncelik sırasıyla)

1. **Cold-start önyargısını düzelt** — ledger boşken bile keşif havuzunu
   `DEFAULT_WEIGHTS`'e göre ağırlıklandır (saf uniform değil). Tek satırlık
   bir düzeltme, hemen %50→%40 reel oranına iner.
2. **`veo-3.1-fast-generate-preview`'a geç** — $0.15/sn ($0.40 yerine),
   reel maliyetini $3.20'den **$1.20**'ye indirir (~%63 tasarruf, kalite
   biraz düşer).
3. **Döngü sıklığını seyrelt** — 2 saatten 4-6 saate çıkarmak günlük gönderi
   sayısını 12'den 4-6'ya indirir, maliyeti orantılı düşürür.
4. **Reel ağırlığını manuel düşür** — `DEFAULT_WEIGHTS`'i `carousel: 0.85,
   reel: 0.15` yap (madde 1 düzeltilene kadar geçici etkisi sınırlı, çünkü
   ledger boşken zaten uygulanmıyor).

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

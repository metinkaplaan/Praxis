# Reel Yapı Şablonu

> Kaynak: operatör-beslemeli. Güncelleme: Claude'a söyle, ilgili bölüme commit atar. Kod değişikliği gerekmez.

## Cheat Sheet

- Structure every reel as: HOOK (0-3s) → tension/problem → development → payoff → CTA. Never open with context or logos.
- The first 1-2 seconds must contain motion or an unexpected visual — describe them explicitly in the video prompt.
- One idea per reel. If it needs explaining, it's two reels.
- Short reels (7-15s) maximize completion rate — for Veo's ~8s clips, compress to HOOK → single beat of tension → payoff, and let the caption carry the CTA.
- End with a moment worth rewatching (loop-friendly last frame lifts rewatch rate).

## Tam Yapı (45-60sn içerik için referans)

| Zaman | Bölüm | Görev |
|---|---|---|
| 0-3sn | Hook | Scroll'u durdur — hareket, beklenmedik görüntü veya iddialı replik |
| 3-10sn | Problem | Gerilimi kur: izleyicinin tanıdığı sancı (rutin, sessiz akşamlar) |
| 10-25sn | Gelişme | Derinleştir, mikro ödüller ver, döngüyü besle ama kapatma |
| 25-45sn | Çözüm | Payoff — dönüşümü göster (oyun, soru, an) |
| 45-60sn | Sonuç | Duygusal kapanış — "bu his" karesi |
| Son | CTA | Tek, net eylem (caption'da da tekrar et) |

## Kısa Reel Uyarlaması (Veo ~8sn — PRAXIS'in mevcut çıktısı)

- 0-2sn: görsel hook (hareket + merak)
- 2-6sn: tek gerilim vuruşu (bakışma, duraksama, kartın çevrilmesi)
- 6-8sn: payoff karesi (gülümseme, yakınlaşma, ışık değişimi) — loop'a uygun bitiş
- CTA video içinde değil caption'dadır.

## Tempo ve Kurgu

- Kesme sıklığı dikkat sıfırlayıcıdır; tek-plan videolarda kamera hareketi/ışık değişimi aynı işi görür.
- Sessiz izleyici varsayımı: görüntü tek başına hikayeyi anlatmalı.

## Kapak / İlk Kare

- İlk kare grid'de kapak olur — tek başına anlamlı ve merak uyandırıcı olmalı (videoPrompt'ta ilk kareyi tarif et).

## Rakipte Görülen: Ürünü Ekranda Gösterme (şimdilik uygulanamaz)

> Kaynak: operatör-beslemeli rakip analizi, 2026-07-22 (`analysis-log.md`).

Doğrudan rakip `@scratch.moment.feels`, uygulamasının "scratch to reveal"
mekaniğini reel içinde telefon ekranında göstererek anlatıyor — ürünü
tarif etmek yerine kullanımda gösteriyor. Bu güçlü bir teknik ama **şu an
PRAXIS'in Veo pipeline'ıyla uygulanamaz**: video-üretim modelleri ekrandaki
metni/arayüzü güvenilir şekilde render edemiyor, "telefon ekranında
Midnight arayüzünü göster" talimatı büyük ihtimalle bozuk/okunaksız bir
görüntü üretir. Gerçek ekran kaydı (screen recording) mümkün hale gelirse
(ör. gerçek bir kullanıcı testi/operatör kaydı) bu format tekrar
değerlendirilmeli — o zamana kadar sadece arşiv notu.

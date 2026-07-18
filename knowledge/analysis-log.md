# Analiz Log'u — Operatör-Beslemeli Reel/Rakip/Trend Analizi

> Bu dosya HAM ARŞİVDİR — `src/lib/knowledge.ts` bunu okumaz, üretim prompt'una
> girmez. Her analizden çıkan **damıtılmış ders**, ilgili
> `knowledge/instagram/*.md` dosyasının Cheat Sheet'ine veya
> `knowledge/growth-notes.md`'ye ayrıca yazılır — oralar prompt'a giriyor.
>
> Kullanım: operatör bir reel linki / ekran görüntüsü / gözlem getirir →
> Claude aşağıdaki rubrikle analiz edip buraya yeni bir madde ekler → sonra
> çıkarımı doğru knowledge dosyasına işler.

## Rubrik

Her analiz şu formatta, en yeni en üstte eklenir:

```md
## [YYYY-MM-DD] <Kaynak türü: viral reel / rakip hesap / trend gözlemi> — <kısa başlık>

**Kaynak:** <link veya "ekran görüntüsü, kullanıcı tarafından paylaşıldı">

| Kriter | Puan (1-10) | Not |
|---|---|---|
| Hook (ilk 3sn) | | |
| Tempo | | |
| Kurgu | | |
| Altyazı | | |
| Görsel kalite | | |
| Ses kalitesi | | |
| CTA | | |
| Tahmini izlenme oranı | | |
| Tahmini viral potansiyel | | |

**Neden? (en önemli alan):** <bu içerik neden çalıştı/çalışmadı — somut, aktarılabilir gözlem>

**Midnight'a uyarlanan çıkarım:** <ne değişecek, hangi dosyaya işlendi>
```

## Kayıtlar

<!-- Yeni analizler buraya, en üstte, yukarıdaki formatla eklenir. -->

## [2026-07-17] Trend gözlemi — "Erişim mühendisliği" algoritma-prompt carousel'i

**Kaynak:** ekran görüntüleri, kullanıcı tarafından paylaşıldı (7 slaytlık Türkçe carousel'in 2-5. slaytları; sıfır takipçili hesaplar için "Instagram Algoritma Uzmanı" LLM prompt'u paketlenmiş)

| Kriter | Puan (1-10) | Not |
|---|---|---|
| Hook (ilk 3sn) | 7 | "Sıfır takipçiyle muazzam erişim" vaadi küçük hesap sahibinin tam ağrı noktası |
| Tempo | — | Reel değil, bilgi carousel'i |
| Kurgu | 8 | Slayt başına tek kavram, numaralı aşamalar — takip etmesi kolay |
| Altyazı | — | — |
| Görsel kalite | 6 | Sade kâğıt-doku arka plan, okunabilir tipografi; ayırt edici değil ama işlevsel |
| Ses kalitesi | — | — |
| CTA | — | Eldeki slaytlarda görünmüyor (muhtemelen 7. slaytta) |
| Tahmini izlenme oranı | 7 | Kaydetmelik "rehber" formatı — swipe-through yüksek olur |
| Tahmini viral potansiyel | 7 | Niş (içerik üreticileri) ama o nişte güçlü kaydetme/paylaşma tetikleyicisi |

**Neden? (en önemli alan):** "Rehber/playbook" carousel formatı, hedef kitlenin gerçek bir ağrı noktasına (sıfırdan büyüyememek) numaralı-adımlı, kaydedilebilir bir çözüm vaat ediyor. İçeriğin kendisi kısmen jenerik algoritma bilgisi olsa da *paketleme* (KURAL SIFIR, AŞAMA 2-5, KESİN KURALLAR gibi sert yapı + emir kipi) otorite hissi yaratıyor ve kaydetmeyi tetikliyor. Bizim için asıl değer: içerik değil, **soğuk kitle çerçevesi** — her şeyi "profili hiç görmemiş izleyici" varsayımıyla kurması.

**Midnight'a uyarlanan çıkarım:** İçeriğin tamamı absorbe edildi (operatör talimatı) → `algorithm.md`'ye yeni "Sıfırdan Büyüme — Erişim Mühendisliği" detay bölümü (ana hedef, test zinciri, dağıtım sinyalleri, retention yapısı, yabancılar için dil, attack sequence, kesin kurallar) + Cheat Sheet'e 2 satır (cold-start varsayımı + reel ritim/loop kuralı); `hooks.md` Cheat Sheet'e soğuk-izleyici hook kuralı; `growth-notes.md`'ye 2 operasyonel direktif. Üretim prompt'ları bir sonraki döngüden itibaren bunları otomatik alır.

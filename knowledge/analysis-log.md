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

Rakip hesap analizlerinde tabloya ek olarak şu boşluk soruları da cevaplanır
(kaynak: 2026-07-17 chatplace.tr analizi):

- Rakibin gözden kaçırdığı ama kitlenin istediği konular neler?
- Kullanmadığı içerik formatları neler?
- Kimsenin doldurmadığı niş konumlanması var mı?
- Bu boşluktan bu hafta paylaşılabilecek 1 somut gönderi fikri ne?

## Kayıtlar

<!-- Yeni analizler buraya, en üstte, yukarıdaki formatla eklenir. -->

## [2026-07-17] Trend gözlemi — chatplace.tr "AI prompt reçeteleri" carousel'i (9 slayt, 2-8 elimizde)

**Kaynak:** ekran görüntüleri, kullanıcı tarafından paylaşıldı (chatplace.tr hesabının carousel'i; her slayt, Instagram büyümesi için bir AI-prompt şablonu — hesap kendi AI servisini satıyor, CTA'sı yorum-kapılı "SERVİS yaz")

| Kriter | Puan (1-10) | Not |
|---|---|---|
| Hook (ilk 3sn) | 6 | "Niş viral hook üreticisi" başlığı niş ama net; el yazısı estetiği kalabalıkta ayrışıyor |
| Tempo | — | Bilgi carousel'i |
| Kurgu | 8 | Slayt başına tek reçete: başlık → "linki yapıştır ve şunu yaz" → madde listesi → çıktı formatı. Kopyala-yapıştır kullanılabilirlik = güçlü kaydetme tetikleyicisi (420 kaydetme / 103 beğeni — kaydetme beğeniyi 4'e katlamış, "rehber" formatının kanıtı) |
| Altyazı | — | — |
| Görsel kalite | 7 | El yazısı + kâğıt dokusu: samimi, "not defteri" hissi; AI-görünümlü değil |
| Ses kalitesi | — | — |
| CTA | 7 | Yorum-kapılı lead magnet ("SERVİS yaz → DM'den gönderelim") — yorum sayısını şişirir + DM ilişkisi başlatır; DM otomasyonu gerektirir (bizde bilinçli olarak yok) |
| Tahmini izlenme oranı | 7 | Swipe-through yüksek (numaralı reçeteler) |
| Tahmini viral potansiyel | 6 | Niş (içerik üreticileri/işletmeler) ama o nişte güçlü kaydetme |

**İçerik özeti (7 reçete):** (1) 5 hook formülü — kalıp kırıcı, somut rakam, karşı-sezgisel, kanıtlı sonuç, acıya doğrudan seslenme; (2) viral reel'i kendi hesabına uyarlama (neden tuttu → 3 senaryo + 5 hook + format uyumu); (3) rakip boşluk analizi — 10 rakipte kaçırılan konular, kullanılmayan formatlar, doldurulmamış konumlama, bu hafta 1 somut gönderi; (4) 30 günlük içerik planı — tarih|format|konu|hook|hedef tablosu + niş için sıklık/saat + 90 günde bir yeniden kullanılabilir 3 evergreen gönderi; (5) DM'lerden kitle analizi — en sık 5 soru, satın alma itirazları, segmentler, itirazları kapatan içerik konuları; (6) takipçi→müşteri sistemi — DM'i artıran 3 içerik türü, satış hissi vermeyen diyalog CTA'ları, doğal ilk mesaj, 5 adımlı ısınma zinciri; (7) kendi reel'inin zayıf nokta analizi (hook hatası, izleyicinin bırakma noktası, somut düzeltmeler) + influencer/blogger kitle denetimi (kitle örtüşmesi, sahte takipçi işaretleri, evet/hayır kararı).

**Neden? (en önemli alan):** Bu carousel'in asıl dersi içerikten çok **formatında**: kopyala-yapıştır kullanılabilir reçeteler + numaralı yapı + el yazısı estetiği, kaydetmeyi beğeninin 4 katına çıkarmış. İçerik tarafında ise reçetelerin çoğu PRAXIS'in zaten otomatik yaptığı şeyler (hook üretimi psikolojik kategorilerle → HOOK_CATEGORIES; viral reel uyarlama → analiz protokolü; 30 günlük plan → Dalga 4 yol haritası; kendi içerik performans analizi → insights döngüsü). Bu, sistemimizin satılan AI servisleriyle en az aynı kapsamda olduğunun doğrulaması.

**Midnight'a uyarlanan çıkarım:** (a) 5 hook formülünden 4'ü mevcut kategorilere Midnight-uyarlı örnek şablon olarak eklendi (`hooks.md`: reverse/numbers/authority/fear); (b) "satış hissi yaratmadan diyaloğa çeken CTA" ilkesi `cta-bank.md` Cheat Sheet'ine eklendi; (c) rakip boşluk analizi rubriği bu dosyanın Rubrik bölümüne "rakip analizi ek kriterleri" olarak eklendi (ileride operatör rakip hesap getirdiğinde kullanılacak); (d) 30 günlük plan spesifikasyonu (tablo formatı + evergreen kavramı) Anayasa'nın Dalga 4 maddesine işlendi; (e) DM analizi, ısınma zinciri ve influencer denetimi şimdilik sadece arşiv — DM otomasyonumuz bilinçli olarak yok, influencer işbirliği gündemde değil; gündeme gelirse rubrik burada hazır.

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

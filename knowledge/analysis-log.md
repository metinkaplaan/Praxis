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

## [2026-07-22] Rakip hesap — @scratch.moment.feels (doğrudan rakip app)

**Kaynak:** ekran görüntüleri, kullanıcı tarafından paylaşıldı (bir reel'in kare kare akışı — gerçek kullanıcı (UGC) telefonunda "scratch to reveal a love challenge" mekaniğini kullanırken çekilmiş)

| Kriter | Puan (1-10) | Not |
|---|---|---|
| Hook (ilk 3sn) | 7 | Birinci şahıs sonuç-anlatımı: "My boyfriend pulled me closer after this 😈" — özellik değil, SONUÇ vaat ediyor |
| Tempo | 6 | Yavaş, doğal UGC temposu — kesme yok, tek çekim gibi akıyor |
| Kurgu | 6 | Selfie reaksiyonu → telefon ekranına kesme (uygulama arayüzü gösterimi) → geri reaksiyon |
| Altyazı | 7 | Ekranda gömülü metin ("My boyfriend pulled me closer after this"), sade, okunaklı |
| Görsel kalite | 5 | Amatör/gerçek çekim — parlak/stüdyo değil, tam tersi bir güven sinyali (otantiklik) |
| Ses kalitesi | — | Orijinal ses, değerlendirilemedi |
| CTA | — | Görünmüyor (muhtemelen bio linki) |
| Tahmini izlenme oranı | 6 | Orta — UGC otantikliği ilgi çekiyor ama üretim değeri düşük |
| Tahmini viral potansiyel | 5 | 26 beğeni ile mütevazı, ama DOĞRUDAN rakip niş için değerli bir referans |

**Rakip boşluk analizi:**
- Rakibin gözden kaçırdığı ama kitlenin istediği konular: parlak/prodüksiyonlu görsel kalite — rakip tamamen ham UGC'ye yaslanmış, hiç "aspirational" görsel içerik yok.
- Kullanmadığı içerik formatları: carousel (bulduğumuz örnekte hiç yok), eğitici/bilgi içeriği.
- Kimsenin doldurmadığı niş konumlanması: "hem otantik hem görsel olarak çekici" — Midnight'ın AI-üretimi ama "yakalanmış an" hisli görselleri bu ikisinin arasında bir yerde durabilir.
- Bu hafta paylaşılabilecek somut fikir: mevcut kart-reveal reel yapımıza (`reel-structure.md`) rakibin birinci-şahıs sonuç-hook'unu deneyelim (bkz. `hooks.md` eklenen örnek).

**Neden? (en önemli alan):** Bu içeriğin gücü üretim kalitesinden değil **otantiklikten** geliyor — gerçek bir kullanıcının gerçek tepkisi, düşük prodüksiyon değeri güven sinyali olarak çalışıyor. Ayrıca hook "özellik" değil "sonuç" anlatıyor (uygulamanın ne yaptığını değil, kullanınca ne olduğunu). Bu iki şey PRAXIS'in AI-üretimi pipeline'ında tam olarak kopyalanamaz (gerçek kullanıcı görüntümüz yok) ama hook stili doğrudan uyarlanabilir.

**Midnight'a uyarlanan çıkarım:** (a) Birinci şahıs sonuç-anlatımı hook stili `hooks.md`'nin "story" kategorisine Midnight-uyarlı örnek olarak eklendi; (b) uygulama arayüzünü ekranda gösterme fikri `reel-structure.md`'ye teknik kısıtla (Veo metin/arayüz render edemiyor) birlikte arşiv notu olarak düşüldü — şimdilik uygulanamaz; (c) UGC-otantiklik boşluğu ve buna karşı REALISM_DIRECTIVE'in "yakalanmış an" vurgusunu güçlendirme hatırlatması `growth-notes.md`'ye işlendi.

## [2026-07-22] Rakip hesap — @bijnabloot (fiziksel "Couples" oyunu)

**Kaynak:** ekran görüntüleri, kullanıcı tarafından paylaşıldı (bir reel'in kare kare akışı — "Couples" temalı fiziksel Monopoly-parodisi bir oyun satan hesap; 73 beğeni, 11 repost, 35 paylaşım, 22 kaydetme)

| Kriter | Puan (1-10) | Not |
|---|---|---|
| Hook (ilk 3sn) | 8 | "Monopoly is boring asf..." — tanıdık bir referansı kalıp-kırıcı şekilde reddediyor, anında merak açıyor |
| Tempo | 7 | Setup → partnere gönderme → kart reveal, doğal bir ilerleme |
| Kurgu | 8 | Klasik hook→gerilim→payoff yapısı, `reel-structure.md`'deki şablonla birebir örtüşüyor |
| Altyazı | 7 | Ekranda gömülü kısa metinler ("Sent this to them 😈", "Monopoly:") — sade, okunaklı |
| Görsel kalite | 6 | Amatör ama net çekim, ürün (kart) net görünüyor |
| Ses kalitesi | — | Değerlendirilemedi |
| CTA | 7 | "grab yours before it sells out" — kıtlık/aciliyet çerçevesi, bio linkine yönlendiriyor |
| Tahmini izlenme oranı | 8 | Paylaşım(35)+kaydetme(22) toplamı beğeniden(73) oransal olarak çok yüksek — güçlü "partnere gönder" sinyali |
| Tahmini viral potansiyel | 7 | Niş (fiziksel oyun) ama kanıtlanmış bir format |

**Rakip boşluk analizi:**
- Rakibin gözden kaçırdığı ama kitlenin istediği konular: dijital/anında erişim — fiziksel ürün "sold out" olabiliyor, uygulama olamaz (Midnight'ın yapısal avantajı).
- Kullanmadığı içerik formatları: carousel, çok-parçalı seri içerik.
- Kimsenin doldurmadığı niş konumlanması: "asla tükenmeyen, anında oynanabilen" — Midnight bunu zaten sağlıyor, mesajlaşmada vurgulanabilir.
- Bu hafta paylaşılabilecek somut fikir: aynı "kart reveal" yapısını, "hiç tükenmez, hemen indir" çerçevesiyle dene.

**Neden? (en önemli alan):** Paylaşım/kaydetme oranının beğeniden yüksek olması, tam olarak `algorithm.md`'nin öne çıkardığı save/share önceliğinin gerçek dünyada işlediğinin kanıtı — bu bizim stratejimizi doğruluyor, değiştirmiyor. "Partnere gönder" davranışını tetikleyen şey, kartın *partner hakkında bir şey ortaya çıkarması* (ilişkiyle ilgili paylaşılabilir bir "biz böyleyiz" anı) — Midnight'ın `send_to_partner` CTA'sı zaten bu mantığa dayanıyor.

**Midnight'a uyarlanan çıkarım:** Yeni bir kural gerekmedi — mevcut reel yapısı ve save/share önceliklendirme stratejisi bu örnekle doğrulandı, referans olarak kayda geçirildi.

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

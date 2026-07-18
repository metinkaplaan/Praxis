# Instagram Algoritması

> Kaynak: operatör-beslemeli. Güncelleme: Claude'a söyle, ilgili bölüme commit atar. Kod değişikliği gerekmez.
> `## Cheat Sheet` bölümü her üretim prompt'una girer (~150 kelime bütçe) — oraya sadece eyleme dönük kural yaz.

## Cheat Sheet

- Instagram ranks by predicted engagement: watch time / completion first, then saves + shares, then comments, then likes. Optimize in that order.
- The first 3 seconds (reel) or first slide (carousel) decides distribution — if viewers scroll past, reach dies.
- Saves and shares ("send to a friend/partner") are the strongest growth signals; give every post a concrete save/share trigger.
- Cold-start: assume the viewer has NEVER seen this account — every post must survive the algorithm's test with strangers and serve ONE clear goal (reach, saves, or follows); no generic content or logic-free trend imitation.
- Reel structure: no dead pauses — constant visual rhythm and micro-curiosity, plus a natural rewatch/loop trigger; linear content dies early.
- Carousel second chance: Instagram may re-serve slide 2 to non-swipers later — make slide 2 strong on its own.
- Consistency beats bursts; reply-worthy captions (a question, a "which one are you?") lift comments and reach.
- Never bait engagement explicitly ("like this post!") — Instagram demotes engagement bait. Earn the action instead.

## Reels Algoritması

- Sıralama sinyalleri (yaklaşık öncelik): izlenme tamamlama oranı (retention) > tekrar izleme > paylaşım > kaydetme > yorum > beğeni.
- İlk gösterim küçük bir test kitlesine yapılır; performans iyiyse kademeli genişletilir (bu yüzden ilk saatlerin performansı kritik).
- Sesli izlenme varsayımıyla tasarla ama altyazı şart (izleyicilerin önemli kısmı sessiz izler).
- Reel uzunluğu: kısa (7-15sn) tamamlama oranını şişirir; orta (20-40sn) hikaye anlatımına izin verir. İkisini de dene, veriye göre karar ver.
- Yeniden yayınlanan (başka platform filigranlı, örn. TikTok logolu) içerik aktif olarak düşürülür.

## Feed / Carousel Algoritması

- Carousel'de kaydırma oranı (swipe-through) ve slayt başına kalış süresi sinyaldir.
- İlk slayt = hook; kaydırmayan izleyiciye Instagram bazen 2. slaytı ayrı gösterim olarak sunar.
- 4:5 oran feed'de en fazla ekran alanı kaplar (1080×1350).

## Story Algoritması

- Story'ler mevcut takipçiyle ilişkiyi derinleştirir, keşif için değildir (yeni takipçi getirmez).
- Etkileşim çıkartmaları (anket, soru, quiz) story sıralamasını yükseltir.
- (PRAXIS şu an story üretmiyor — ileriki dalga.)

## Explore / Keşfet

- Keşfet'e girmenin yolu: niş-net içerik + güçlü save/share sinyali + tutarlı konu (hesabın "ne hakkında" olduğunun algoritmaca netleşmesi).
- Konudan konuya savrulan hesaplar keşfette zor yer bulur — Midnight hesabı tek temada kalmalı: çiftler, ilişki, oyun.

## Search / SEO

- Instagram araması artık caption metnini ve profil bio'sunu indeksliyor: anahtar kelimeleri caption'ın ilk cümlelerine doğal biçimde yerleştir ("couples game", "date night", "çift oyunu", "ilişki oyunu").
- Hashtag'ler artık keşiften çok arama/kategorizasyon sinyali: 5-10 arası, alakalı, spam'siz.

## Hesap Güven Skoru ve Otorite

- Yeni/küçük hesaplar düşük güvenle başlar; tutarlı, politika-uyumlu, özgün içerik güveni yükseltir.
- Ani davranış değişimleri (günde 20 gönderi, toplu takip/takipten çıkma, engagement pod'ları) güveni düşürür.
- Otorite konuya bağlıdır: aynı temada istikrar, o temada dağıtım avantajı sağlar.

## Shadowban Belirtileri ve Kaçınma

- Belirtiler: hashtag aramalarında görünmeme, keşfetten tamamen düşme, takipçi-dışı erişimin ~%0'a inmesi.
- Tetikleyiciler: yasaklı/spam hashtag'ler, politika ihlali sınırındaki içerik, üçüncü parti otomasyon araçları (resmi API kullanımı güvenli), engagement bait.
- Şüphede: 3-5 gün sakin, tamamen politika-uyumlu içerik; hashtag setini değiştir.

## Özgün İçerik ve AI-Üretimi İçerik Sinyalleri

- Instagram özgün (o platforma özel üretilmiş) içeriği ödüllendirir; birebir kopya/tekrar yüklemeleri düşürür.
- AI-üretimi içerik yasak değil, ama "AI görünümlü" jenerik içerik izleyici sinyalleriyle (düşük retention/save) dolaylı cezalanır — REALISM_DIRECTIVE tam bu yüzden var.
- Meta, AI içerik etiketlemesini genişletiyor; şeffaflık gereksinimleri değişirse burası güncellenecek.

## İçerik Dağıtım Mantığı (özet model)

1. Yayın → küçük test kitlesi (takipçilerin bir bölümü)
2. Erken sinyaller iyi (retention/save/share) → daha geniş takipçi + keşfet testi
3. Keşfet testinde de iyi → viral döngü; kötü → dağıtım durur
4. Gönderi "ölmez": güçlü carousel'ler haftalar sonra yeniden dağıtım alabilir

## Sıfırdan Büyüme — Erişim Mühendisliği

> Kaynak: operatör-beslemeli carousel analizi (2026-07-17, bkz.
> `knowledge/analysis-log.md`). Sıfır/az takipçili hesap fazına özel playbook —
> Midnight şu an tam bu fazda.

**Ana hedef** — üretilen her içerik:

- Mevcut bir takipçi kitlesi OLMADAN çalışır (soğuk izleyiciye tek başına mantıklı gelir)
- Ortalama üstü elde tutma (retention) oranı kurar
- Algoritmayı içeriği TEST etmeye zorlar (net sinyal üretir, kararsız bırakmaz)
- Explore ve Reels üzerinden dağıtım alır
- Erişimi kademeli olarak ölçeklendirir

**Algoritma test zinciri** — tüm içerik şu zinciri izler; başlangıç testini
geçemeyen içerik elenir:

1. Başlangıç testi (küçük, çoğunlukla takipçi-olmayan kitle)
2. Yüksek elde tutma oranı
3. Tekrarlanan görüntülemeler (tekrar oynatmalar)
4. Hızlı etkileşimler
5. Erişim genişletme

**Dağıtımı ölçeklendiren sinyaller** (optimize edilecekler): izleme süresi,
kaydetmeler, paylaşımlar, basit yorumlar. Hangi sinyalin hedeflendiği ve
Instagram'ın dağıtımı neden genişleteceği her gönderi için netleştirilmeli.

**Ortalama üstü tutulma — içerik yapılandırma:**

- Ölü duraklamalardan kaçın
- Mikro merak uyandır (an be an yeni bir küçük soru/gerilim)
- Görsel ritmi koru
- Doğal tekrarları teşvik et (loop/tekrar-izleme tetikleyicisi)
- Doğrusal içerik çabuk ölür

**Yabancılar için dil** — iletişim şunlara göre uyarlanır:

- Henüz hesaba güvenmeyenler
- Kalmaya mı gitmeye mi karar verdiğini 1-2 saniyede veren izleyiciler
- Niş jargonu anlamayanlar
- Netlik, ilk otoriteyi yener

**Attack sequence** — algoritmik hedefi net 5-10 başlangıç gönderisinden
oluşan dizi; erişim hedefi basitten cesura doğru ilerler. Yayınlama sırasının
arkasındaki mantık her gönderi için açıklanabilir olmalı.

**Kesin kurallar:**

- Takipçilere güvenme (takipçi sayısına yaslanan içerik kurma)
- Genel/jenerik içerik yok
- Mantıksız (hedefi açıklanamayan) trend taklidi yok
- Daima NEDEN'i açıkla — bu gönderi hangi sinyali neden üretecek
- Bir yeni başlayan yaratıcı gibi değil, bir erişim mühendisi gibi düşün

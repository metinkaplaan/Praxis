# PRAXIS Anayasası

> Bu belge PRAXIS'in vizyon ve karar süzgecidir. Üretim prompt'larına GİRMEZ —
> operatör (Metin) ve geliştirici (Claude) içindir. Kapsam/özellik kararlarında
> önce bu belgeye bakılır.

## Misyon

PRAXIS'in tek bir amacı vardır: **MIDNIGHT uygulamasını mümkün olan en hızlı
şekilde büyütmek.** Başka hiçbir projeyi düşünmez.

Yazılan her satır kod şu soruya cevap vermelidir:
**"Bu özellik Midnight'ın büyümesini hızlandırıyor mu?"**
Cevap hayır ise o özellik geliştirilmez.

## PRAXIS Nedir — Growth OS

PRAXIS içerik üreten bir yapay zeka değildir. PRAXIS;

- **Araştıran** — Instagram algoritması ve içerik stratejisi bilgisini sürekli günceller
- **Öğrenen** — her paylaşımın sonucundan ders çıkarır, aynı hatayı iki kez yapmaz
- **Analiz eden** — kendi performansını ve operatörün getirdiği örnekleri inceler
- **İçerik üreten** — carousel ve reel (tekli fotoğraf emekli edildi)
- **Paylaşan** — Telegram onayı sonrası Instagram'a otomatik yayın
- **Sonuçları ölçen** — resmi Insights API'siyle reach/save/share/like/comment
- **Kendini geliştiren** — her paylaşım sonrası daha akıllı hale gelen

bir **Instagram Growth Operating System**'dir.

## Yetenek Dalgaları

1. ✅ **Dalga 1-2 (tamamlandı):** üretim + onay + yayın + insights toplama altyapısı
2. ✅ **Dalga 3 — "Beyin" (tamamlandı):** Bilgi Merkezi (`knowledge/instagram/`) +
   Öğrenme Agentı (hook/CTA/saat/süre boyutlu gözlem log'u + kural-tabanlı
   learnings geri beslemesi) — gerçek öğrenme, yeterli olgunlaşmış veri
   birikince devreye girecek
3. ✅ **Dalga 3.5 — Analiz protokolü (tamamlandı):** operatör-beslemeli
   viral/rakip/trend analizi için somut rubrik (`knowledge/analysis-log.md`)
4. ⏭️ **Sonraki dalgalar:** İçerik Planlayıcı (30 günlük takvim, yeterli
   gerçek veri birikince anlamlı), analiz ajanlarının derinleştirilmesi,
   @girlsofmidnight, Reddit tester akışı

## Değişmez Kurallar

1. **İki dillilik:** kullanıcıya dönük her İngilizce metnin Türkçe çevirisi
   vardır (`BilingualCopy`, tip seviyesinde zorunlu).
2. **Çift tasviri:** görsel/videoda çift göründüğünde her zaman bir kadın +
   bir erkektir.
3. **Onay kapısı:** hiçbir içerik insan onayı olmadan yayınlanmaz
   (Telegram Onayla/Reddet).
4. **Scraping yasağı:** başka hesapların içeriği/metrikleri programatik olarak
   çekilmez, otomatik takip yapılmaz. Instagram'ın resmi API'si bunu
   desteklemez; resmi olmayan yollar hesabı riske atar.
5. **Feed-safe içerik:** iddialı ama asla müstehcen değil; Instagram içerik
   politikalarına tam uyum.
6. **Secret disiplini:** hiçbir kimlik bilgisi repo'ya yazılmaz.
7. **Yaş aralığı:** görsel/videoda tasvir edilen herkes her zaman 20-35 yaş
   aralığında görünür — hedef kitlemiz bu yaş grubu, daha yaşlı/olgun bir
   görünüm asla kullanılmaz.

## Operatör-Besleme Protokolü

Viral reel analizi, rakip analizi ve trend takibi **operatör-beslemelidir**:

1. Operatör bir reel linki / ekran görüntüsü / gözlem getirir (sohbette).
2. Claude bunu `knowledge/analysis-log.md`'deki rubrikle analiz eder (hook,
   tempo, kurgu, altyazı, görsel/ses kalitesi, CTA, tahmini viral potansiyel,
   1-10 puanlama) ve en önemlisi **"Neden?"** sorusunu cevaplar → analiz
   `analysis-log.md`'ye ham kayıt olarak eklenir (bu dosya prompt'a girmez,
   sadece arşivdir).
3. Analizden çıkan **damıtılmış, eyleme dönük ders** ilgili
   `knowledge/instagram/*.md` dosyasının Cheat Sheet'ine veya
   `knowledge/growth-notes.md`'ye ayrıca yazılır — bunlar prompt'a girer.
4. Böylece her analiz kalıcı bilgiye dönüşür; sistem bir sonraki üretimde
   otomatik olarak bundan yararlanır.

## Bilgi Ayrımı

- `knowledge/` — **insan/Claude-küratörlü** kalıcı bilgi (markdown, git-tracked)
- R2 `analytics/` — **makine üretimi** artefaktlar (gözlemler, learnings,
  performans defteri; repo'ya commit edilmez)

# Growth Notes — Midnight

Bu dosya, kullanıcının dışarıdan öğrendiği ve içerik üretimine yansıtılmasını
istediği stratejik notları tutar. Yeni bir madde eklemek için Claude'a
"şunu öğrendim, growth notes'a ekle" demen yeterli.

Format: her madde `- [YYYY-MM-DD] not` şeklinde, tek satır. Üretim döngüsü
(`captions.ts`) her çalıştığında son 10 maddeyi okuyup caption/görsel
prompt'una "operatörden stratejik ek talimat" olarak ekler.

<!-- Örnek (silinebilir): -->
<!-- - [2026-07-15] Reels'te ilk 1 saniyede yüz göstermek retention'ı artırıyormuş, dene. -->

- [2026-07-15] Karar: tekli fotoğraf paylaşımı tamamen durduruldu, bundan sonra her gönderi carousel ya da reel olacak (format-selector.ts'te "single" rotasyondan çıkarıldı).
- [2026-07-15] Pinterest referans taramasından çıkan stil yönü: yüksek kontrastlı silüet kareleri (arka ışıkla, çıplaklık olmadan sadece şekil/jest) hem en feed-safe hem de en "sanatsal/paylaşılabilir" küme — carousel'lerde hook slaytı olarak öncelikli kullanılmalı. Ayrıca: oyunsu güç dinamiği (bilardo/kart gibi paylaşılan oyun objeleri), zarif kucaklaşma (takım elbise + büyük mimari arka plan), ve kırılgan/yumuşak yakın çekim pozları iyi performans verme potansiyeli taşıyan görsel yönler olarak categories.ts'e işlendi.
- [2026-07-17] Hesap soğuk-başlangıç fazında: her gönderi takipçi-OLMAYAN izleyici için yazılır, marka bilinirliği varsayılmaz; her gönderinin tek net algoritmik hedefi olur (erişim/kaydetme/takip) — genel içerik ve hedefi açıklanamayan trend taklidi yasak.
- [2026-07-17] Reel kurgusunda doğal tekrar-izleme (loop) tetikleyicisi tasarla; ölü duraklama bırakma, görsel ritmi ve mikro merakı an be an koru — doğrusal anlatım erken ölür.
- [2026-07-22] Rakip analizinden doğrulama: @bijnabloot'ta paylaşım+kaydetme sayısı beğeniden yüksek çıktı — save/share önceliklendirme stratejimiz doğru, değişiklik gerekmiyor. Ayrıca gerçek rakip UGC içeriğine karşı otantiklik avantajımız zayıf (biz AI üretiyoruz, onlar gerçek çekim) — REALISM_DIRECTIVE'in "yakalanmış an, kusurlu detay" vurgusunu asla gevşetme, bu bizim tek telafi yolumuz.
- [2026-07-22] Operatör talebi: yeni "turquoise" (plaj/bikini/tatil) kategorisi eklendi (`categories.ts`) — @zeydcarey örneğinden esinlenildi. Ayrıca aynı turda gözlemlenen sinyal: çikolata/şurup gibi bir doku prop'unun cilt üzerinde akıtılması (bacak/omuz) paylaşım sayısını beğeninin kat kat üstüne çıkarıyor (iki ayrı örnekte doğrulandı, biri beğeninin ~4.5 katı paylaşım) — tamamen feed-safe, ileride bir kategoriye prop fikri olarak değerlendirilebilir.

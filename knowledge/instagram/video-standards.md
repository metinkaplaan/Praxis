# Teknik Video / Görsel Standartları

> Kaynak: operatör-beslemeli. Güncelleme: Claude'a söyle, ilgili bölüme commit atar. Kod değişikliği gerekmez.
> NOT: Bu dosyanın Cheat Sheet'i prompt'a GİRMEZ — teknik standartlar Veo/görsel config'in işidir, metin modelinin değil. Referans belgesidir.

## Cheat Sheet

- Reels: 9:16, 1080×1920, MP4/H.264, 23-60fps kabul, yüksek bitrate.
- Feed/carousel: 4:5 (1080×1350) maksimum ekran alanı.
- Güvenli alan: üst %15 ve alt %20'ye kritik öğe koyma (UI örtüyor).
- Kapak karesi tek başına anlamlı olmalı (profil grid'inde tek görsel olarak durur).

## Veo Çıktısı Uyumluluğu

- Veo (`veo-3.1-generate-preview`) çıktısı zaten MP4 / H.264 / ~24fps — Instagram 23-60fps kabul ettiği için uyumludur. **ffmpeg normalizasyonu gerekmez.**
- `aspectRatio: "9:16"` config'te sabit; çözünürlük `VEO_RESOLUTION` env'i ile (varsayılan 1080p, model reddederse 720p'ye düşülür).
- Süre `VEO_DURATION_SEC` env'i ile (varsayılan 8sn).

## Reels Teknik Detay

- Önerilen: 1080×1920, H.264, AAC ses, 30 veya 60 FPS, mümkün olan en yüksek bitrate.
- Maksimum dosya boyutu pratikte sorun değil (Graph API URL'den çeker, R2 public URL'imiz yeterli).
- Instagram videoyu yeniden sıkıştırır — kaynak ne kadar kaliteli olursa sonuç o kadar iyi.

## Güvenli Yazı Alanları

- Üst ~%15: kullanıcı adı/menü örtüşmesi.
- Alt ~%20: caption, ses adı, etkileşim butonları örtüşmesi.
- Sağ kenar ~%10: beğeni/yorum/paylaş sütunu.
- Kritik görsel öğe ve (ileride eklenirse) yazı overlay'leri merkez %65'te kalmalı.

## Kapak Görseli Kuralları

- Reel kapağı grid'de 1:1 kırpılır — merkezde anlamlı olmalı.
- Kapakta yüz/insan figürü tıklanma oranını artırır.
- (PRAXIS şu an özel kapak yüklemiyor — Instagram ilk kareyi kullanır; videoPrompt'ta ilk karenin güçlü olması bu yüzden de önemli. İleride `cover_url` desteği eklenebilir.)

# YeşilGöz — Bitki Tanıma Uygulaması

Mobil öncelikli (telefon ekranı için tasarlanmış) web uygulaması. Fotoğraf çek ya da yükle, bitkinin türünü öğren, bakım bilgilerini gör ve kendi koleksiyonunda sakla. Arayüz tamamen Türkçe.

Mevcut hava durumu ekranları kaldırılır; proje bitki tanımaya dönüşür.

## Ekranlar

1. **Tanı (ana sayfa)**
   - Büyük "Fotoğraf çek" butonu (telefon kamerasını açar) ve "Galeriden yükle".
   - Seçilen fotoğrafın önizlemesi, "Bitkiyi tanı" butonu ve tanıma sırasında canlı bir yükleniyor animasyonu.
2. **Sonuç**
   - Bitkinin Türkçe adı, Latince adı, güven oranı, kısa tanıtım yazısı.
   - Kendi çektiğin fotoğraf + bitkinin örnek görseli.
   - Bakım kartları: sulama sıklığı, ışık ihtiyacı, toprak, gübre, nem, sıcaklık aralığı, budama, saksı değişimi, evcil hayvanlar için zehirli mi, sık görülen sorunlar.
   - "Koleksiyonuma ekle" butonu.
3. **Koleksiyonum**
   - Kaydedilen bitkiler kart listesi olarak; karta dokununca detay sayfası açılır, silme mümkün.
4. **Giriş / kayıt**
   - E-posta + şifre ile giriş. Koleksiyon hesaba bağlı olduğu için gerekli.

Alt kısımda sabit üç sekmeli mobil menü: Tanı · Koleksiyonum · Profil.

## Tasarım yönü

Botanik-modern: koyu yeşil/adaçayı yeşili, krem zemin, yumuşak yuvarlak kartlar, yapraklı doku detayları; hava durumu uygulamasının sarı paleti tamamen değişir. Başlıklar için karakterli bir yazı tipi, metinler için okunur sans-serif. Tek elle kullanıma uygun büyük dokunma alanları.

## Nasıl çalışacak (teknik)

- **Lovable Cloud** etkinleştirilir: giriş sistemi, veritabanı ve fotoğraf depolama için.
- **Yapay zekâ:** Lovable AI Gateway üzerinden `google/gemini-3.7-flash` (Gemini, görsel girdi destekli). Ayrı bir API anahtarı almanız gerekmez — anahtar Lovable tarafından sağlanır ve yalnızca sunucu tarafında kullanılır.
- Tanıma akışı: fotoğraf `createServerFn` ile sunucuya gönderilir → Gemini'ye görsel + Türkçe istem → katı JSON şema ile tür, güven, açıklama ve tüm bakım alanları döner → sonuç ekranına aktarılır. Gateway hata durumları (kredi/limit/hız) kullanıcıya anlaşılır Türkçe mesajla gösterilir.
- Bitkinin örnek görseli: Gemini'nin döndürdüğü Latince ad ile Wikipedia/Wikimedia görsel uç noktasından çekilir; bulunamazsa kullanıcının kendi fotoğrafı ve yapraklı bir yer tutucu gösterilir.
- **Veritabanı:** `plants` tablosu (kullanıcı id, tür adı, Latince ad, güven, açıklama, bakım verisi JSON, fotoğraf yolu, tarih) + RLS ile yalnızca kendi kayıtlarına erişim, gerekli GRANT'lar. Fotoğraflar özel bir depolama kovasında kullanıcı klasörlerinde tutulur.
- Rotalar: `/` (tanı), `/sonuc`, `/koleksiyon`, `/koleksiyon/$id`, `/profil`, `/auth`. Koleksiyon rotaları giriş korumalı.
- Kaldırılacaklar: hava durumu bileşenleri, 3D gökyüzü sahnesi, `three`/`@react-three/*` paketleri, hava durumu veri katmanı ve Golden Sky renk/animasyon token'ları.

## Notlar

- Yapay zekâ ile üretilen bakım bilgileri bilgilendirme amaçlıdır; ekranda küçük bir uyarı notu yer alacak.
- Fotoğraflar tanımadan önce tarayıcıda küçültülür, böylece yükleme ve tanıma hızlı olur.

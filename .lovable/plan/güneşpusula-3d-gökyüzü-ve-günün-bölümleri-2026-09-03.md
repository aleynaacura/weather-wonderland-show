# GüneşPusula: 3D Gökyüzü ve Günün Bölümleri

Üç iyileştirme: belirgin bir şehir seçici, günün bölümlerine göre animasyonlu tahmin, ve gerçek 3D gökyüzü sahnesi.

## 1. Şehir seçici (ana sayfada belirgin)
- Mevcut arama kutusu, ana kartın üstünde daha büyük bir seçiciye dönüşür: arama + "Popüler şehirler" hızlı seçim çipleri (İstanbul, Ankara, İzmir, Antalya, Bursa, Trabzon).
- "Konumumu kullan" butonu (tarayıcı konum izni) eklenir.
- Seçilen şehir tarayıcıda hatırlanır, böylece sayfa yenilenince aynı şehir açılır.
- Şehir değişince hem veriler hem 3D gökyüzü sahnesi seçilen şehrin hava koduna göre yeniden animasyona geçer.

## 2. Günün bölümleri animasyonu (sabah / öğlen / akşam / gece)
- Seçilen gün için 4 bölüm kartı: Sabah (~08), Öğlen (~13), Akşam (~19), Gece (~23) — saatlik veriden hesaplanır.
- Bölümler arasında otomatik ilerleyen bir "gün şeridi": her bölüm sırayla vurgulanır, sıcaklık ve simge yumuşak geçişle değişir; kullanıcı tıklayarak da bölüm seçebilir.
- Seçilen bölüm 3D gökyüzünü de sürüklüyor: güneş yüksekliği ve gökyüzü rengi o bölüme göre (şafak turuncusu → parlak öğlen → altın akşam → yıldızlı gece) yumuşakça animasyonla değişir.
- 7 günlük listede bir güne tıklayınca o günün bölüm şeridi görüntülenir.

## 3. Gerçek 3D gökyüzü (React Three Fiber)
- Mevcut CSS gökyüzü, WebGL tabanlı gerçek 3D sahneyle değiştirilir; kart arayüzü aynı kalır, sahne arka planda döner.
- Hacimli, yumuşak bulut kümeleri yatayca sürüklenir; parallaks için farklı derinlik katmanları.
- Güneş bir yay boyunca hareket eder (bölüm/saate göre konum), ışık halesi ve yönlü ışık ile bulutları aydınlatır; gece güneş yerine ay + yıldızlar.
- Hava koduna göre: bulut sayısı/yoğunluğu, bulut rengi (beyaz → gri → fırtına koyusu), yağmur/kar parçacıkları ve fırtınada şimşek parlaması.
- Cihaz dostu: sınırlı parçacık sayısı, pixel ratio sınırı; WebGL yoksa mevcut CSS sahnesine geri düşer.

## Teknik notlar
- `three`, `@react-three/fiber@^9`, `@react-three/drei@^10` kurulur; sahne `ssr: false` ile client-only olarak yüklenir (`ClientOnly` + lazy import), böylece SSR bozulmaz.
- Yeni dosyalar: `src/components/sky3d/SkyCanvas.tsx`, `Clouds.tsx`, `SunMoon.tsx`, `Precipitation.tsx`; `src/components/DayParts.tsx`; `src/lib/dayparts.ts` (saatlik veriden bölüm çıkarımı) ve `src/lib/skyPalette.ts` (koda + bölüme göre renk/yoğunluk tablosu).
- `src/lib/weather.ts` yalnızca yardımcı fonksiyonlarla genişletilir; veri kaynağı Open-Meteo olarak kalır (API anahtarı yok).
- Renkler mevcut Golden Sky token'larından türetilir; sabit hex kullanılmaz.
- Tarayıcıda ekran görüntüsüyle doğrulanır: sahne görünür, konsol temiz.

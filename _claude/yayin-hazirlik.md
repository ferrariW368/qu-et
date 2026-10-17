# qu/et — SİTE 09 yayın hazırlığı (Cloudflare Pages) — 17 Ekim 2026

Durum: inceleme + plan. Siteye kod değişikliği YAPILMADI; uygulama "devam" onayıyla.

## 1. `_headers` kontrolü (Site/_headers)

| Kontrol | Sonuç |
|---|---|
| Sözdizimi (yol satırı + girintili başlıklar) | ✓ Cloudflare Pages biçimiyle uyumlu |
| CSP `script/style-src 'self'` | ✓ Yerelde 0 ihlal (serve-with-headers.py) |
| CSP `form-action 'none'` + Shopier | ✓ Ön sipariş butonu `<a href>` olursa sorun yok. `<form>` olursa engellenir → Shopier bağlantısı link olarak yazılacak |
| HSTS `includeSubDomains` | ✓ Tüm alt alan adları HTTPS olacaksa uygun; `preload` bilinçli olarak yok |
| `Permissions-Policy: payment=()` | ✓ Ödeme Shopier sayfasında, sitede Payment API yok |
| Cache `/assets/*` 1 saat, fontlar immutable | ✓ Dosya adlarında hash yok, kısa cache doğru |

## 2. Yayın engelleri (yayından önce çözülmeli)

| # | Bulgu | Etki | Çözüm |
|---|---|---|---|
| E1 | `index.html` yok; ana sayfa `qu-et-home-masaustu.html` | Kök adres `/` boş kalır | build-pages.py ana sayfayı `index.html` olarak yazsın, logo linkleri `/` olsun |
| E2 | `404.html` yok | Cloudflare Pages siteyi SPA sanar, olmayan her URL ana sayfayı 200 ile döndürür | Sade 404 sayfası (logo + "Koleksiyon" linki) |
| E3 | `Site/` doğrudan yayınlanırsa `arsiv/`, `review/`, `tools/`, `CONSTRAINTS.md`, `qu-et-home-mobil.html`, `hero-karsilastirma.html` da yayına çıkar (33 MB) | Eski tasarımlar ve iç dosyalar herkese açık | Beyaz listeyle `dist/` klasörü üret, yalnız onu yükle |
| E4 | Pages `.html` linklerini uzantısız adrese 308 ile yönlendirir | Her sayfa geçişinde fazladan bir yönlendirme | Build'de linkleri uzantısız yaz (`/peak`, `/koleksiyon`) |
| E5 | `sepet.html`, `siparis.html`, sepet çekmecesi | Shopier kararıyla gereksiz | SİTE 07'de kaldırılacak; `dist/`'e girmeyecek |

`dist/` beyaz listesi (Shopier sonrası): `index.html`, `koleksiyon.html`, `peak.html`, `mid-levels.html`, `hakkimizda.html`, `404.html`, `_headers`, `assets/` (fonts, images, site.css, site.js, intro.js, comparison.js, favicon.svg).

## 3. Yayın listesi (sırayla)

1. Shopier ürün linkleri hazır, butonlara bağlı (SİTE 07).
2. İngilizce metin onaylı ve uygulanmış (SİTE 07).
3. E1–E5 çözüldü, `dist/` üretildi.
4. `check-all.ps1 -perf` `dist/` üzerinde geçti (12/12, axe 0, CSP 0, LCP ≤ 2,5 sn).
5. ⚠️ Credential adımı: Cloudflare hesabı + domain (Eren girer, 2FA açık).
6. İlk yükleme `*.pages.dev` önizleme adresine (domain bağlanmadan).
7. Canlı kontrol: `curl -I` ile başlıklar, olmayan URL 404 dönüyor mu, Shopier linki açılıyor mu, mobil LCP (canlı ölçüm).
8. Domain bağlanır, HTTPS sertifikası aktif mi kontrol edilir; `_headers`'tan demo dönemi `X-Robots-Tag: noindex` satırı kaldırılır.
9. Instagram bio linki güncellenir (Pınar).

## 4. Geri dönüş planı

| Durum | Aksiyon |
|---|---|
| Yeni sürümde hata | Cloudflare Pages > Deployments > önceki sürüm > "Rollback" (anında, yeniden build yok) |
| Domain/DNS sorunu | Site `*.pages.dev` adresinde çalışmaya devam eder; Instagram linki geçici olarak oraya verilir |
| Shopier linki bozuk / hesap askıda | Ön sipariş butonu e-posta linkine (`mailto:`) çevrilir; tek satırlık build değişikliği |
| Kaynak bozulması | Her değişiklikten önce `Site\arsiv\revizyon-<X>-oncesi` yedeği (mevcut kural) |

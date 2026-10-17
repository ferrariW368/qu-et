# qu/et — Kalite çıtası (CONSTRAINTS)

Son gözden geçirme: 17 Ekim 2026, Claude. SİTE 06 Done olarak işaretlendi (Eren talimatı, 17 Ekim); eşik değişikliği Eren onayıyla yapılır.
Tek komut: `powershell -File ..\_claude\qa\check-all.ps1`

## Taban (her zaman)

- HTML elle düzenlenmez; kaynak `tools/build-pages.py` + `assets/`.
- Test atlanmaz/silinmez; bu dosyadaki eşik, bir değişikliği geçirmek için düşürülmez.
- Satır içi `style="..."` ve satır içi `<script>` yok (CSP `style-src/script-src 'self'`).
- Gizli bilgi (API key, şifre) kaynakta yok.

## Sayısal eşikler

| Boyut | Kural | Neden | Kontrol eden | Ne zaman |
|---|---|---|---|---|
| Davranış | 9/9 grup geçer | Dil çiftleri, sepet (ekle/çekmece/sayfa/silme), güvenilmez sepet verisi, sipariş formu, ürün/ana sayfa/koleksiyon, 404 — iki dilde | `node tools/check-site.cjs` | her değişiklik |
| Yayın paketi | `make-dist.py` eksiksiz çıkar; `dist/` yalnız beyaz liste | İç dosyalar yayına çıkmasın | `python tools/make-dist.py` | yayından önce |
| Erişilebilirlik (dış) | axe WCAG 2.2 AA: 0 critical/serious | Dış denetçi, kendi testimize bağlı değil | `_claude/qa/axe-check.cjs` | her değişiklik |
| Dokunma alanı | 24×24 px altı etkileşimli öğe yok | WCAG 2.5.8 | `_claude/qa/browser-check.cjs` (`small`) | her değişiklik |
| Konsol / CSP | 0 hata, 0 CSP ihlali | `_headers` CSP'si yayında bozulmasın | `browser-check.cjs` + `serve-with-headers.py` | her değişiklik |
| Taşma | Yatay kaydırma yok (390 / 1440 px) | Mobil öncelik | `browser-check.cjs` (`overflow`) | her değişiklik |
| LCP (mobil, Slow 4G, 4× CPU) | ≤ 2500 ms (Koleksiyon/Ürün/Sepet) | Core Web Vitals "Good" | `_claude/qa/perf-check.cjs` | görsel/CSS değişince |
| CLS | ≤ 0.1 | Core Web Vitals "Good" | `perf-check.cjs` | görsel/CSS değişince |
| Görsel bütçesi | srcset mobil aday ≤ 120 KB, her aday ≤ 300 KB | 16 Ekim ölçümünde mobil LCP'nin ana nedeni | `check-site.cjs` | her değişiklik |
| Font | Yalnızca woff2 | TTF 3× büyük (57 → 17 KB) | `check-site.cjs` | her değişiklik |

## Ölçülen, henüz zorlanmayan (geriye gitmez)

| Metrik | 16 Ekim değeri | Yön |
|---|---|---|
| Ana sayfa LCP (mobil, Slow 4G) | ~2,0 sn (hero SVG içindeki görsel) | yükselmemeli |
| Ana sayfa transfer | ~670 KB | büyümemeli |

> revS/revS2 (17 Ekim, Claude): Site iki dilli dizin yapısına geçti (EN kök, TR /tr/). Sepet korunuyor (Eren, revS2); sepet artık yalnız localStorage'da, file:// için yazılmış URL/sekme aktarımı kaldırıldı. Bu mekanizmaya ait 2 grup (dosyalar arası aktarım, geri/ileri sekme durumu) emekli edildi; diğer tüm gruplar iki dile genişletildi, dil çiftleri ve 404 grupları eklendi. Eşik düşürülmedi; grup değişikliği **Eren onayı bekliyor**.

## İstisnalar

| ID | Kural | Yer | Neden | Sahip | Bitiş |
|---|---|---|---|---|---|
| ~~E1~~ | CSP stil hash'i | `_headers` | `liquid-metal-button.js` sabit `<style>` enjekte ediyor (buton kalıcı, C kararı 16 Ekim) | Eren | Kütüphane güncellenince hash yenilenir | **Kapandı 16 Ekim (K2-B): buton ve hash kaldırıldı.**

## Deneme defteri (performans)

| Fikir | Önce → Sonra | Karar | Neden |
|---|---|---|---|
| TTF → woff2 | Peak LCP 4144 → 3556 ms | tutuldu | 174 → 53 KB font |
| Gizli ten katmanına `fetchpriority=low` | 3556 → 3560 ms | geri alındı | gürültü içinde |
| srcset varyantları (q90) | Koleksiyon 4928 → 1356 ms, Peak 3560 → 1948 ms | tutuldu | mobil 1672 px yerine 840/720 px |
| Varyant kalitesi q80 | — | reddedildi | ten dokusu yumuşadı (görsel kontrol) |
| Hero preload'a `fetchpriority=high` | Ana sayfa LCP 2756 → 2752 ms | geri alındı | gürültü içinde |
| Font preload | — | denenmedi | LCP öğesi font değil, hero görseli |
| Ekran dışı `hong-kong.webp` → `loading=lazy` | Ana sayfa LCP 2756 → ~1990 ms | tutuldu | hero görseliyle bant paylaşımı bitti |
| Koleksiyon A (17 Ekim) sonrası ölçüm | Koleksiyon LCP 3476 ms (eşik aşıldı) | düzeltildi | gizli "takılı" katmanı + 960 px aday |
| Hover-only katmanlar `data-src` (telefonda inmez) | Koleksiyon 3476 → 2604 ms, 825 → 442 KB | tutuldu | dokunmatikte görünmeyen görsel indirilmiyor |
| Kart `sizes` = `calc(100vw - 48px)` | Koleksiyon 2604 → 2044 ms | tutuldu | 2× ekranda 960 yerine 720 aday |
| Ana sayfa ürün kareleri eager + `fetchpriority=low` | Ana sayfa LCP 1990 → 1804 ms, mobil 4G'de kareler 5,9 → 3,9 sn | tutuldu | kaydırınca geç gelme şikâyeti (Eren) |


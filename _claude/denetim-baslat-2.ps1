$r = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-run.ps1"
$ortak = "Site dosyalarini DEGISTIRME. Turkce yaz. Dosya:satir referansli tablo ver, her bulguya tek satir duzeltme. HTML sayfalari tools/build-pages.py ile uretilir; oneriler ureteci veya assets dosyalarini hedeflesin. Fiyat vurgusu, metal buton ve logo 4.6 sn gecikmesi zaten karar bekliyor, listeleme."
$isler = @(
  @{ad='impeccable-2'; p="/impeccable audit tum site (7 sayfa + assets). revAB duzeltmeleri yapildi: form autocomplete ve bagli hata metinleri, sepet cekmecesi gecisi, karsilastirma transform tabanli, hover gecisleri, dokunma alanlari, woff2 font, srcset varyantlari. 1) Bu duzeltmeler dogru mu, yeni sorun var mi? 2) Henuz bulunmamis en onemli 8 bulgu. $ortak"},
  @{ad='animasyon-2'; p="/review-animations sadece revAB ile eklenen kodlar: assets/site.css sonundaki revAB blogu (.cart-drawer @starting-style, hover transitionlari) ve .comparison-silver-wrap transform tabanli karsilastirma. Before/After/Why tablosu. $ortak"},
  @{ad='design-dna'; p="design-dna skill'i ile bu sitenin (assets/site.css + sayfalar) Design DNA profilini JSON olarak cikar (renk, tipografi, bosluk, efekt tokenlari). Sonra DNA ile kod arasindaki tutarsizliklari (ayni rol icin farkli deger, tek seferlik renkler, font-size daginikligi) en onemli 8 madde olarak listele. JSON'u ../_claude/design-dna.json dosyasina yazabilirsin. $ortak"},
  @{ad='code-review'; p="agency-agents Code Reviewer olarak assets/site.js, assets/comparison.js, tools/build-pages.py ve tools/make-variants.py dosyalarini incele: hata, edge case, guvenlik (XSS, URL parametresi), bakim riski. $ortak"},
  @{ad='archify'; p="archify ile qu/et statik sitesinin mimari diyagramini uret: build-pages.py -> 8 HTML sayfa, assets (site.js sepet durumu: localStorage + URL bag parametresi + window.name), comparison.js, liquid-metal-button.js, check-site.cjs testleri ve on siparis akisi (urun -> cekmece -> sepet -> siparis -> kontrol -> odeme kapali). Ciktiyi ../_claude/archify-mimari.html olarak kaydet. Site dosyalarini degistirme."}
)
foreach ($i in $isler) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$r,'-ad',$i.ad,'-prompt',('"' + $i.p.Replace('"',"'") + '"'))
}
"5 denetim baslatildi"

$r = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-run.ps1"
$ortak = "Dosyalari DEGISTIRME. Turkce yaz. En onemli 8 bulguyu onem sirasiyla dosya:satir referansiyla tablo halinde ver; her bulguya tek satir duzeltme onerisi ekle. Not: HTML sayfalari tools/build-pages.py ile uretilir, duzeltme onerisini ureteci veya assets dosyalarini hedefleyerek yaz."
$isler = @(
  @{ad='impeccable'; p="/impeccable critique tum site: qu-et-home-masaustu.html, koleksiyon.html, hakkimizda.html, peak.html, mid-levels.html, sepet.html, siparis.html ve assets/site.css. Luks, sakin, minimal bir taki markasi icin gorsel hiyerarsi, tipografi, bosluk, tutarlilik ve donusum (sepete ekleme) acisindan degerlendir. $ortak"},
  @{ad='a11y'; p="A11Y.md / WCAG 2.2 AA kurallarina gore tum sayfalari (qu-et-home-masaustu.html, koleksiyon.html, hakkimizda.html, peak.html, mid-levels.html, sepet.html, siparis.html) ve assets/site.js, assets/comparison.js dosyalarini denetle: klavye, odak, kontrast, form etiketleri, dialoglar, canli bolgeler. $ortak"},
  @{ad='animasyon'; p="/review-animations ve motion-design ile sitedeki tum hareketleri denetle: hero logo animasyonu (assets/site.css hero-mark, corner-logo), urun karsilastirma gecisi (assets/comparison.js), sivi metal buton (assets/liquid-metal-button.js), sepet cekmecesi ve hover gecisleri. Sure, easing, reduced-motion ve performans acisindan. $ortak"}
)
foreach ($i in $isler) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$r,'-ad',$i.ad,'-prompt',('"' + $i.p.Replace('"',"'") + '"'))
}
"3 denetim baslatildi"

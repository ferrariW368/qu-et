Set-Location "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site"
$out = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\impeccable-home.txt"
claude -p "/impeccable audit qu-et-home-masaustu.html (assets/site.css ve assets/comparison.js dahil). Masaustu 1440 ve mobil 390 genislik icin. En onemli 8 bulguyu onem sirasiyla, dosya:satir referansiyla Turkce tablo olarak ver. Dosyalari DEGISTIRME." --output-format text --max-turns 15 2>&1 | Out-File -Encoding utf8 $out
"BITTI" | Out-File -Append -Encoding utf8 $out

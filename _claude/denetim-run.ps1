param([string]$ad, [string]$prompt)
Set-Location "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site"
$out = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-$ad.txt"
claude -p $prompt --output-format text --max-turns 25 2>&1 | Out-File -Encoding utf8 $out
"BITTI" | Out-File -Append -Encoding utf8 $out

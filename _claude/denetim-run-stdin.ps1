param([string]$ad, [string]$promptFile)
# Like denetim-run-2.ps1, but the prompt is piped on stdin so quotes/parentheses are not mangled by argument quoting.
Set-Location "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site"
$out = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-$ad.txt"
[Console]::InputEncoding = [Text.Encoding]::UTF8
Get-Content $promptFile -Raw -Encoding UTF8 | claude -p --output-format text --max-turns 40 `
  --add-dir "$env:USERPROFILE\.claude" --add-dir "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude" `
  --allowedTools "Read" "Glob" "Grep" "Skill" 2>&1 | Out-File -Encoding utf8 $out
"BITTI" | Out-File -Append -Encoding utf8 $out

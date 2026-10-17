param([string]$ad, [string]$prompt)
# Same as denetim-run.ps1, but pre-approves read access to installed skills and writes to _claude
# (headless -p mode cannot answer permission prompts). Site has a backup under Site\arsiv.
Set-Location "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site"
$out = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-$ad.txt"
claude -p $prompt --output-format text --max-turns 40 `
  --add-dir "$env:USERPROFILE\.claude" --add-dir "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude" `
  --allowedTools "Read" "Glob" "Grep" "Write" "Skill" "Bash(python:*)" "Bash(node:*)" 2>&1 | Out-File -Encoding utf8 $out
"BITTI" | Out-File -Append -Encoding utf8 $out

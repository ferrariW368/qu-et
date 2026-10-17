$qa = "C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\qa"
New-Item -ItemType Directory -Force $qa | Out-Null
Set-Location $qa
if (!(Test-Path package.json)) { npm init -y | Out-Null }
npm install jsdom css-tree --no-audit --no-fund 2>&1 | Out-File -Encoding utf8 "$qa\npm.log"
"BITTI" | Out-File -Append -Encoding utf8 "$qa\npm.log"

param([string]$tag)
Set-Location C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et
$s = Get-ChildItem -Recurse -Filter serve-with-headers.py -Path .\_claude,.\Site -ErrorAction SilentlyContinue | Select-Object -First 1
$srv = Start-Process python -ArgumentList $s.FullName,'8766' -WorkingDirectory .\Site -PassThru -WindowStyle Hidden
Start-Sleep 2
Set-Location .\_claude\qa
node home-load.cjs *> "..\home-load-$tag.log"
Stop-Process -Id $srv.Id

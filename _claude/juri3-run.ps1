Set-Location C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et
$s = Get-ChildItem -Recurse -Filter serve-with-headers.py -Path .\_claude,.\Site -ErrorAction SilentlyContinue | Select-Object -First 1
$srv = Start-Process python -ArgumentList $s.FullName,'8766' -WorkingDirectory .\Site -PassThru -WindowStyle Hidden
Start-Sleep 2
Set-Location .\_claude\qa
node juri3-shots.cjs *> ..\juri3-shots.log
node mobile-shots.cjs *>> ..\juri3-shots.log
Stop-Process -Id $srv.Id
& C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\denetim-run-stdin.ps1 -ad juri-3 -promptFile C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\_claude\juri3-prompt.txt

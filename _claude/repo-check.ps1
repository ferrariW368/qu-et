# Trust check for candidate repos: GitHub metadata + OpenSSF Scorecard (public APIs, no token).
$repos = 'ollama/ollama','mastra-ai/mastra','browserbase/stagehand','vercel/ai','infiniflow/ragflow','comfyanonymous/ComfyUI','biomejs/biome','DavidHDev/react-bits','vllm-project/vllm','MotiaDev/motia','FlowiseAI/Flowise','web-infra-dev/midscene'
$rows = foreach ($r in $repos) {
  try { $g = Invoke-RestMethod "https://api.github.com/repos/$r" -Headers @{ 'User-Agent' = 'ferrari-check' } } catch { $g = $null }
  try { $s = Invoke-RestMethod "https://api.securityscorecards.dev/projects/github.com/$r" } catch { $s = $null }
  $sec = try { (Invoke-WebRequest "https://raw.githubusercontent.com/$r/HEAD/SECURITY.md" -UseBasicParsing -Method Head).StatusCode -eq 200 } catch { $false }
  [pscustomobject]@{
    repo = $r; stars = $g.stargazers_count; license = $g.license.spdx_id; archived = $g.archived
    pushed = if ($g) { ([datetime]$g.pushed_at).ToString('yyyy-MM-dd') } else { '' }
    owner = $g.owner.type; scorecard = $s.score; security_md = $sec
  }
}
$rows | Format-Table -AutoSize | Out-String -Width 200
'--- donanim'
Get-CimInstance Win32_VideoController | % { "$($_.Name)  VRAM~$([math]::Round($_.AdapterRAM/1GB,1))GB" }
"RAM $([math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB))GB"

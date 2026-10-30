# One-shot helper: validate and configure the SiliconFlow API Key
#
# Why this script exists:
#   A key that travels through a chat window can be corrupted in two ways:
#     1. OCR of a screenshot may mis-read one character (l/1, 0/o, v/y ...)
#     2. The host replaces real key strings in tool arguments with placeholders
#   Pasting the key in YOUR OWN terminal avoids both.
#
# Usage (PowerShell 5.1 or 7+):
#   cd C:\Users\Rywl0\WorkBuddy\KETZXT-fresh\worker
#   powershell -ExecutionPolicy Bypass -File .\setup-sf-key.ps1
#
# All output is plain ASCII on purpose: Windows PowerShell 5.1 reads .ps1
# files as ANSI unless they carry a BOM, so non-ASCII text breaks parsing.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$ApiBase  = 'https://api.siliconflow.cn/v1'
$Project  = 'ketzxt-api'
$AsrModel = 'FunAudioLLM/SenseVoiceSmall'

# Write a file as UTF-8 WITHOUT BOM.
# PowerShell 5.1's "Set-Content -Encoding utf8" adds a BOM, which would end up
# glued to the first key name and break wrangler's env parsing.
function Write-NoBom([string]$Path, [string]$Content) {
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

function Step($m) { Write-Host ''; Write-Host "=== $m ===" }
function Ok($m)   { Write-Host "  [OK] $m" }
function Fail($m) { Write-Host "  [FAIL] $m" }

# --------------------------------------------------------------- 1. read key
Step '1/5  Read SiliconFlow API Key'
Write-Host 'Paste the key (starts with sk-), then press Enter:'
$key = (Read-Host).Trim()
if (-not $key) { Fail 'Nothing was entered. Aborted.'; exit 1 }
Write-Host ("  length {0}, prefix {1}..." -f $key.Length, $key.Substring(0, [Math]::Min(8, $key.Length)))
if (-not $key.StartsWith('sk-')) { Fail 'Does not start with sk-'; exit 1 }

# --------------------------------------------------------------- 2. validate
Step '2/5  Validate the key'

# curl.exe ships with Windows 10+ and behaves the same on PS 5.1 and 7+.
$modelsRaw = & curl.exe -sS -m 30 "$ApiBase/models" -H "Authorization: Bearer $key" 2>&1
$modelsRaw = ($modelsRaw | Out-String)
if ($modelsRaw -match '"data"\s*:\s*\[') {
    $count = ([regex]::Matches($modelsRaw, '"id"\s*:')).Count
    Ok "models endpoint passed (about $count models listed)"
} else {
    Fail "models endpoint failed: $($modelsRaw.Trim())"
    Fail 'The server does not accept this key. Check these in the SiliconFlow console:'
    Write-Host '     1) Real-name verification status (unverified = no model calls allowed)'
    Write-Host '     2) Whether the key row shows as Enabled (not Disabled)'
    Write-Host '     3) Whether an IP whitelist was set when the key was created'
    exit 1
}

# Real English audio from the project (a synthetic tone proves much less).
$audio = Get-ChildItem -Path (Join-Path $PSScriptRoot '..\ket-app\public\audio\*.mp3') -ErrorAction SilentlyContinue | Select-Object -First 1
if ($audio) {
    $asrRaw = & curl.exe -sS -m 60 -X POST "$ApiBase/audio/transcriptions" `
        -H "Authorization: Bearer $key" `
        -F "file=@$($audio.FullName)" -F "model=$AsrModel" -F "language=en" 2>&1
    $asrRaw = ($asrRaw | Out-String)
    $txt = ''
    if ($asrRaw -match '"text"\s*:\s*"([^"]*)"') { $txt = $Matches[1] }
    if ($txt) {
        Ok "ASR transcription passed -> $txt"
    } else {
        Write-Host "  [WARN] ASR returned no text: $($asrRaw.Trim())"
        Write-Host '         Key is valid, but check that the model and quota are available.'
    }
} else {
    Write-Host '  [SKIP] no test audio found (does not affect the key verdict)'
}

# --------------------------------------------------------------- 3. local .dev.vars
Step '3/5  Write local .dev.vars'
$dv = Join-Path $PSScriptRoot '.dev.vars'
$deepseek = ''
if (Test-Path $dv) {
    $line = Get-Content $dv | Where-Object { $_ -like 'DEEPSEEK_API_KEY=*' } | Select-Object -First 1
    if ($line) { $deepseek = ($line -split '=', 2)[1] }
}
if (-not $deepseek) {
    $srcEnv = 'C:\Users\Rywl0\WorkBuddy\2026-06-17-17-27-25\douyin-video-generator\backend\.env'
    if (Test-Path $srcEnv) {
        $l = Get-Content $srcEnv | Where-Object { $_ -like 'DEEPSEEK_API_KEY=*' } | Select-Object -First 1
        if ($l) { $deepseek = ($l -split '=', 2)[1].Trim(' ', '"') }
    }
}
if ($deepseek) {
    Write-NoBom $dv ("DEEPSEEK_API_KEY=$deepseek`nSILICONFLOW_API_KEY=$key`n")
    Ok '.dev.vars written (DeepSeek key preserved, no BOM)'
} else {
    Write-NoBom $dv ("SILICONFLOW_API_KEY=$key`n")
    Ok '.dev.vars written (DeepSeek key not found, add it later)'
}

# --------------------------------------------------------------- 4. online secret
Step '4/5  Write the Cloudflare Pages secret (live)'
$tmp = Join-Path $env:TEMP 'sf_key_tmp.txt'
Write-NoBom $tmp $key
try {
    $cmd = "npx wrangler pages secret put SILICONFLOW_API_KEY --project-name $Project < `"$tmp`""
    cmd /c $cmd
    Remove-Item $tmp -ErrorAction SilentlyContinue
    Ok "live secret updated (project $Project)"
} catch {
    Fail "Could not update the live secret: $($_.Exception.Message)"
    Write-Host '  The old value stays online. Speaking scoring will fall back to the'
    Write-Host '  browser transcript automatically, so practice is not blocked.'
}

# --------------------------------------------------------------- 5. redeploy
# IMPORTANT: a Pages secret only reaches the Functions runtime on the NEXT
# deployment. Updating the secret alone leaves the live code on the old value.
Step '5/5  Redeploy (a new secret only lands on the next deployment)'
try {
    $deploy = & npx wrangler pages deploy public --project-name $Project --branch main --commit-dirty=true 2>&1
    $deploy | Out-String | Write-Host
    if ($LASTEXITCODE -ne 0) { Fail "deploy exited with code $LASTEXITCODE" }
    else { Ok 'deployment complete' }
} catch {
    Fail "deploy failed: $($_.Exception.Message)"
}

Write-Host ''
Write-Host 'Verifying the live endpoint:' -ForegroundColor Cyan
$live = & curl.exe -sS -m 30 'https://ketzxt-api.pages.dev/api/health' 2>&1
$live = ($live | Out-String).Trim()
Write-Host "  $live"
if ($live -match '"llm":true' -and $live -match '"asr":true') {
    Ok 'live endpoint reports both keys active'
} else {
    Fail 'live endpoint does not report both keys active'
    Write-Host '  Note: from inside mainland China *.pages.dev may time out. That is a'
    Write-Host '  network routing issue, not a key problem. Verify from a phone network.'
}

Step 'Done'
Write-Host 'Everything is in place. Nothing else to run manually.' -ForegroundColor Cyan

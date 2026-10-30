# 一次性脚本：校验并配置 SiliconFlow API Key
#
# 为什么需要这个脚本：
#   Key 如果经过聊天窗口传递，可能因截图 OCR 认错字符、或被宿主的密钥保护机制改写，
#   导致「明明是对的 Key 却报 Token is invalid」。
#   在你自己的终端里粘贴原 Key，可以绕过整条中间链路 —— 终端 -> wrangler 直达。
#
# 用法（PowerShell）：
#   cd C:\Users\Rywl0\WorkBuddy\KETZXT-fresh\worker
#   powershell -ExecutionPolicy Bypass -File .\setup-sf-key.ps1
#
# 脚本做 4 件事，任何一步失败会停下并明确报告：
#   1. 验证 Key 有效性（models 端点 + 真实英语音频 ASR 转写）
#   2. 写入本地 .dev.vars（供 wrangler pages dev 使用）
#   3. 写入 Cloudflare Pages Secret（线上生效）
#   4. 打印前端需要确认的信息

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$ApiBase  = 'https://api.siliconflow.cn/v1'
$Project  = 'ketzxt-api'
$AsrModel = 'FunAudioLLM/SenseVoiceSmall'

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

# ---------------------------------------------------------------- 1. 读取 Key
Step '1/4  读取 SiliconFlow API Key'
Write-Host '请粘贴 Key（形如 sk-...，粘贴后直接回车）' -ForegroundColor Yellow
$key = (Read-Host).Trim()
if (-not $key) { Fail '没有读到内容，已中止'; exit 1 }
Write-Host ("  长度 {0}，前缀 {1}..." -f $key.Length, $key.Substring(0, [Math]::Min(8, $key.Length)))
if (-not $key.StartsWith('sk-')) { Fail '不是 sk- 开头的 Key'; exit 1 }

# ---------------------------------------------------------------- 2. 验证
Step '2/4  验证 Key 有效性'
try {
    $h = @{ Authorization = "Bearer $key" }
    $models = Invoke-RestMethod -Uri "$ApiBase/models" -Headers $h -TimeoutSec 30
    Ok "models 端点通过（可用模型 {0} 个）" -f $models.data.Count
} catch {
    Fail "models 端点失败：$($_.Exception.Message)"
    Fail '该 Key 在 SiliconFlow 服务端不被认可。请到控制台确认：'
    Write-Host '     1) 实名认证状态（未实名 = 无法调用任何模型）' -ForegroundColor Yellow
    Write-Host '     2) API 密钥列表里该 Key 是否为「启用」状态' -ForegroundColor Yellow
    Write-Host '     3) 创建 Key 时是否误填了 IP 白名单' -ForegroundColor Yellow
    exit 1
}

# 用项目自带的真实教材音频测 ASR（比合成音更能说明问题）
$audio = Get-ChildItem -Path '..\ket-app\public\audio\*.mp3' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($audio) {
    try {
        $form = @{
            file   = Get-Item $audio.FullName
            model  = $AsrModel
            language = 'en'
        }
        $r = Invoke-RestMethod -Uri "$ApiBase/audio/transcriptions" -Method Post -Headers $h -Form $form -TimeoutSec 60
        if ($r.text) { Ok "ASR 转写通过 -> `"$($r.text)`"" } else { Fail "ASR 返回空文本（Key 有效但没识别出内容）" }
    } catch {
        Fail "ASR 转写失败：$($_.Exception.Message)"
    }
} else {
    Write-Host '  [跳过] 没找到测试音频（不影响 Key 有效性结论）' -ForegroundColor DarkGray
}

# ---------------------------------------------------------------- 3. 本地 .dev.vars
Step '3/4  写入本地 .dev.vars'
$deepseek = ''
$dv = Join-Path $PSScriptRoot '.dev.vars'
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
    Set-Content -Path $dv -Value "DEEPSEEK_API_KEY=$deepseek`nSILICONFLOW_API_KEY=$key" -Encoding utf8
    Ok "已写入 .dev.vars（DeepSeek Key 一并保留）"
} else {
    Set-Content -Path $dv -Value "SILICONFLOW_API_KEY=$key" -Encoding utf8
    Ok "已写入 .dev.vars（未找到 DeepSeek Key，可稍后单独补）"
}

# ---------------------------------------------------------------- 4. 线上 Secret
Step '4/4  写入 Cloudflare Pages Secret（线上生效）'
try {
    $key | npx wrangler pages secret put SILICONFLOW_API_KEY --project-name $Project 2>&1 | Out-String | Write-Host
    Ok "线上 Secret 已更新（项目 $Project）"
} catch {
    Fail "写入线上 Secret 失败：$($_.Exception.Message)"
    Write-Host '  线上仍是旧值 —— 口语的云端转写会自动降级到浏览器识别，不影响做题。' -ForegroundColor Yellow
}

Step '完成'
Write-Host '接下来：' -ForegroundColor Cyan
Write-Host '  1) 重新部署（让新 Secret 生效）：' -ForegroundColor White
Write-Host '       npx wrangler pages deploy public --project-name ketzxt-api --branch main --commit-dirty=true'
Write-Host '  2) 验证线上：' -ForegroundColor White
Write-Host '       curl https://ketzxt-api.pages.dev/api/health'
Write-Host '  （预期 asr:true / speechMode:cloud-asr）' -ForegroundColor DarkGray

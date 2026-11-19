<#
.SYNOPSIS
歌颂之丘 — 独立区域调色插件 Windows PowerShell 零依赖备用服务 (tools/tuner/server.ps1)
当本机未安装 Python 时由 start-tuner.bat 自动回退调用。
#>

param(
  [int]$PreferredPort = 8765,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$PluginDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = [System.IO.Path]::GetFullPath((Join-Path $PluginDir "..\.."))
$ThemeCssPath = Join-Path $RootDir "css\theme.css"

$MimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
  ".json" = "application/json; charset=utf-8"
}

$Listener = $null
$Port = $PreferredPort
for ($p = $PreferredPort; $p -lt ($PreferredPort + 26); $p++) {
  $candidate = New-Object System.Net.HttpListener
  $candidate.Prefixes.Add("http://127.0.0.1:$p/")
  try {
    $candidate.Start()
    $Listener = $candidate
    $Port = $p
    break
  } catch {
    $candidate.Close()
  }
}

if (-not $Listener) {
  Write-Error "无法在 127.0.0.1 绑定端口 $PreferredPort..$($PreferredPort + 25)。"
  exit 1
}

$Url = "http://127.0.0.1:$Port/"
Write-Host "============================================================"
Write-Host "  歌颂之丘 — 独立区域调色插件已启动 (PowerShell 备用服务)"
Write-Host "  预览地址: $Url"
Write-Host "  按 Ctrl+C 可随时停止服务"
Write-Host "============================================================"

if (-not $NoBrowser) {
  Start-Process $Url
}

function Send-Bytes($Resp, [byte[]]$Bytes, [string]$ContentType, [int]$Status = 200, [bool]$HeadOnly = $false) {
  $Resp.StatusCode = $Status
  $Resp.ContentType = $ContentType
  $Resp.Headers["Cache-Control"] = "no-store"
  $Resp.ContentLength64 = $Bytes.Length
  if (-not $HeadOnly) {
    $Resp.OutputStream.Write($Bytes, 0, $Bytes.Length)
  }
  $Resp.OutputStream.Close()
}

try {
  while ($Listener.IsListening) {
    $ctx = $Listener.GetContext()
    $req = $ctx.Request
    $resp = $ctx.Response
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)

    if ($req.HttpMethod -eq "POST" -and $path -eq "/__tuner/save-theme") {
      $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
      $body = $reader.ReadToEnd()
      $reader.Close()
      if ($body.Contains(":root") -and $body.Contains("--panel-glass-bg") -and $body.Length -le 262144) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($ThemeCssPath, $body, $utf8NoBom)
        $json = "{`"ok`":true,`"bytes`":$([System.Text.Encoding]::UTF8.GetByteCount($body))}"
        Send-Bytes $resp ([System.Text.Encoding]::UTF8.GetBytes($json)) "application/json; charset=utf-8" 200
      } else {
        $json = '{"ok":false,"error":"Invalid payload"}'
        Send-Bytes $resp ([System.Text.Encoding]::UTF8.GetBytes($json)) "application/json; charset=utf-8" 400
      }
      continue
    }

    $headOnly = ($req.HttpMethod -eq "HEAD")
    if ($path -eq "/" -or $path -eq "/index.html") {
      $indexPath = Join-Path $RootDir "index.html"
      $html = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
      $headTag = "  <link rel=`"stylesheet`" href=`"/__tuner/tuner.css?v=4`" />`n"
      $bodyTag = "  <script>window.__SH_TUNER_PLUGIN__ = { canWriteTheme: true };</script>`n  <script src=`"/__tuner/tuner.js?v=4`"></script>`n"
      $html = [regex]::Replace($html, "(?i)</head>", ($headTag + "`$0"), 1)
      $html = [regex]::Replace($html, "(?i)</body>", ($bodyTag + "`$0"), 1)
      Send-Bytes $resp ([System.Text.Encoding]::UTF8.GetBytes($html)) "text/html; charset=utf-8" 200 $headOnly
      continue
    }

    if ($path -eq "/__tuner/tuner.css" -or $path -eq "/__tuner/tuner.js") {
      $name = $path.Substring("/__tuner/".Length)
      $assetPath = Join-Path $PluginDir $name
      $ctype = if ($name.EndsWith(".css")) { "text/css; charset=utf-8" } else { "application/javascript; charset=utf-8" }
      Send-Bytes $resp ([System.IO.File]::ReadAllBytes($assetPath)) $ctype 200 $headOnly
      continue
    }

    $rel = $path.TrimStart("/").Replace("/", "\")
    $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $RootDir $rel))
    if (-not $candidatePath.StartsWith($RootDir, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($candidatePath)) {
      Send-Bytes $resp ([System.Text.Encoding]::UTF8.GetBytes("Not Found")) "text/plain; charset=utf-8" 404 $headOnly
      continue
    }
    $ext = [System.IO.Path]::GetExtension($candidatePath).ToLowerInvariant()
    if ($ext -in @(".py", ".ps1", ".bat", ".cmd")) {
      Send-Bytes $resp ([System.Text.Encoding]::UTF8.GetBytes("Forbidden")) "text/plain; charset=utf-8" 403 $headOnly
      continue
    }
    $mime = if ($MimeMap.ContainsKey($ext)) { $MimeMap[$ext] } else { "application/octet-stream" }
    Send-Bytes $resp ([System.IO.File]::ReadAllBytes($candidatePath)) $mime 200 $headOnly
  }
} finally {
  $Listener.Stop()
  $Listener.Close()
}

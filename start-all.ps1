# PDF Maker - Launcher
$projectRoot = "D:\KIMI\pdf-maker"

# Robust IP Discovery
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.254\.' 
    } | Select-Object -First 1 -ExpandProperty IPAddress)

if (-not $localIp) { $localIp = "localhost" }

Write-Host "`n  =========================================" -ForegroundColor Cyan
Write-Host "    PDF Maker - Starting All Services" -ForegroundColor Cyan
Write-Host "    LAN URL: http://$localIp:5173" -ForegroundColor Green
Write-Host "  =========================================" -ForegroundColor Cyan

# 1. Start MongoDB
Write-Host "`n  [1/3] Starting MongoDB..." -ForegroundColor Yellow
$mongoExe = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$mongoData = "$projectRoot\mongodata"
if (-not (Test-Path $mongoData)) { 
    Write-Host "  Creating mongodata directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $mongoData -Force | Out-Null 
}

# Check if MongoDB is already running on 27017
$portCheck = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "  MongoDB (or another service) is already running on port 27017." -ForegroundColor Gray
}
else {
    if (Test-Path $mongoExe) {
        Start-Process "cmd.exe" -ArgumentList "/k", "color 0B && title MongoDB && `"$mongoExe`" --dbpath `"$mongoData`" --port 27017"
    }
    else {
        Write-Host "  WARNING: mongod.exe not found at $mongoExe" -ForegroundColor Red
        Write-Host "  Please ensure MongoDB is installed or update the path in start-all.ps1" -ForegroundColor White
    }
}

# 2. Start Backend
Write-Host "  [2/3] Starting Backend API..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k", "color 0E && title Backend API && cd /d `"$projectRoot\backend`" && npm run dev"

# 3. Start Frontend
Write-Host "  [3/3] Starting Frontend..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k", "color 0D && title Frontend && cd /d `"$projectRoot\frontend`" && npm run dev"

Write-Host "`n  Services are starting in new windows." -ForegroundColor Green
Write-Host "  Opening app locally: http://localhost:5173" -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Try to open the URL
try {
    Start-Process "http://localhost:5173"
}
catch {
    Write-Host "  Could not open browser automatically. Please visit http://localhost:5173" -ForegroundColor Red
}

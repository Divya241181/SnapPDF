# PDF Maker — Start All Services
# Run this script from the project root:
#   powershell -ExecutionPolicy Bypass -File start-all.ps1

$Host.UI.RawUI.WindowTitle = "PDF Maker Launcher"

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host "    PDF Maker - Starting All Services" -ForegroundColor Cyan
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""

# -----------------------------------------------
# Paths
# -----------------------------------------------
$projectRoot  = "D:\KIMI\pdf-maker"
$mongoData    = "$projectRoot\mongodata"
$mongoExe     = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$backendDir   = "$projectRoot\backend"
$frontendDir  = "$projectRoot\frontend"

# -----------------------------------------------
# Step 1: Start MongoDB
# -----------------------------------------------
Write-Host "  [1/3] Starting MongoDB..." -ForegroundColor Yellow
if (-not (Test-Path $mongoData)) {
    New-Item -ItemType Directory -Path $mongoData | Out-Null
    Write-Host "        Created mongodata directory." -ForegroundColor Gray
}

if (Test-Path $mongoExe) {
    Start-Process "cmd.exe" -ArgumentList "/k", "color 0B && title MongoDB (Port 27017) && `"$mongoExe`" --dbpath `"$mongoData`" --port 27017" -WindowStyle Normal
    Write-Host "  [1/3] MongoDB window opened." -ForegroundColor Green
} else {
    Write-Host "  [!] mongod.exe not found at: $mongoExe" -ForegroundColor Red
    Write-Host "      Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Red
}

Start-Sleep -Seconds 3

# -----------------------------------------------
# Step 2: Start Backend
# -----------------------------------------------
Write-Host "  [2/3] Starting Backend API..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k", "color 0E && title Backend API (Port 5000) && cd /d `"$backendDir`" && npm.cmd run dev" -WindowStyle Normal
Write-Host "  [2/3] Backend window opened." -ForegroundColor Green

Start-Sleep -Seconds 3

# -----------------------------------------------
# Step 3: Start Frontend
# -----------------------------------------------
Write-Host "  [3/3] Starting Frontend Dev Server..." -ForegroundColor Yellow
Start-Process "cmd.exe" -ArgumentList "/k", "color 0D && title Frontend (Port 5173) && cd /d `"$frontendDir`" && npm.cmd run dev" -WindowStyle Normal
Write-Host "  [3/3] Frontend window opened." -ForegroundColor Green

# Wait for Vite to boot, then open browser
Start-Sleep -Seconds 5

# -----------------------------------------------
# Open Browser
# -----------------------------------------------
Write-Host ""
Write-Host "  Opening app in your default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host "    All services are up!" -ForegroundColor Green
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   MongoDB   :  mongodb://127.0.0.1:27017" -ForegroundColor White
Write-Host "   Backend   :  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend  :  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Close the 3 opened terminal windows to stop all services." -ForegroundColor Gray
Write-Host ""
Read-Host "  Press Enter to close this launcher window"

@echo off
setlocal enabledelayedexpansion

:: Change directory to where the batch script is located
cd /d "%~dp0"

echo ====================================================
echo         Snap PDF - Dev Server + Tunnel
echo ====================================================

:: 1. Start Backend
echo.
echo [1/4] Starting Backend (Port 5000)...
start "Snap PDF Backend" cmd /c "cd backend && title Snap PDF Backend && npm run dev"

:: Small delay to stagger startups
timeout /t 2 /nobreak >nul

:: 2. Start Frontend
echo [2/4] Starting Frontend (Port 5173)...
start "Snap PDF Frontend" cmd /c "cd frontend && title Snap PDF Frontend && npm run dev"

:: Wait for dev server to initialize
echo Waiting for Frontend to be ready...
timeout /t 5 /nobreak >nul

:: 3. Setup Cloudflared
echo.
echo [3/4] Checking for Cloudflare Tunnel (cloudflared)...
if not exist "cloudflared.exe" (
    echo Downloading cloudflared.exe...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
    if not exist "cloudflared.exe" (
        echo [ERROR] Failed to download cloudflared.exe. Tunnel will not be started.
        pause
        exit /b 1
    )
)

:: 4. Start Tunnel
echo.
echo [4/4] Starting Cloudflare Tunnel...
if exist "tunnel.log" del tunnel.log

:: Start cloudflared and redirect stderr and stdout to log
:: cloudflared outputs mostly to stderr
start "Cloudflare Tunnel" cmd /k "title Cloudflare Tunnel && cloudflared.exe tunnel --url http://127.0.0.1:5173 > tunnel.log 2>&1"

echo Waiting for Cloudflare Tunnel URL...
set "TUNNEL_URL="
set "RETRY_COUNT=0"

:CHECK_URL
timeout /t 2 /nobreak >nul
set /a RETRY_COUNT+=1

:: First, use findstr (which doesn't heavily lock the file) to see if the URL is there
findstr "trycloudflare.com" tunnel.log >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    :: URL found! Now use powershell to extract just the link safely
    for /f "delims=" %%I in ('powershell -Command "$c = [System.IO.File]::ReadAllText('tunnel.log'); if ($c -match '(https://[a-zA-Z0-9-]+\.trycloudflare\.com)') { $matches[1] }"') do (
        set "TUNNEL_URL=%%I"
    )
)

if not "%TUNNEL_URL%"=="" (
    echo.
    echo ====================================================
    echo SUCCESS! Tunnel is active.
    echo.
    echo Local URL:   http://127.0.0.1:5173
    echo Tunnel URL:  %TUNNEL_URL%
    echo.
    echo Copy the Tunnel URL to test on other devices!
    echo ====================================================
    goto :DONE
)

if %RETRY_COUNT% LSS 30 (
    goto :CHECK_URL
)

:: If we reached here, it failed.
echo.
echo [ERROR] Failed to get Cloudflare Tunnel URL after 60 seconds.
echo Please check tunnel.log for more details.
echo Possible issues: 
echo - Cloudflare might be blocked by your network.
echo - The cloudflared service encountered an error.
echo - Port 5173 might not be ready yet.

:DONE
echo.
echo Both services and tunnel are launched.
echo Close the newly opened windows to stop them.
echo Press any key to exit this script.
pause >nul

@echo off
title PDF Maker - Starting All Services
color 0A

echo.
echo  =========================================
echo    PDF Maker - Starting All Services
echo  =========================================
echo.

:: -----------------------------------------------
:: Step 1: Start MongoDB
:: -----------------------------------------------
echo  [1/3] Starting MongoDB on port 27017...
if not exist "D:\KIMI\pdf-maker\mongodata" (
    mkdir "D:\KIMI\pdf-maker\mongodata"
    echo       Created mongodata directory.
)
start "MongoDB" cmd /k "color 0B && title MongoDB && echo  MongoDB is running on port 27017... && \"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe\" --dbpath \"D:\KIMI\pdf-maker\mongodata\" --port 27017"
echo  [1/3] MongoDB window opened.

:: Wait a moment for MongoDB to start
timeout /t 3 /nobreak >nul

:: -----------------------------------------------
:: Step 2: Start Backend
:: -----------------------------------------------
echo  [2/3] Starting Backend API on port 5000...
start "Backend API" cmd /k "color 0E && title Backend API (Port 5000) && cd /d D:\KIMI\pdf-maker\backend && npm.cmd run dev"
echo  [2/3] Backend window opened.

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: -----------------------------------------------
:: Step 3: Start Frontend
:: -----------------------------------------------
echo  [3/3] Starting Frontend on port 5173...
start "Frontend (Vite)" cmd /k "color 0D && title Frontend Dev Server (Port 5173) && cd /d D:\KIMI\pdf-maker\frontend && npm.cmd run dev"
echo  [3/3] Frontend window opened.

:: Wait for frontend to boot, then open browser
timeout /t 5 /nobreak >nul

:: -----------------------------------------------
:: Open Browser
:: -----------------------------------------------
echo.
echo  Opening app in your default browser...
start "" "http://localhost:5173"

echo.
echo  =========================================
echo    All services started successfully!
echo  =========================================
echo.
echo   MongoDB   :  mongodb://127.0.0.1:27017
echo   Backend   :  http://localhost:5000
echo   Frontend  :  http://localhost:5173
echo.
echo   3 separate terminal windows are open.
echo   Close them individually to stop services.
echo.
pause

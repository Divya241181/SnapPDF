@echo off
title PDF Maker - Stopping All Services
color 0C

echo.
echo  =========================================
echo    PDF Maker - Stopping All Services
echo  =========================================
echo.

echo  Stopping Node.js processes (backend + frontend)...
taskkill /F /IM node.exe >nul 2>&1
echo  [OK] Node.js processes terminated.

echo  Stopping MongoDB...
taskkill /F /IM mongod.exe >nul 2>&1
echo  [OK] MongoDB terminated.

echo.
echo  All services stopped.
echo.
pause

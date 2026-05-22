@echo off
title Terrai Portal Launcher
echo ================================================================
echo      STARTING TERRAI SERVICES...
echo ================================================================
echo.

:: Start Backend dev server in a new terminal window
echo [1/3] Launching Backend Database Server...
start "Terrai Backend Server" cmd /k "cd /d c:\Users\amrat\OneDrive\Desktop\MINES MANAGEMENT PROJECT\backend && npm run dev"

:: Start Frontend dev server in a new terminal window
echo [2/3] Launching Frontend UI Dashboard...
start "Terrai Frontend Server" cmd /k "cd /d c:\Users\amrat\OneDrive\Desktop\MINES MANAGEMENT PROJECT\frontend && npm run dev"

echo.
echo Waiting 5 seconds for services to initialize...
timeout /t 5 >nul

:: Open browser portal automatically
echo [3/3] Launching Browser Console Portal...
start http://localhost:3000

echo.
echo ================================================================
echo      SERVICES BOOTED SUCCESSFULLY! 
echo      You can close this command window.
echo ================================================================
exit

@echo off
title SubsMarket Launcher
echo ==========================================
echo   SubsMarket 2.0 - One-Click Launcher
echo ==========================================
echo.

echo [1/3] Starting Backend Server (FastAPI)...
start "SubsMarket Backend" cmd /k "cd backend && uvicorn src.main:app --reload --port 8000"

echo [2/3] Starting Frontend Server (Vite)...
start "SubsMarket Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening Application in Browser...
start http://localhost:5173

echo.
echo ==========================================
echo   Success! App is running.
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:5173
echo ==========================================
echo.
pause

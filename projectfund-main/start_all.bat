@echo off
echo Starting ProjectFund Application...
echo.

:: Start Backend
echo [1/2] Starting Django Backend...
start "Django Backend" cmd /k "cd backend && C:\Users\prath\AppData\Local\Programs\Python\Python311\python.exe manage.py runserver --noreload --skip-checks"
timeout /t 5 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ProjectFund Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul

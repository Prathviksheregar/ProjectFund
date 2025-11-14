@echo off
REM Start Both Backend and Frontend Servers

echo ╔════════════════════════════════════════════════════════════╗
echo ║     PROJECTFUND - START BOTH SERVERS                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/2] Starting Backend Server on port 8000...
start "ProjectFund Backend" cmd /k "cd /d c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend && C:/Users/prath/AppData/Local/Programs/Python/Python313/python.exe manage.py runserver 8000"

timeout /t 3 /nobreak
echo.
echo [2/2] Starting Frontend Server on port 3000...
start "ProjectFund Frontend" cmd /k "cd /d c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend && npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Both servers should open in new windows                   ║
echo ║  Backend:  http://localhost:8000                           ║
echo ║  Frontend: http://localhost:3000                           ║
echo ║  Dashboard: http://localhost:3000/dashboard                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
timeout /t 5

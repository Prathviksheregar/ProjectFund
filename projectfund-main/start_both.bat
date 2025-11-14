@echo off
REM Start Backend Server
echo Starting Django Backend Server on port 8000...
start "Django Backend" cmd /k "cd /d c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend && C:\Users\prath\AppData\Local\Programs\Python\Python311\python.exe manage.py runserver 0.0.0.0:8000"

timeout /t 3

REM Start Frontend Server
echo Starting Next.js Frontend Server on port 3000...
start "Next.js Frontend" cmd /k "cd /d c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend && npm run dev -- --port 3000"

timeout /t 3

echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo Admin: http://localhost:3000/admin
pause

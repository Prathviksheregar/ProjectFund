@echo off
cd /d "%~dp0"
echo Starting Django Backend Server...
echo.
echo Port: 8000
echo URL: http://127.0.0.1:8000/api/
echo.
echo Endpoint: POST /api/stage-report/analyze/
echo.
echo Press Ctrl+C to stop
echo.
python manage.py runserver 8000
pause

# 🎯 BACKEND STARTUP COMMAND - Quick Reference

## The Exact Command to Run Backend

```powershell
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend
C:/Users/prath/AppData/Local/Programs/Python/Python313/python.exe manage.py runserver 8000
```

---

## Copy-Paste Ready Commands

### Option 1: Direct Command (PowerShell)
```powershell
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend; C:/Users/prath/AppData/Local/Programs/Python/Python313/python.exe manage.py runserver 8000
```

### Option 2: Using Batch File
```batch
c:\Users\prath\Downloads\projectfund-main\projectfund-main\start_backend.bat
```

### Option 3: Start Both Backend + Frontend
```batch
c:\Users\prath\Downloads\projectfund-main\projectfund-main\start_all_servers.bat
```

---

## Expected Output When Running

```
Watching for file changes with StatReloader
Performing system checks...

Warning: OPENAI_API_KEY not set, using mock verification
System check identified no issues (0 silenced).
November 14, 2025 - 12:XX:XX
Django version 5.1.7, using settings 'backend.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

---

## Access Backend

Once running, visit:
- **Backend API:** http://localhost:8000/api/
- **Stage Report Endpoint:** http://localhost:8000/api/stage-report/analyze/
- **Health Check:** http://localhost:8000/

---

## Running Frontend Simultaneously

In a **separate terminal**:
```powershell
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend
npm run dev
```

Then access:
- **Frontend:** http://localhost:3000/dashboard

---

## Verify Backend is Running

```powershell
netstat -ano | findstr ":8000"
```

Should show: `LISTENING`

---

## Stop Backend

Press: `Ctrl + C` in the terminal

---

**That's it! Use the first command above to run the backend on port 8000.**

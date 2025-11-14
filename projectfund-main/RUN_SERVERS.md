# 🚀 How to Run ProjectFund

## Quick Start - Run Both Servers at Once

**Option 1: Use Batch File (Recommended for Windows)**
```batch
c:\Users\prath\Downloads\projectfund-main\projectfund-main\start_all_servers.bat
```
This will automatically open TWO command windows:
- One for Backend (port 8000)
- One for Frontend (port 3000)

---

## Manual Commands

### Backend (Django) - Port 8000

**In PowerShell/CMD:**
```batch
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend
C:/Users/prath/AppData/Local/Programs/Python/Python313/python.exe manage.py runserver 8000
```

**Or use the batch file:**
```batch
c:\Users\prath\Downloads\projectfund-main\projectfund-main\start_backend.bat
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
```

---

### Frontend (Next.js) - Port 3000

**In PowerShell/CMD:**
```batch
cd c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend
npm run dev
```

**Or use the batch file:**
```batch
c:\Users\prath\Downloads\projectfund-main\projectfund-main\start_frontend.bat
```

**Expected Output:**
```
- Local: http://localhost:3000
✓ Ready in X.Xs
```

---

## Access the Application

Once both servers are running:

- **Dashboard:** http://localhost:3000/dashboard
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:3000/admin

---

## Verify Servers are Running

**Check Backend (port 8000):**
```powershell
netstat -ano | findstr ":8000"
```

**Check Frontend (port 3000):**
```powershell
netstat -ano | findstr ":3000"
```

Both should show **LISTENING** status.

---

## Stop Servers

- **Backend:** Press `Ctrl+C` in the backend window
- **Frontend:** Press `Ctrl+C` in the frontend window

---

## Troubleshooting

### Backend Won't Start
- Ensure you're in the backend directory
- Check Python is installed: `python --version`
- Try: `pip install -r requirements.txt`

### Frontend Won't Start
- Ensure you're in the frontend directory
- Check Node is installed: `node --version`
- Try: `npm install`

### Port Already in Use
- Backend port 8000: `netstat -ano | findstr ":8000"` then kill the process
- Frontend port 3000: `netstat -ano | findstr ":3000"` then kill the process

---

## Environment Setup

The system is configured to use:
- **Python:** C:/Users/prath/AppData/Local/Programs/Python/Python313/python.exe
- **Node:** Installed globally

If you see Python errors, run:
```batch
pip install -r requirements.txt
```

---

**Status:** ✅ Ready to run

# 🎯 ProjectFund - Quick Command Reference

## ⚡ Super Quick Start (Recommended)

### Windows PowerShell
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main"
.\start_both.bat
```

**That's it!** 🚀
- Backend will start on http://localhost:8000
- Frontend will start on http://localhost:3000
- Both will stay running
- Press any key to close when done

---

## 🔧 Manual Start (If Batch File Doesn't Work)

### Terminal 1 - Backend
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend"
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2 - Frontend  
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend"
npm run dev -- --port 3000
```

---

## ✅ Verify Everything is Running

### Check Both Ports
```powershell
netstat -ano | Select-String ":3000|:8000"
```

You should see:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
```

### Test Backend API
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/proposals/" -UseBasicParsing
```

Should return: `StatusCode: 200`

### Test Frontend
```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

Should return: `StatusCode: 200`

---

## 🌐 Access Your Application

Open in browser:

| Purpose | URL |
|---------|-----|
| Main Dashboard | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| API Docs | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 📊 Useful Queries

### List All Proposals
```powershell
curl http://localhost:8000/api/proposals/
```

### Get Statistics
```powershell
curl http://localhost:8000/api/stats/
```

### Check User Transactions
```powershell
curl http://localhost:8000/api/transactions/ `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛑 Stop Services

### Method 1: Kill Specific Ports
```powershell
# Stop backend
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Stop frontend
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Method 2: Kill All Node Processes
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Method 3: Kill All Python Processes
```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 🔄 Database Commands

### Run Migrations
```powershell
cd backend
python manage.py migrate
```

### Create Superuser
```powershell
python manage.py createsuperuser
```

### Access Django Shell
```powershell
python manage.py shell
```

### Backup Database
```powershell
Copy-Item "backend/db.sqlite3" "backend/db.sqlite3.backup"
```

---

## 📦 Install/Update Dependencies

### Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### Frontend Dependencies
```powershell
cd frontend
npm install
```

---

## 🧹 Clean & Rebuild

### Clean Frontend Build
```powershell
cd frontend
Remove-Item -Recurse -Force .next
npm install
npm run build
```

### Reset Database
```powershell
cd backend
Remove-Item db.sqlite3
python manage.py migrate
```

---

## 🐛 Troubleshooting Commands

### Check if Ports are Free
```powershell
netstat -ano | Select-String ":8000"
netstat -ano | Select-String ":3000"
```

### View Backend Logs
```powershell
cd backend
python manage.py runserver --verbosity 2
```

### Check Frontend Build
```powershell
cd frontend
npm run build -- --verbose
```

### View Python Version
```powershell
python --version
```

### View Node Version
```powershell
node --version
npm --version
```

---

## 💡 Common Issues & Solutions

### Issue: Port Already in Use
```powershell
# Kill process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

### Issue: Module Not Found
```powershell
# Reinstall
pip install -r requirements.txt
npm install
```

### Issue: Database Locked
```powershell
# Restart services and retry
```

### Issue: CORS Error
```powershell
# Verify backend is running
netstat -ano | Select-String ":8000"
```

---

## 📝 Project Structure

```
c:\Users\prath\Downloads\projectfund-main\projectfund-main\
├── backend/                  ← Django API server
├── frontend/                 ← Next.js frontend
├── smart-contracts/          ← Solidity contracts
├── start_both.bat            ← Main startup script
├── start_frontend.bat        ← Frontend only
└── SETUP_COMPLETE.md         ← Full documentation
```

---

## 🎯 Common Workflows

### Create a Proposal (Via API)
```powershell
$body = @{
    description = "Community Park"
    recipient_address = "0x1234..."
    total_amount = "10.5"
    total_stages = 3
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/proposals/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Vote on a Proposal
```powershell
$body = @{
    support = $true
    tx_hash = "0xabc123..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/proposals/1/vote/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

### Fund a Proposal
```powershell
$body = @{
    amount = "5.0"
    tx_hash = "0xdef456..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/proposals/1/fund/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

---

## 🚀 Final Checklist

Before deploying to production:

- [ ] Both services running
- [ ] API responding with 200 status
- [ ] Frontend displaying correctly
- [ ] Database populated with test data
- [ ] Smart contracts deployed (if needed)
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Security verified

---

## 📱 Example API Response

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "proposal_id": 1,
      "description": "Community Park Project",
      "recipient_address": "0x742d35Cc6634C0532925a3b844Bc7e7595f6bEb9",
      "total_amount": "10.50",
      "current_amount": "3.20",
      "state": 2,
      "state_display": "PublicVoting",
      "current_stage": 1,
      "total_stages": 3,
      "created_at": "2025-11-12T10:30:00Z",
      "creator_username": "0x742d35Cc6634C0532925a3b844Bc7e7595f6bEb9",
      "votes_count": 45,
      "funders_count": 12,
      "total_funded": "3.2",
      "progress_percentage": 30.48
    }
  ]
}
```

---

**Ready to go!** 🎉
Start with: `.\start_both.bat`

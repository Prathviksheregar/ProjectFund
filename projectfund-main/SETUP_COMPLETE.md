# ProjectFund - Complete Setup & Usage Guide

## ✅ System Status

### Running Services
- **Backend API**: http://localhost:8000 (Django 5.1.7)
- **Frontend**: http://localhost:3000 (Next.js 14.2.32)
- **Database**: SQLite (db.sqlite3)

### Verified Components
- ✅ Django models created (Proposal, Vote, Funding, UserProfile, Transaction, etc.)
- ✅ Database migrations applied
- ✅ RESTful API endpoints configured
- ✅ Frontend fixed ("use client" directive)
- ✅ Both servers running and responding

---

## 🚀 Quick Start

### Option 1: Run Everything in One Command
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main"
.\start_both.bat
```

This starts:
- Django Backend on `http://localhost:8000`
- Next.js Frontend on `http://localhost:3000`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main\backend"
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\prath\Downloads\projectfund-main\projectfund-main\frontend"
npm run dev -- --port 3000
```

---

## 📍 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend Main | http://localhost:3000 | Public fund management dashboard |
| Frontend Admin | http://localhost:3000/admin | Admin panel |
| API Proposals | http://localhost:8000/api/proposals/ | List all proposals |
| API Docs | http://localhost:8000/api/ | API documentation |
| Admin Dashboard | http://localhost:8000/admin/ | Django admin panel |

---

## 🔑 Default Credentials

**Django Admin:**
- URL: http://localhost:8000/admin/
- Username: `admin`
- Password: Create via: `python manage.py createsuperuser`

---

## 📊 API Endpoints

### Proposals
```
GET    /api/proposals/              # List all proposals
POST   /api/proposals/              # Create new proposal
GET    /api/proposals/{id}/         # Get proposal details
POST   /api/proposals/{id}/vote/    # Vote on proposal
POST   /api/proposals/{id}/fund/    # Fund proposal
GET    /api/proposals/{id}/votes/   # Get proposal votes
GET    /api/proposals/{id}/fundings/ # Get proposal fundings
GET    /api/proposals/trending/     # Get trending proposals
GET    /api/proposals/categories/   # Get all categories
```

### User Profiles
```
GET    /api/profiles/me/            # Get current user profile
POST   /api/profiles/verify_wallet/ # Verify wallet address
```

### Transactions
```
GET    /api/transactions/           # List user transactions
POST   /api/transactions/create_transaction/ # Create transaction
POST   /api/transactions/confirm/   # Confirm transaction
```

### Statistics
```
GET    /api/stats/                  # Get contract statistics
```

---

## 🗄️ Database Models

### Proposal
- `proposal_id`: Unique identifier
- `description`: Proposal details
- `recipient_address`: Ethereum address
- `total_amount`: Target funding in ETH
- `state`: Current proposal state
- `authority_yes_votes`: Authority votes for
- `authority_no_votes`: Authority votes against
- `public_yes_votes`: Public votes for
- `public_no_votes`: Public votes against
- `current_stage`: Current funding stage
- `total_stages`: Total number of stages

### Vote
- `proposal`: Foreign key to Proposal
- `voter`: Foreign key to User
- `support`: Boolean (True = support, False = against)
- `weight`: Vote weight (default 1)
- `tx_hash`: Blockchain transaction hash

### Funding
- `proposal`: Foreign key to Proposal
- `funder`: Foreign key to User
- `amount`: Funding amount in ETH
- `tx_hash`: Unique transaction hash
- `status`: pending / confirmed / failed
- `confirmed_at`: When funding was confirmed

### UserProfile
- `user`: One-to-one with Django User
- `wallet_address`: Ethereum wallet
- `is_verified`: KYC verification status
- `is_admin`: Admin flag
- `reputation_score`: User reputation

### Transaction
- `user`: Foreign key to User
- `tx_hash`: Blockchain transaction hash
- `tx_type`: create_proposal / vote / fund / approve / reject
- `amount`: Transaction amount
- `status`: pending / confirmed / failed
- `proposal`: Optional foreign key to Proposal

---

## 🔧 Configuration

### Django Settings (backend/backend/settings.py)
- `DEBUG = True` (Development mode)
- `ALLOWED_HOSTS = ['*']` (Allow all hosts)
- `DATABASES = SQLite`
- `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FUND_MANAGEMENT_CONTRACT=0x9B00068CfBF060E4aad61a892a86E98C108D760e
NEXT_PUBLIC_SBT_CONTRACT=0x3F185534338d3cfC7E6D4597B74BE99e1FF9eC41
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/9cpn2JHnoIv28vBZhEHxH
```

---

## 📝 Common Tasks

### Create a New Proposal
```bash
curl -X POST http://localhost:8000/api/proposals/ \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Community Park Project",
    "recipient_address": "0x...",
    "total_amount": "10.5",
    "total_stages": 3
  }'
```

### Vote on a Proposal
```bash
curl -X POST http://localhost:8000/api/proposals/1/vote/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "support": true,
    "tx_hash": "0x..."
  }'
```

### Fund a Proposal
```bash
curl -X POST http://localhost:8000/api/proposals/1/fund/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": "2.5",
    "tx_hash": "0x..."
  }'
```

### Get Statistics
```bash
curl http://localhost:8000/api/stats/
```

---

## 🐛 Troubleshooting

### Error: "Failed to load pending applications"
**Solution**: Ensure backend is running on port 8000
```powershell
netstat -ano | Select-String ":8000"
```

### Error: "Cannot connect to localhost:3000"
**Solution**: Start frontend server
```powershell
cd frontend
npm run dev -- --port 3000
```

### Error: "Database migration failed"
**Solution**: Run migrations
```powershell
python manage.py migrate
```

### Error: "Module not found"
**Solution**: Install dependencies
```powershell
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

---

## 📦 Project Structure

```
projectfund-main/
├── backend/
│   ├── APIs/
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── viewsets.py        # API viewsets
│   │   ├── views.py           # Additional views
│   │   ├── urls.py            # API routes
│   │   └── migrations/        # Database migrations
│   ├── backend/
│   │   ├── settings.py        # Django configuration
│   │   └── urls.py            # Root URLs
│   ├── manage.py              # Django management
│   ├── db.sqlite3             # Database
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/         # Dashboard page
│   │   ├── admin/             # Admin panel
│   │   ├── proposals/         # Proposals pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   ├── hooks/                 # React hooks
│   ├── lib/                   # Utilities & API client
│   ├── package.json           # NPM dependencies
│   └── .env.local             # Environment variables
│
└── smart-contracts/
    ├── contracts/             # Solidity contracts
    ├── scripts/               # Deployment scripts
    └── test/                  # Contract tests
```

---

## 🔗 API Integration Flow

1. **User connects wallet** → Frontend detects MetaMask
2. **Frontend sends request** → `/api/profiles/verify_wallet/`
3. **Backend verifies signature** → Creates UserProfile
4. **Frontend fetches proposals** → `GET /api/proposals/`
5. **User votes on proposal** → `POST /api/proposals/{id}/vote/`
6. **Backend records vote** → Saves Vote model
7. **Frontend updates UI** → Shows latest vote count

---

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Frontend is running
3. ✅ Database is populated
4. ⏭️ Create test proposals
5. ⏭️ Test voting functionality
6. ⏭️ Implement MetaMask integration
7. ⏭️ Deploy smart contracts
8. ⏭️ Connect to blockchain

---

## 📞 Support

For issues, check:
- Terminal output for error messages
- http://localhost:8000/admin/ for database inspection
- Browser console for frontend errors
- Django logs in terminal

---

## 🎉 Success Indicators

✅ Backend running on port 8000
✅ Frontend running on port 3000
✅ API returning 200 status
✅ Database migrations applied
✅ Models synced with database
✅ No console errors

**Everything is ready!** 🚀

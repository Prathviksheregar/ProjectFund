# 🚀 Quick Start: Testing Admin Panel

## Prerequisites
✅ Both servers running (frontend:3000, backend:8000)  
✅ MetaMask installed with wallet `0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC`  
✅ Some test proposals created

## Step-by-Step Test

### 1️⃣ Access Admin Panel
```
URL: http://localhost:3000/admin
```
- Connect MetaMask with authorized wallet
- Should see admin dashboard with 4 stat cards

### 2️⃣ Test Pending Voting Tab
**Create test scenario:**
```powershell
# Create a proposal via main app or API
# Let it go through voting phases
```

**In Admin Panel:**
- Click "Pending Voting (X)" tab
- Find a proposal in PublicVoting state
- Click **"Close Voting"** button
- ✅ Success: Proposal state changes to Approved/Rejected
- If Approved, **"Start Execution"** button appears
- Click it → Proposal moves to "Running Proposals"

### 3️⃣ Test Bill Approval Tab
**Create test scenario:**
```bash
# Via API or bill upload form:
curl -X POST http://localhost:8000/api/bills/upload/ \
  -F "proposal_id=1" \
  -F "stage_number=1" \
  -F "bill_type=invoice" \
  -F "amount=2.5" \
  -F "file=@test_invoice.jpg"
```

**In Admin Panel:**
- Click "Pending Bills (X)" tab
- Review:
  - AI Confidence Score (e.g., 87.5%)
  - Extracted Amount (e.g., $2500.00)
  - Warnings (if any)
- Click **"Approve & Release Funds"** button
- ✅ Success: Bill approved, funds released, stage completed

### 4️⃣ Test Running Proposals Tab
**In Admin Panel:**
- Click "Running Proposals (X)" tab
- See proposals in InProgress state
- Each shows:
  - Current stage / Total stages
  - Stage details (amount, state)
  - Bills approved per stage
  - Completion dates

## Expected Results

### Stats Dashboard
```
Total Proposals:     15
Pending Voting:      3
Running:             2
Pending Bills:       4
```

### Pending Voting Card Example
```
Proposal #5: Community Park Development
Total Amount: 10.0 ETH
Stages: 4 stages
Authority Votes: ✅ 3 / ❌ 0
Public Votes: ✅ 15 / ❌ 2

[Close Voting] [Start Execution]
```

### Pending Bill Card Example
```
Bill #1 - Proposal #5
Community Park Development

Stage: Stage 1
Amount: 2.5 ETH
Type: invoice
AI Confidence: 87%

AI Extracted Amount: $2500.00

⚠️ Warnings:
- Claimed amount differs from extracted amount

[View Bill Document]
[Approve & Release Funds] [Reject]
```

### Running Proposal Card Example
```
Proposal #5 - Running
Community Park Development

Total Amount: 10.0 ETH
Progress: Stage 2 / 4

Stage Details:
┌─ Stage 1 ─────────────────┐
│ Amount: 2.5 ETH           │
│ State: Completed          │
│ ✓ Bill Approved           │
│   on 01/20/2025           │
└───────────────────────────┘
┌─ Stage 2 ─────────────────┐
│ Amount: 3.0 ETH           │
│ State: InProgress         │
└───────────────────────────┘
```

## Troubleshooting

### "Access Denied" Error
**Problem**: Wrong wallet connected  
**Solution**: Use `0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC`

### Buttons Not Showing
**Problem**: Proposal state doesn't allow action  
**Solution**: Check proposal is in correct state:
- Close Voting: PublicVoting state only
- Start Execution: Approved state only

### "Failed to fetch" Error
**Problem**: Backend not running  
**Solution**: 
```powershell
cd backend
python manage.py runserver
```

### Empty Tabs
**Problem**: No test data  
**Solution**: Create test proposals and upload bills

## API Testing (Alternative)

### Get Stats
```bash
curl http://localhost:8000/api/admin/panel/?action=overview
```

### Close Voting
```bash
curl -X POST http://localhost:8000/api/admin/panel/ \
  -H "Content-Type: application/json" \
  -d '{
    "action": "close_voting",
    "proposal_id": 1,
    "admin_address": "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC"
  }'
```

### Approve Bill
```bash
curl -X POST http://localhost:8000/api/bills/approve/ \
  -H "Content-Type: application/json" \
  -d '{
    "bill_id": 1,
    "approved": true,
    "authority_address": "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC",
    "notes": "Looks good!"
  }'
```

## Complete Workflow Test (15 min)

### Phase 1: Create & Vote (5 min)
1. Create proposal (4 stages, 10 ETH total)
2. Vote as authority (3 yes votes)
3. Vote as SBT holder (10 yes votes)

### Phase 2: Admin Actions (3 min)
4. Open admin panel → Pending Voting tab
5. Close voting → Proposal approved
6. Start execution → Moves to Running

### Phase 3: Stage Execution (5 min)
7. Upload bill for Stage 1 (invoice, 2.5 ETH)
8. AI verifies → Appears in Pending Bills
9. Admin approves → Funds released
10. Check Running Proposals → Stage 1 completed

### Phase 4: Verify (2 min)
11. Running Proposals tab shows:
    - Stage 1: Completed ✓
    - Stage 2: InProgress
12. Stats dashboard updated
13. Refresh works correctly

## Success Checklist

- [ ] Can access admin panel with authorized wallet
- [ ] Stats dashboard shows correct counts
- [ ] Pending Voting tab lists proposals
- [ ] Can close voting successfully
- [ ] Can start proposal execution
- [ ] Pending Bills tab shows uploaded bills
- [ ] AI verification data displays correctly
- [ ] Can approve bills
- [ ] Running Proposals shows stage progress
- [ ] Bills appear in completed stages
- [ ] Refresh button works
- [ ] All loading states work
- [ ] Success/error messages appear

## Time Estimate
- Initial setup: 5 minutes
- Each workflow test: 10-15 minutes
- Total testing: 30 minutes

---

**Ready to test!** 🎯  
Any issues? Check `ADMIN_PANEL_GUIDE.md` for detailed troubleshooting.

# 🛠️ Admin Panel User Guide

## Overview
The Admin Control Panel provides comprehensive tools to manage the proposal lifecycle, approve bills, and monitor system activity.

## Access
- **URL:** `http://localhost:3000/admin`
- **Wallet Required:** `0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC`
- **Permission:** Admin/Authority role

## Features

### 📊 Dashboard Statistics
Real-time overview cards showing:
- **Total Proposals**: All proposals ever created
- **Pending Voting**: Proposals awaiting vote closure
- **Running**: Proposals currently in execution
- **Pending Bills**: Bills awaiting approval

### 🗳️ Pending Voting Tab

**Purpose:** Manage proposals that need voting closure or execution start

**Actions:**
1. **Close Voting**
   - Closes public voting phase
   - Automatically approves/rejects based on vote count
   - Moves to either "Approved" or "Rejected" state
   - Only visible if voting period requirements met

2. **Start Execution**
   - Available after proposal approved
   - Moves proposal to "Running Proposals" section
   - Changes state to "InProgress"
   - Enables stage-by-stage execution

**Information Displayed:**
- Proposal ID and description
- Total amount and number of stages
- Authority votes (Yes/No count)
- Public votes (Yes/No count)
- Current state badge

### 📄 Pending Bills Tab

**Purpose:** Review and approve bills submitted by project executors

**Workflow:**
1. Proposal executor completes Stage 1
2. Uploads bill/receipt via bill upload form
3. AI automatically verifies document (extracts amount, checks authenticity)
4. Bill appears in "Pending Bills" for admin review
5. Admin approves → funds released from smart contract
6. Stage marked complete → next stage begins

**Information Displayed:**
- Proposal ID and description
- Stage number
- Bill amount (claimed)
- Bill type (receipt/invoice/proof)
- AI confidence score (0-100%)
- AI extracted amount (from document)
- AI warnings (if any issues detected)
- Document preview link

**Actions:**
- **Approve & Release Funds**: Approves bill and triggers fund release
- **Reject**: Rejects bill, requires resubmission

**AI Verification Details:**
- Confidence threshold: >70% recommended
- Warnings to watch for:
  - Low confidence (<70%)
  - Amount mismatch (claimed vs extracted)
  - Document quality issues
  - Suspicious patterns

### 🚀 Running Proposals Tab

**Purpose:** Monitor proposals currently being executed

**Information Displayed:**
- Proposal ID and description
- Total amount
- Current stage / total stages
- Stage-by-stage breakdown:
  - Stage number
  - Stage amount
  - Stage state (Pending/InProgress/Completed)
  - Approved bills list
  - Completion date

**Stage States:**
- **Pending**: Not yet started
- **InProgress**: Currently active (can upload bills)
- **Completed**: Bills approved and funds released

## Complete Workflow Example

### Step 1: Create Proposal
1. Authority creates proposal with 3 stages
2. Proposal state: "Created"

### Step 2: Authority Voting
1. Authorities vote on proposal
2. State changes to "UnderAuthorityVoting"

### Step 3: Public Voting
1. SBT holders vote
2. State changes to "PublicVoting"

### Step 4: Close Voting (Admin Action)
1. Admin clicks "Close Voting" button
2. System counts votes
3. If majority yes → "Approved", else → "Rejected"

### Step 5: Start Execution (Admin Action)
1. Admin clicks "Start Execution"
2. Proposal moves to "Running Proposals" tab
3. State changes to "InProgress"
4. Stage 1 becomes active

### Step 6: Execute Stage 1
1. Executor works on Stage 1
2. Executor marks stage complete
3. Executor uploads bill/receipt

### Step 7: AI Verification (Automatic)
1. System analyzes bill document
2. Extracts amount, checks authenticity
3. Generates confidence score
4. Bill appears in "Pending Bills" tab

### Step 8: Bill Approval (Admin Action)
1. Admin reviews bill in "Pending Bills"
2. Checks AI confidence and warnings
3. Clicks "Approve & Release Funds"
4. Smart contract releases Stage 1 funds
5. Stage 1 marked "Completed"
6. Stage 2 becomes active

### Step 9: Repeat for Remaining Stages
1. Repeat steps 6-8 for Stage 2
2. Repeat steps 6-8 for Stage 3
3. After all stages complete → Proposal state: "Completed"

## API Endpoints Used

### GET Endpoints
```
/api/admin/panel/?action=overview       # Stats dashboard
/api/admin/panel/?action=proposals&state=pending_voting
/api/admin/panel/?action=bills          # Pending bills
/api/admin/panel/?action=running        # Running proposals
```

### POST Endpoints
```
POST /api/admin/panel/
{
  "action": "close_voting",
  "proposal_id": 1,
  "admin_address": "0x..."
}

POST /api/admin/panel/
{
  "action": "start_proposal",
  "proposal_id": 1,
  "admin_address": "0x..."
}

POST /api/bills/approve/
{
  "bill_id": 1,
  "approved": true,
  "authority_address": "0x...",
  "notes": "Approved by admin"
}
```

## Troubleshooting

### Can't access admin panel
- **Issue**: "Access Denied" message
- **Solution**: Connect wallet `0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC`

### Close Voting button not showing
- **Issue**: Button missing on proposal
- **Solution**: Ensure voting period requirements met (time elapsed, minimum votes)

### Bill approval fails
- **Issue**: Error when clicking approve
- **Solution**: 
  - Check backend server running (port 8000)
  - Verify bill ID exists
  - Check console for error details

### Running proposals not showing stages
- **Issue**: Empty stages list
- **Solution**: Proposal may not have started yet, click "Start Execution" first

## Best Practices

1. **Review AI Warnings**: Always check AI confidence and warnings before approving bills
2. **Verify Amounts**: Compare claimed amount vs AI extracted amount
3. **Check Documents**: Preview bill document before approval
4. **Monitor Progress**: Regularly check "Running Proposals" for stage status
5. **Timely Actions**: Close voting promptly to keep proposal pipeline moving

## Security Notes

- Admin actions are irreversible
- Bill approvals trigger immediate fund release
- Only authorized admin wallet can perform actions
- All actions logged to database
- AI verification is supplementary, not replacement for human review

## Integration with Smart Contracts

### Contract Functions Called
```solidity
// Close voting and approve/reject
closeVoting(uint256 proposalId) -> approveProposal(proposalId) OR rejectProposal(proposalId)

// Start proposal execution
startProposalExecution(uint256 proposalId)

// Release stage funds (after bill approval)
releaseStage(uint256 proposalId, uint256 stageNumber)
```

## Future Enhancements

Planned features:
- [ ] Bulk bill approval
- [ ] Email notifications for pending actions
- [ ] Excel export of proposals/bills
- [ ] Advanced filtering and search
- [ ] Audit log viewer
- [ ] Smart contract auto-release integration
- [ ] IPFS document storage

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Contact**: System Administrator

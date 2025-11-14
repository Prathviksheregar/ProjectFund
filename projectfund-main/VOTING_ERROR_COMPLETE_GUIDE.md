# 🔑 VOTING ERROR - COMPLETE DIAGNOSTIC & SOLUTION

**Error Message:**
```
Failed to vote. execution reverted: "Only registered voters can call this function"
```

**Your Wallet:** `0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20`  
**Network:** Sepolia (11155111)  
**Time to Fix:** 5-10 minutes

---

## 🎓 UNDERSTAND THE PROBLEM

### What's Happening?

```
1. You click "Vote"
   ↓
2. Frontend calls smart contract: publicVoteOnProposal()
   ↓
3. Smart contract checks: Are you registered?
   ↓
4. Calls: sbtContract.isRegisteredVoter(0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20)
   ↓
5. SBT Contract says: NO, this wallet is not registered
   ↓
6. Transaction REVERTED with: "Only registered voters can call this function"
   ↓
7. ❌ VOTING FAILS
```

### Why the Check?

The system uses **SBT (Soul Bound Token)** - a non-transferable NFT that proves you're a registered voter.

**Benefits:**
- Prevents spam voting (one real person = one vote)
- Allows voter registration with authority approval
- Transparent on-chain voting history
- Can't sell/transfer your voter status

### The Contract Architecture

```
Your Wallet (0xd3D20e61dd63a220...)
        ↓
PublicFundManagement Contract (voting)
        ↓
        Checks: isRegisteredVoter(your_wallet)
        ↓
SBT Contract (voter registry)
        ↓
Returns: false (not registered) ❌
```

---

## ✅ SOLUTION: REGISTER AS A VOTER

### Phase 1: Prerequisites

**Make sure you have:**

1. ✅ **MetaMask Wallet**
   - Network: Sepolia (11155111)
   - Address: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
   
2. ✅ **Sepolia ETH** (for gas fees)
   - Need: ~0.01 ETH (~$0.01)
   - Get free from: https://sepoliafaucet.com
   
3. ✅ **Smart Contracts Deployed**
   - SBT Contract Address: 0x... (you'll have this)
   - PublicFundManagement Address: 0x... (you'll have this)
   - Both on Sepolia network

4. ✅ **Node.js & Hardhat**
   ```bash
   cd smart-contracts
   npm install
   ```

### Phase 2: Voter Registration Process

#### **Step 1: Get Contract Addresses**

If you deployed the contracts:

```bash
# Deploy SBT contract
cd smart-contracts
npx hardhat run scripts/deploy-sbt.js --network sepolia
# Save the output address!
# Example output:
# ✅ SBT deployed to: 0x1234567890...
```

```bash
# Deploy PublicFundManagement contract
npx hardhat run scripts/deploy.js --network sepolia
# Save this address too!
# Example output:
# ✅ PublicFundManagement deployed to: 0xabcdef...
```

**If already deployed**, find the addresses in:
- `smart-contracts/deployments/` (if you use hardhat-deploy)
- Recent transaction confirmation emails
- Sepolia Etherscan history

#### **Step 2: You Apply for Voter SBT**

You do this step (from your regular MetaMask wallet):

```bash
cd smart-contracts

# Set environment variables
export SBT_ADDRESS=0x1234567890abcdef  # Your SBT contract address
export NULLIFIER=12345  # Any unique number

# Run the registration script
npx hardhat run scripts/register-voter-quick.js --network sepolia
```

**What this does:**
- Calls `sbtContract.applyForSBT(voterHash)` from YOUR wallet
- Your application goes to SBT contract
- Status: **Pending Approval**

**Expected output:**
```
=== ProjectFund Voter Registration Tool ===

Configuration:
  SBT Address: 0x1234567890abcdef
  Voter Address: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20

Step 1: Checking current status...
  Has Applied: false
  Is Registered: false

Step 2: Applying for Voter SBT...
  ⏳ Transaction submitted: 0x...
  ✅ Application submitted successfully!

Step 3: Next steps
  ⚠️  The contract owner needs to approve this application.
  📝  Send these details to the owner:

    - Voter Address: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
    - SBT Address: 0x1234567890abcdef
```

#### **Step 3: Contract Owner Approves You**

The contract owner (admin) does this step:

```bash
cd smart-contracts

# Set environment variables
export SBT_ADDRESS=0x1234567890abcdef
export VOTER_ADDRESS=0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
export NULLIFIER=12345

# Run as owner (your account must have PRIVATE_KEY in .env)
npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

**What this does:**
- Admin calls `sbtContract.approveApplication(your_wallet, nullifier)`
- An SBT token is minted to your wallet
- Your status changes: **Registered ✅**

**Expected output:**
```
=== ProjectFund Admin - Approve Voter ===

Configuration:
  SBT Address: 0x1234567890abcdef
  Voter Address: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
  Nullifier: 12345

Step 1: Checking application status...
  Has Applied: true
  Is Already Registered: false

Step 2: Approving voter...
  ⏳ Transaction submitted: 0x...
  ✅ Voter approved successfully!

Step 3: Verifying registration...
  ✅ Voter is now registered!

The voter can now vote on proposals.
```

#### **Step 4: Verify Registration**

Check that you're registered:

```bash
cd smart-contracts

export SBT_ADDRESS=0x1234567890abcdef
export VOTER_ADDRESS=0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20

npx hardhat run scripts/check-voter-status.js --network sepolia
```

**Expected output:**
```
=== ProjectFund Voter Status Checker ===

Checking voter status...

  SBT Address: 0x1234567890abcdef
  Voter Address: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20

📋 Application Status:
  Has Applied:  ✅ Yes
  Is Registered:  ✅ Yes

📊 Contract Stats:
  Total Voters: 1

🎫 Voter SBT Token:
  Token ID: 1
  Status: ✅ Can vote on proposals
```

### Phase 3: Vote on Proposal

Now you can vote! 🎉

1. **In MetaMask:**
   - Make sure you're on **Sepolia** network
   - Make sure wallet is: `0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20`

2. **In Frontend:**
   - Go to http://localhost:3000
   - Go to Dashboard or Proposals
   - Find a proposal in **Public Voting** state
   - Click "Vote Yes" or "Vote No"
   - Approve transaction in MetaMask
   
3. **Expected:**
   - ✅ Transaction submits successfully
   - ✅ Vote is recorded
   - ✅ Vote count updates

---

## 🔍 VERIFY IT'S WORKING

### Check 1: Is SBT Contract Set?

```bash
cd smart-contracts

# Check if PublicFundManagement knows about SBT contract
FUND_ADDRESS=0xabcdef...
SBT_ADDRESS=0x1234567890...

npx hardhat run scripts/check-sbt-link.js --network sepolia
```

### Check 2: Can You Get Your Token ID?

```javascript
// In browser console (on frontend with MetaMask)
const sbtABI = [
  "function getTokenIdByAddress(address _address) external view returns (uint256)"
];
const sbtAddress = "0x1234567890..."; // Your SBT

const contract = new ethers.Contract(sbtAddress, sbtABI, provider);
const tokenId = await contract.getTokenIdByAddress("0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20");
console.log("Your Token ID:", tokenId.toString()); // Should be 1, 2, 3, etc.
```

### Check 3: Is Proposal in Public Voting?

```javascript
// In browser console
const fundABI = [
  "function getProposalInfo(uint256 _proposalId) external view returns (...)"
];
const fundAddress = "0xabcdef...";

const contract = new ethers.Contract(fundAddress, fundABI, provider);
const proposal = await contract.getProposalInfo(0);
console.log("Proposal State:", proposal.state); // 0=Created, 1=Authority, 2=PublicVoting
// State 2 = can vote
```

---

## 🆘 TROUBLESHOOTING

### Error: "Already registered"
**Problem**: You tried to apply twice

**Solution**: You already have an application. Wait for owner to approve.

```bash
# Check status
export SBT_ADDRESS=0x...
export VOTER_ADDRESS=0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
npx hardhat run scripts/check-voter-status.js --network sepolia
```

---

### Error: "No application found" (when approving)
**Problem**: You didn't apply first

**Solution**: Run `register-voter-quick.js` first

```bash
export SBT_ADDRESS=0x...
npx hardhat run scripts/register-voter-quick.js --network sepolia
```

---

### Error: "Only authorities can call this function" (during deployment)
**Problem**: You're not the contract owner

**Solution**: Verify you have the correct PRIVATE_KEY in `.env`

```bash
# .env should have:
PRIVATE_KEY=0x...  # Your wallet's private key (owner)
```

---

### Error: "Address not registered" (when voting)
**Problem**: You're using a different wallet or not approved yet

**Solution:**
1. Check MetaMask wallet address matches
2. Verify status with `check-voter-status.js`
3. Confirm owner approved your application

---

### Error: "Proposal is not open for public voting"
**Problem**: The proposal is still in Authority voting phase

**Solution**: Wait for authorities to vote and approve it

---

### Transaction keeps failing (no error message)
**Problem**: Likely a gas issue or network issue

**Solutions:**
1. Check you have enough Sepolia ETH (~0.01)
2. Verify you're on Sepolia network
3. Try with higher gas limit: `--gas-limit 500000`
4. Wait 1-2 blocks after SBT is minted

---

## 📋 COMPLETE CHECKLIST

Before voting, verify ALL of these:

- [ ] You have Sepolia ETH in wallet (0.01+ ETH)
- [ ] You're on Sepolia network in MetaMask
- [ ] SBT contract is deployed to Sepolia
- [ ] PublicFundManagement contract is deployed to Sepolia
- [ ] You called `applyForSBT()` from your wallet
- [ ] Contract owner called `approveApplication()` for your wallet
- [ ] You ran `check-voter-status.js` and it shows ✅ registered
- [ ] A proposal exists and is in "Public Voting" state (state = 2)
- [ ] You're using the correct wallet: 0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20

If ALL are ✅, then voting should work!

---

## 🎯 SUMMARY

| What | Status | What to do |
|------|--------|-----------|
| Contract deployed? | ❌ Not yet | Run `deploy-sbt.js` and `deploy.js` |
| You applied? | ❌ Not yet | Run `register-voter-quick.js` |
| Owner approved? | ❌ Not yet | Run `approve-voter-quick.js` as owner |
| You registered? | ✅ Ready! | Run `check-voter-status.js` to verify |
| Can vote now? | ✅ Ready! | Go to app and vote on proposal |

---

## 🚀 QUICK START (All 4 Steps)

```bash
# Step 1: Deploy contracts
cd smart-contracts
npx hardhat run scripts/deploy-sbt.js --network sepolia
npx hardhat run scripts/deploy.js --network sepolia
# Save the addresses!

# Step 2: You apply
export SBT_ADDRESS=0x...  # From deploy-sbt output
npx hardhat run scripts/register-voter-quick.js --network sepolia

# Step 3: Owner approves (as owner account)
export SBT_ADDRESS=0x...
export VOTER_ADDRESS=0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
npx hardhat run scripts/approve-voter-quick.js --network sepolia

# Step 4: Verify
export SBT_ADDRESS=0x...
export VOTER_ADDRESS=0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20
npx hardhat run scripts/check-voter-status.js --network sepolia

# Step 5: Go vote!
# http://localhost:3000
```

---

**You're now ready to vote!** 🗳️

Questions? See: VOTING_QUICK_FIX.md for shorter version or ask in the project docs.

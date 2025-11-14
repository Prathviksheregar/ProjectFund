# 🎯 VOTING NOW - POWERSHELL QUICK GUIDE

**For Windows Users - Copy & Paste Ready!**

---

## ⚡ FASTEST PATH (5 Minutes)

### **Step 1: Deploy Contracts** (2 minutes)

Open PowerShell and run:

```powershell
cd "C:\Users\prath\Downloads\projectfund-main\projectfund-main\smart-contracts"
npx hardhat run scripts/deploy-sbt.js --network sepolia
```

**SAVE THIS OUTPUT!** You need the address:
```
✅ SBT deployed to: 0x...
```

Then deploy the voting contract:

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

**SAVE THIS TOO!** You need:
```
✅ PublicFundManagement deployed to: 0x...
```

---

### **Step 2: Register Your Wallet** (1 minute)

In the same PowerShell window:

```powershell
$env:SBT_ADDRESS = "0xPASTE_THE_ADDRESS_FROM_ABOVE"
npx hardhat run scripts/register-voter-quick.js --network sepolia
```

**What you'll see:**
```
Step 1: Checking current status...
  Has Applied: false
  Is Registered: false

Step 2: Applying for Voter SBT...
  ⏳ Transaction submitted: 0x...
  ✅ Application submitted successfully!
```

---

### **Step 3: Admin Approves** (1 minute)

Owner/Admin runs (you need PRIVATE_KEY in .env):

```powershell
$env:SBT_ADDRESS = "0xPASTE_THE_ADDRESS_FROM_STEP_1"
$env:VOTER_ADDRESS = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"
$env:NULLIFIER = "12345"
npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

**What you'll see:**
```
Step 2: Approving voter...
  ⏳ Transaction submitted: 0x...
  ✅ Voter approved successfully!

Step 3: Verifying registration...
  ✅ Voter is now registered!
```

---

### **Step 4: Verify** (30 seconds)

```powershell
$env:SBT_ADDRESS = "0xPASTE_THE_ADDRESS_FROM_STEP_1"
$env:VOTER_ADDRESS = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"
npx hardhat run scripts/check-voter-status.js --network sepolia
```

**Expected output:**
```
✅ Has Applied: Yes
✅ Is Registered: Yes
🎫 Token ID: 1
```

---

## 🎉 NOW YOU CAN VOTE!

Go to: **http://localhost:3000**

1. Click on a proposal (in "Public Voting" state)
2. Click "Vote Yes" or "Vote No"
3. Approve in MetaMask
4. ✅ **YOUR VOTE IS RECORDED!**

---

## 🔑 KEY POWERSHELL COMMANDS

```powershell
# Set environment variable (Windows PowerShell)
$env:VARIABLE_NAME = "value"

# View environment variable
Write-Host $env:VARIABLE_NAME

# Multiple variables at once
$env:VAR1 = "value1"; $env:VAR2 = "value2"

# Run scripts with variables
npx hardhat run scripts/script.js --network sepolia
```

---

## ❌ COMMON MISTAKES TO AVOID

```powershell
# ❌ WRONG - Bash syntax (doesn't work in PowerShell)
export SBT_ADDRESS=0x...

# ✅ CORRECT - PowerShell syntax
$env:SBT_ADDRESS = "0x..."

# ❌ WRONG - Missing quotes
$env:SBT_ADDRESS = 0x123

# ✅ CORRECT - With quotes
$env:SBT_ADDRESS = "0x123"
```

---

## 📋 TROUBLESHOOTING

### "Cannot find module"
**Fix:** Make sure you're in the `smart-contracts` folder
```powershell
cd "C:\Users\prath\Downloads\projectfund-main\projectfund-main\smart-contracts"
```

### "Invalid address"
**Fix:** Make sure you copied the FULL address from deployment output:
```
Should start with: 0x
Should be 42 characters total
Example: 0x1234567890123456789012345678901234567890
```

### "Transaction failed"
**Fix:** Make sure you have Sepolia ETH (~0.01)
```
Get free from: https://sepoliafaucet.com
```

### "Only registered voters can call this function"
**This is EXPECTED until you complete all steps!**
- You must run register-voter-quick.js
- Owner must run approve-voter-quick.js
- Then voting works

---

## 🚀 COPY-PASTE EXACT COMMANDS

Replace `0x...` with the addresses from Step 1!

### **Deploy SBT**
```powershell
cd "C:\Users\prath\Downloads\projectfund-main\projectfund-main\smart-contracts"; npx hardhat run scripts/deploy-sbt.js --network sepolia
```

### **Deploy Fund Contract**
```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

### **Apply (Replace 0x...)**
```powershell
$env:SBT_ADDRESS = "0x..."; npx hardhat run scripts/register-voter-quick.js --network sepolia
```

### **Approve (Replace 0x...)**
```powershell
$env:SBT_ADDRESS = "0x..."; $env:VOTER_ADDRESS = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

### **Verify (Replace 0x...)**
```powershell
$env:SBT_ADDRESS = "0x..."; $env:VOTER_ADDRESS = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; npx hardhat run scripts/check-voter-status.js --network sepolia
```

---

## ✅ CHECKLIST

- [ ] PowerShell open
- [ ] In `smart-contracts` folder
- [ ] Ran deploy-sbt.js ✓
- [ ] Ran deploy.js ✓
- [ ] Saved both contract addresses
- [ ] Ran register-voter-quick.js ✓
- [ ] Owner ran approve-voter-quick.js ✓
- [ ] Ran check-voter-status.js ✓
- [ ] Status shows: **Is Registered: ✅ Yes**

**All checked? → GO TO http://localhost:3000 AND VOTE!** 🗳️

---

## 🎊 FINAL SUMMARY

| Step | Command | Time |
|------|---------|------|
| 1 | `deploy-sbt.js` | 1 min |
| 2 | `deploy.js` | 1 min |
| 3 | `register-voter-quick.js` | 1 min |
| 4 | `approve-voter-quick.js` | 1 min |
| 5 | `check-voter-status.js` | 30 sec |
| 6 | Go to http://localhost:3000 and vote | 1 min |
| **TOTAL** | | **~5 min** |

---

**Ready to vote?** 🚀

Follow the steps above and you'll be voting in 5 minutes!

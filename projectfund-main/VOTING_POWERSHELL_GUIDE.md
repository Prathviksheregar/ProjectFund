# 🚀 VOTING REGISTRATION - POWERSHELL QUICK START

**For Windows PowerShell Users**

---

## ⚡ 3-STEP VOTER REGISTRATION (PowerShell)

### **Step 1: Deploy Smart Contracts**

```powershell
cd smart-contracts
npx hardhat run scripts/deploy-sbt.js --network sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Save the addresses from the output!**
```
✅ SBT deployed to: 0x1234567890...
✅ PublicFundManagement deployed to: 0xabcdef...
```

---

### **Step 2: You Apply for Voter Registration**

In PowerShell, use `$env:` instead of `export`:

```powershell
cd smart-contracts

# Set the contract address from Step 1
$env:SBT_ADDRESS="0x1234567890..."  # Replace with your SBT address

# Run the registration script
npx hardhat run scripts/register-voter-quick.js --network sepolia
```

**What happens:**
- ✅ Application submitted
- ✅ Shows "Next steps" message
- ⏳ Status: Pending approval

---

### **Step 3: Admin Approves You**

The **contract owner** runs this (you need your private key in `.env`):

```powershell
cd smart-contracts

# Set environment variables
$env:SBT_ADDRESS="0x1234567890..."
$env:VOTER_ADDRESS="0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"
$env:NULLIFIER="12345"

# Run approval script
npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

**What happens:**
- ✅ SBT token minted
- ✅ You're registered as voter
- ✅ Status: Ready to vote!

---

### **Step 4: Verify Registration**

```powershell
cd smart-contracts

$env:SBT_ADDRESS="0x1234567890..."
$env:VOTER_ADDRESS="0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"

npx hardhat run scripts/check-voter-status.js --network sepolia
```

**Expected output:**
```
✅ Has Applied: Yes
✅ Is Registered: Yes
🎫 Token ID: 1
📊 Total Voters: 1
```

---

## 🎯 POWERSHELL VS BASH SYNTAX

| Operation | Bash | PowerShell |
|-----------|------|-----------|
| Set variable | `export VAR=value` | `$env:VAR="value"` |
| Use variable | `$VAR` | `$env:VAR` |
| Multiple vars | `export A=1; export B=2` | `$env:A="1"; $env:B="2"` |
| Clear variable | `unset VAR` | `Remove-Item env:VAR` |

---

## 📋 COPY-PASTE READY COMMANDS

### **Command 1: Deploy Contracts**
```powershell
cd smart-contracts; npx hardhat run scripts/deploy-sbt.js --network sepolia; npx hardhat run scripts/deploy.js --network sepolia
```

### **Command 2: Apply (Replace 0x... with your SBT address)**
```powershell
cd smart-contracts; $env:SBT_ADDRESS="0x..."; npx hardhat run scripts/register-voter-quick.js --network sepolia
```

### **Command 3: Approve (Replace addresses - owner only)**
```powershell
cd smart-contracts; $env:SBT_ADDRESS="0x..."; $env:VOTER_ADDRESS="0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; $env:NULLIFIER="12345"; npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

### **Command 4: Check Status (Replace 0x...)**
```powershell
cd smart-contracts; $env:SBT_ADDRESS="0x..."; $env:VOTER_ADDRESS="0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; npx hardhat run scripts/check-voter-status.js --network sepolia
```

---

## ⚙️ IMPORTANT: .env Setup

Before running scripts, make sure `.env` in `smart-contracts/` has:

```env
PRIVATE_KEY=0x...  # Your wallet private key (for owner operations)
INFURA_KEY=...     # Your Infura key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

---

## 🎯 QUICK VISUAL REFERENCE

```
PowerShell Variable Syntax:

❌ export SBT_ADDRESS=0x...      ← WRONG (bash syntax)
✅ $env:SBT_ADDRESS="0x..."      ← CORRECT (PowerShell)

❌ echo $SBT_ADDRESS             ← WRONG 
✅ Write-Host $env:SBT_ADDRESS   ← CORRECT

❌ ./scripts/script.js           ← May not work
✅ npx hardhat run ...           ← Use hardhat instead
```

---

## ✅ COMPLETE CHECKLIST

- [ ] Opened PowerShell terminal
- [ ] Navigated to `smart-contracts` folder
- [ ] Deployed contracts and saved addresses
- [ ] Set `$env:SBT_ADDRESS="0x..."`
- [ ] Ran `register-voter-quick.js`
- [ ] Owner ran `approve-voter-quick.js`
- [ ] Ran check script and verified status
- [ ] See ✅ "Is Registered: Yes"
- [ ] Go to http://localhost:3000
- [ ] Find proposal and click Vote
- [ ] ✅ Vote works!

---

## 🎉 NOW YOU CAN VOTE!

After all 4 steps above:

1. Go to: **http://localhost:3000**
2. Find a proposal in "Public Voting" state
3. Click the **"Vote"** button
4. Choose Yes or No
5. Approve in MetaMask
6. ✅ **Your vote is recorded!**

---

## 🆘 TROUBLESHOOTING

### Error: "export is not recognized"
**Problem**: Using bash syntax in PowerShell

**Fix**: Use `$env:VAR="value"` instead

```powershell
# ❌ Wrong
export SBT_ADDRESS=0x...

# ✅ Correct
$env:SBT_ADDRESS="0x..."
```

### Error: "Command not found"
**Problem**: Running from wrong directory

**Fix**: Make sure you're in `smart-contracts` folder
```powershell
cd smart-contracts
pwd  # Should show: .../smart-contracts
```

### Error: "Cannot read private key"
**Problem**: `.env` file not set up

**Fix**: Create `.env` file in `smart-contracts/`:
```env
PRIVATE_KEY=0x...
```

---

## 📝 STEP-BY-STEP WITH SCREENSHOTS (Text Version)

```
1️⃣  Open PowerShell
    Press: Win + R
    Type: powershell
    Press: Enter

2️⃣  Navigate to project
    Type: cd "C:\Users\prath\Downloads\projectfund-main\projectfund-main\smart-contracts"
    Press: Enter

3️⃣  Deploy contracts
    Type: npx hardhat run scripts/deploy-sbt.js --network sepolia
    Press: Enter
    ✅ Save the SBT address shown

4️⃣  Deploy fund contract
    Type: npx hardhat run scripts/deploy.js --network sepolia
    Press: Enter
    ✅ Save this address too

5️⃣  Apply for voter registration
    Type: $env:SBT_ADDRESS="0x1234567890..."
    Press: Enter
    Type: npx hardhat run scripts/register-voter-quick.js --network sepolia
    Press: Enter
    ✅ Application submitted

6️⃣  Owner approves (as owner)
    Type: $env:SBT_ADDRESS="0x..."
    Press: Enter
    Type: $env:VOTER_ADDRESS="0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"
    Press: Enter
    Type: npx hardhat run scripts/approve-voter-quick.js --network sepolia
    Press: Enter
    ✅ You're registered!

7️⃣  Verify status
    Type: npx hardhat run scripts/check-voter-status.js --network sepolia
    Press: Enter
    ✅ Should show: "Is Registered: ✅ Yes"

8️⃣  Vote!
    Go to: http://localhost:3000
    Find proposal
    Click: Vote
    ✅ Done!
```

---

## 🎓 KEY DIFFERENCES: PowerShell vs Bash

| Task | Bash | PowerShell |
|------|------|-----------|
| Set env var | `export X=y` | `$env:X="y"` |
| View env var | `echo $X` or `$X` | `Write-Host $env:X` or `$env:X` |
| Multiple vars | `export X=1; export Y=2` | `$env:X="1"; $env:Y="2"` |
| Run node script | `node script.js` | `npx hardhat run script.js` |
| Make executable | `chmod +x file` | Not needed on Windows |
| Delete var | `unset X` | `Remove-Item env:X` |

---

**Ready?** Follow the commands above and you'll be voting in 5 minutes! 🚀

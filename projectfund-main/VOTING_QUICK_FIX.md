# 🎯 QUICK ACTION: Fix Voting Error

## 📌 The Problem in 30 Seconds

```
You try to vote → Smart Contract checks → "Are you a registered voter?" 
→ Checks SBT contract → Your wallet is NOT registered → 
❌ "Only registered voters can call this function"
```

## ✅ The Solution in 3 Steps

### Step 1: Deploy Smart Contracts (If not already done)

```bash
cd smart-contracts
npm install
npx hardhat run scripts/deploy-sbt.js --network sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Save the output addresses!** You'll need them.

### Step 2: Register Your Wallet as a Voter

**As the voter** (your MetaMask wallet):
```bash
cd smart-contracts
SBT_ADDRESS=0x... npx hardhat run scripts/register-voter-quick.js --network sepolia
```

Replace `0x...` with your SBT contract address from Step 1.

This will:
- ✅ Apply for a Voter SBT token
- 📝 Tell you what to do next

### Step 3: Admin Approves Your Registration

**As the contract owner** (must have PRIVATE_KEY in .env):

```bash
cd smart-contracts
SBT_ADDRESS=0x... VOTER_ADDRESS=0xYourWallet NULLIFIER=12345 \
  npx hardhat run scripts/approve-voter-quick.js --network sepolia
```

This will:
- ✅ Mint a Voter SBT token to your wallet
- ✅ Register you as a voter
- ✅ Verify the registration

### Step 4: Try Voting Again

Go back to your app and vote on a proposal. It should work now! 🎉

---

## 🔍 Check If You're Registered

```bash
cd smart-contracts
npx hardhat run scripts/check-voter-status.js --network sepolia \
  SBT_ADDRESS=0x... VOTER_ADDRESS=0xYourWallet
```

Expected output if registered:
```
✅ Registered: true
✅ Token ID: 1
```

---

## 📚 Full Details

See: `VOTING_ERROR_FIX.md` for complete troubleshooting guide

---

## ⚙️ If You Need More Details

**What's happening**:
1. SBT = Soul Bound Token (non-transferable NFT that proves you're a registered voter)
2. PublicFundManagement = Main contract for voting
3. Only wallets with a valid SBT can vote

**The flow**:
```
Your Wallet
    ↓ (applyForSBT)
SBT Contract - Pending Application
    ↓ (approveApplication - requires owner)
SBT Contract - Voter Registered
    ↓ (mint SBT token)
Your Wallet now has SBT token
    ↓ (can now vote)
Can call publicVoteOnProposal ✅
```

**Important**: Each wallet can only have ONE SBT. You can't vote multiple times.

---

## 🆘 Stuck?

1. **Check the full guide**: `VOTING_ERROR_FIX.md`
2. **Verify contracts are deployed**: Check Sepolia Etherscan
3. **Make sure you're on Sepolia testnet**: MetaMask network selector
4. **Check you have enough Sepolia ETH**: Need ~0.01 ETH for gas (~$0.01 worth)

---

## 📋 Checklist

Before voting, verify:
- [ ] Smart contracts deployed to Sepolia
- [ ] Your wallet applied for SBT
- [ ] Contract owner approved your application
- [ ] You received an SBT token (check in MetaMask - add token)
- [ ] You're on Sepolia testnet
- [ ] A proposal exists and is in "Public Voting" state

✅ All done? Go vote! 🗳️

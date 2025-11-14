# 🔴 VOTING ERROR FIX - "Only registered voters can call this function"

**Problem**: You cannot vote on proposals - getting error "Only registered voters can call this function"

**Root Cause**: Your wallet address is NOT registered as a voter in the SBT (Soul Bound Token) contract.

---

## 🎯 WHY THIS ERROR HAPPENS

The voting system has a verification flow:

```
You Try to Vote
    ↓
Smart Contract Checks: Is this wallet a registered voter?
    ↓
Calls: sbtContract.isRegisteredVoter(your_wallet)
    ↓
Returns: FALSE (not registered yet)
    ↓
Rejects: ❌ "Only registered voters can call this function"
```

**The SBT (Soul Bound Token) Contract requires:**
1. User applies for a voter SBT token
2. Admin/Owner approves the application
3. Token is minted to the user's wallet
4. Only then can the user vote

---

## ✅ SOLUTION STEPS

### Step 1: Identify Your Contracts & Addresses

First, you need to know your contract addresses. Check these files:

**Smart Contracts Deployment Info**:
```bash
cd smart-contracts
cat artifacts/contracts/SBT.sol/SBT.json  # Look for deployed address
cat artifacts/contracts/PublicFundManagement.sol/PublicFundManagement.json
```

Or check hardhat artifacts for recent deployments.

### Step 2: Deploy Contracts (If Not Already Done)

If you haven't deployed to Sepolia testnet yet:

```bash
cd smart-contracts
npm install
npx hardhat run scripts/deploy-sbt.js --network sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**This will output the deployed contract addresses - save them!**

### Step 3: Register as a Voter (Multiple Options)

#### **Option A: Using Hardhat Script (Recommended)**

Create a new file `smart-contracts/scripts/register-voter.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Configuration
  const SBT_ADDRESS = "0x..."; // Replace with your SBT contract address
  const VOTER_WALLET = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; // Your MetaMask wallet

  // Get the SBT contract
  const sbtContract = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);

  // Step 1: Apply for SBT
  console.log("Step 1: Applying for Voter SBT...");
  const voterHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("voter_data"));
  
  let tx = await sbtContract.applyForSBT(voterHash);
  await tx.wait();
  console.log("✅ Application submitted!");
  console.log("   Transaction: ", tx.hash);

  // Step 2: Check if owner can approve (this requires owner account)
  console.log("\nStep 2: Waiting for owner to approve...");
  console.log("   The contract owner needs to run approval");
  console.log("   Voter Address: ", VOTER_WALLET);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Run it:
```bash
cd smart-contracts
npx hardhat run scripts/register-voter.js --network sepolia
```

#### **Option B: Using Remix IDE (Web UI)**

1. Go to: https://remix.ethereum.org
2. Copy the SBT.sol contract code into Remix
3. Compile it
4. At your contract address, interact with:
   - **`applyForSBT(bytes32 _voterHash)`** - Submit application
   - Wait for owner approval

#### **Option C: Using Etherscan**

If your contract is verified on Sepolia:
1. Go to Sepolia Etherscan
2. Find your SBT contract address
3. Go to "Write as Proxy" tab
4. Call `applyForSBT()` with a hash value

### Step 4: Admin Approves Registration

**The contract owner must approve the application:**

Create file `smart-contracts/scripts/approve-voter.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Configuration
  const SBT_ADDRESS = "0x..."; // Your SBT contract address
  const VOTER_ADDRESS = "0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20"; // Address to approve
  const NULLIFIER = 12345; // Any unique number for this voter

  // Get the SBT contract
  const sbtContract = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);

  // Admin approves the voter
  console.log("Approving voter...");
  const tx = await sbtContract.approveApplication(VOTER_ADDRESS, NULLIFIER);
  await tx.wait();

  console.log("✅ Voter approved!");
  console.log("   Transaction: ", tx.hash);
  console.log("   Voter Address: ", VOTER_ADDRESS);

  // Verify registration
  const isRegistered = await sbtContract.isRegisteredVoter(VOTER_ADDRESS);
  console.log("   Is Registered: ", isRegistered);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Run it as owner:
```bash
cd smart-contracts
# Make sure you have PRIVATE_KEY set to owner's private key in .env
npx hardhat run scripts/approve-voter.js --network sepolia
```

### Step 5: Verify Registration

Check if you're now registered:

```javascript
// Use this in browser console (with ethers.js loaded)
const sbtAddress = "0x..."; // Your SBT address
const sbtABI = [...]; // Get from artifacts

const sbtContract = new ethers.Contract(sbtAddress, sbtABI, provider);
const isRegistered = await sbtContract.isRegisteredVoter("0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20");
console.log("Registered as voter: ", isRegistered);
```

### Step 6: Try Voting Again

Now go back to your frontend and:
1. Make sure you're on Sepolia testnet
2. Make sure you're using the same wallet (0xd3D20e61dd63a220182eB829F0D4FA68b141Ff20)
3. Try to vote again - should work! ✅

---

## 🔧 FIXING YOUR ENVIRONMENT

### Update Frontend .env.local

Make sure these are set correctly:

```env
# Sepolia testnet
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111

# Contract addresses (from your deployment)
NEXT_PUBLIC_SBT_ADDRESS=0x...  # Your SBT contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your PublicFundManagement contract
```

### Update Frontend Components

File: `frontend/lib/publicFundingContract.js`

Make sure it uses the correct SBT contract:

```javascript
const SBT_ABI = [
  "function isRegisteredVoter(address voter) external view returns (bool)",
  "function getTokenIdByAddress(address _address) external view returns (uint256)",
  "function applyForSBT(bytes32 _voterHash) external",
];

export const SBT_ADDRESS = process.env.NEXT_PUBLIC_SBT_ADDRESS;
export const sbtContract = new ethers.Contract(SBT_ADDRESS, SBT_ABI, signer);
```

---

## 🚀 QUICK FIX (If You Are the Owner)

If you deployed the contracts and own both:

```bash
cd smart-contracts

# 1. Apply for SBT as voter
npx hardhat run -c "
const sbt = await ethers.getContractAt('SBT', 'YOUR_SBT_ADDRESS');
const hash = ethers.keccak256(ethers.toUtf8Bytes('voter'));
await sbt.applyForSBT(hash);
" --network sepolia

# 2. Approve yourself as owner
npx hardhat run -c "
const sbt = await ethers.getContractAt('SBT', 'YOUR_SBT_ADDRESS');
await sbt.approveApplication('YOUR_WALLET', 12345);
" --network sepolia

# 3. Verify
npx hardhat run -c "
const sbt = await ethers.getContractAt('SBT', 'YOUR_SBT_ADDRESS');
const registered = await sbt.isRegisteredVoter('YOUR_WALLET');
console.log('Registered:', registered);
" --network sepolia
```

---

## ❓ TROUBLESHOOTING

### "SBT contract not set"
**Problem**: The PublicFundManagement contract doesn't know where the SBT contract is.

**Fix**: 
```bash
cd smart-contracts
npx hardhat run scripts/add-sbt-contract.js --network sepolia
```

Content of `scripts/add-sbt-contract.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const FUND_CONTRACT = "0x..."; // PublicFundManagement address
  const SBT_ADDRESS = "0x..."; // SBT address
  
  const fundContract = await hre.ethers.getContractAt("PublicFundManagement", FUND_CONTRACT);
  const tx = await fundContract.setSBTContract(SBT_ADDRESS);
  await tx.wait();
  
  console.log("✅ SBT contract linked!");
}

main().catch(console.error);
```

### "getTokenIdByAddress: Address not registered"
**Problem**: Your address exists in SBT but getTokenIdByAddress is failing

**Fix**: Make sure you're:
1. Using the EXACT same wallet address everywhere
2. Calling from the same network (Sepolia)
3. The SBT is fully confirmed on-chain (wait 1-2 blocks)

### "Transaction fails with no error"
**Problem**: The transaction is being rejected by the contract

**Reasons**:
- Wallet not registered ← most likely
- Wrong network (using mainnet instead of Sepolia)
- Insufficient gas
- Proposal not in PublicVoting state yet

**Check**:
```javascript
// Is proposal in PublicVoting?
const proposal = await fundContract.getProposalInfo(proposalId);
console.log("Proposal state:", proposal.state); // Should be 2 (PublicVoting)

// Are you registered?
const registered = await sbtContract.isRegisteredVoter(userAddress);
console.log("Registered:", registered); // Should be true
```

---

## 📋 CHECKLIST BEFORE VOTING

Before trying to vote again, verify:

- [ ] Wallet address is connected to MetaMask
- [ ] You're on **Sepolia testnet**
- [ ] Your wallet has been **applied** for SBT (`applyForSBT` called)
- [ ] Your application has been **approved** by owner (`approveApplication` called)
- [ ] Contract owner has **linked SBT to PublicFundManagement** (`setSBTContract` called)
- [ ] A proposal exists and is in **"PublicVoting"** state
- [ ] You have enough Sepolia ETH for gas (~0.01 ETH)

---

## 🆘 STILL NOT WORKING?

1. **Check contract addresses**:
   ```bash
   # Verify on Etherscan Sepolia
   https://sepolia.etherscan.io/address/0xYourAddress
   ```

2. **Check registration status**:
   ```javascript
   // In browser console
   const result = await sbtContract.getApplicationStatus(yourWallet);
   console.log(result); // { hasApplied: bool, isRegistered: bool }
   ```

3. **Check proposal state**:
   ```javascript
   const proposal = await fundContract.getProposalInfo(proposalId);
   console.log("State:", proposal.state); // 0=Created, 1=Authority, 2=Public, 3=Approved...
   ```

4. **Create a test proposal** (if needed):
   - Connect as admin/authority
   - Create a proposal
   - Vote in authority phase to move to PublicVoting
   - Then try to vote

---

## 💡 SUMMARY

| Step | Action | Who | Command |
|------|--------|-----|---------|
| 1 | Deploy SBT | You | `npx hardhat run scripts/deploy-sbt.js --network sepolia` |
| 2 | Deploy Fund Contract | You | `npx hardhat run scripts/deploy.js --network sepolia` |
| 3 | Apply for Voter SBT | Voter | `sbtContract.applyForSBT(voterHash)` |
| 4 | Approve Voter | Owner | `sbtContract.approveApplication(voter, nullifier)` |
| 5 | Link SBT to Fund | Owner | `fundContract.setSBTContract(sbtAddress)` |
| 6 | Vote on Proposal | Voter | `fundContract.publicVoteOnProposal(proposalId, true, "comment")` |

---

**Everything should now work!** 🎉

Need help with contract deployment? See: `SETUP_COMPLETE.md` → Smart Contracts section

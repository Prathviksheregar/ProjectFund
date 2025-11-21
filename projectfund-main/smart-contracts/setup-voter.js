const hre = require("hardhat");

async function main() {
  try {
    console.log("=== Registering Public Voter via Test Account ===\n");
    
    const signers = await hre.ethers.getSigners();
    const admin = signers[0];
    const testVoter = signers[2]; // Use account #2 as intermediary
    
    console.log("Admin:", admin.address);
    console.log("Test Voter:", testVoter.address);
    
    // Find SBT contract
    const provider = hre.ethers.provider;
    const possibleAddresses = [
      "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Latest SBT
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Previous SBT
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    ];
    
    let sbtAddress = null;
    for (const addr of possibleAddresses) {
      const code = await provider.getCode(addr);
      if (code !== "0x") {
        sbtAddress = addr;
        break;
      }
    }
    
    if (!sbtAddress) {
      console.log("✗ SBT contract not found");
      process.exit(1);
    }
    
    const sbtContract = await hre.ethers.getContractAt("SBT", sbtAddress);
    console.log(`\n✓ Found SBT at: ${sbtAddress}`);
    
    // The target address to register
    const targetAddress = "0x8b51eb6dca86274aaef40100ac5b0499f2cf6888";
    
    // Check if already registered
    console.log(`\nChecking if ${targetAddress} is registered...`);
    const isRegistered = await sbtContract.isRegisteredVoter(targetAddress);
    
    if (isRegistered) {
      console.log("✓ Already registered!");
      process.exit(0);
    }
    
    console.log("Not registered yet.\n");
    console.log("Since the target address is not a test account, we'll:");
    console.log("1. Register a test account as public voter");
    console.log("2. User can import that test account via MetaMask\n");
    
    // Step 1: Test voter applies
    console.log(`Step 1: Test account applying for SBT...`);
    const voterHash = hre.ethers.id("voter_" + testVoter.address);
    const applyTx = await sbtContract.connect(testVoter).applyForSBT(voterHash);
    await applyTx.wait();
    console.log(`✓ Application submitted from ${testVoter.address}\n`);
    
    // Step 2: Admin approves
    console.log(`Step 2: Admin approving...`);
    const nullifier = Math.floor(Math.random() * 1000000);
    const approveTx = await sbtContract.connect(admin).approveApplication(testVoter.address, nullifier);
    const receipt = await approveTx.wait();
    console.log(`✓ Approved on block #${receipt.blockNumber}\n`);
    
    // Verify
    const verified = await sbtContract.isRegisteredVoter(testVoter.address);
    if (verified) {
      console.log(`✅ Success! ${testVoter.address} is now a registered voter\n`);
      console.log(`To use this account in MetaMask:`);
      console.log(`1. Open MetaMask`);
      console.log(`2. Go to: Settings > Security & Privacy > Show Test Networks: ON`);
      console.log(`3. Add new account and import private key:`);
      console.log(`   0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
      console.log(`\nThis account can now vote on public proposals!`);
    }
    
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  }
}

main();

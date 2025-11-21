const hre = require("hardhat");

async function main() {
  try {
    const [admin] = await hre.ethers.getSigners();
    
    console.log("=== Registering Public Voter on Local Hardhat ===\n");
    console.log("Admin account:", admin.address);
    
    // Get SBT contract (should already be deployed on local node)
    // We need to find the address it was deployed to
    const SBT = await hre.ethers.getContractFactory("SBT");
    
    // Try to get it from recent transactions or use a known address
    // For now, let's deploy a fresh one if needed
    console.log("Getting SBT contract...");
    
    // Get all deployed contracts - try common patterns
    // The contracts are usually deployed in order during Hardhat node startup
    const provider = hre.ethers.provider;
    
    // Try common addresses from recent deployment
    const possibleAddresses = [
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // First deployment
      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", // Second SBT deployment
      "0x5FbDB2315678afccb333f8a9c72ff1642bae123ab", // First contract
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Second contract
      "0xC80B845A6359381b77AA7E06b64277cf82Cb9F13", // From frontend env (might be Sepolia)
    ];
    
    let sbtContract = null;
    let sbtAddress = null;
    
    for (const addr of possibleAddresses) {
      try {
        const code = await provider.getCode(addr);
        if (code !== "0x") {
          console.log(`Found contract code at ${addr}`);
          sbtContract = await hre.ethers.getContractAt("SBT", addr);
          sbtAddress = addr;
          break;
        }
      } catch (e) {
        // Continue to next address
      }
    }
    
    if (!sbtContract) {
      console.log("\n✗ Could not find SBT contract at known addresses");
      console.log("Please redeploy contracts or provide the correct SBT address");
      process.exit(1);
    }
    
    console.log(`\n✓ Found SBT contract at: ${sbtAddress}\n`);
    
    // User to register
    const userAddress = "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC";
    
    // Check if already registered
    console.log(`Checking if ${userAddress} is already registered...`);
    const isRegistered = await sbtContract.isRegisteredVoter(userAddress);
    
    if (isRegistered) {
      console.log("✓ User is already registered as a voter!");
      process.exit(0);
    }
    
    console.log("Not yet registered. Attempting to register...\n");
    
    // To register, we need:
    // 1. User applies with applyForSBT(voterHash)
    // 2. Admin approves with approveApplication(address, nullifier)
    
    const voterHash = hre.ethers.id("public_voter_" + userAddress);
    console.log(`Generated voter hash: ${voterHash}`);
    
    // Step 1: User applies for SBT
    // We'll need to call as the user would, but for testing we can impersonate
    console.log(`Step 1: Creating application for ${userAddress}...`);
    
    // To simulate user action, get a signer for that address if possible
    // For now, just set the application directly by having the user apply first
    // This requires the user to sign, which we can't do here
    // Instead, let's just approve directly (as admin, we have this privilege)
    
    // Actually, for a simpler test approach: 
    // Let's just set the voter as registered directly (if permitted)
    // Or we call approveApplication without checking if application exists
    
    // Looking at the SBT contract, approveApplication checks:
    // require(applications[applicant] != bytes32(0), "No application found");
    // So we MUST have an application first
    
    // For testing purposes, we can modify the approach:
    // Get contract owner/admin and call approveApplication with a fake application
    const nullifier = 1;
    
    // Actually, let me check if we can manually set the application mapping
    // The contract likely doesn't allow direct setting, so let's use a different approach
    
    // Instead of approveApplication, let's see if there's a way to directly register
    // Or let's create a temporary script that allows the user to call applyForSBT first
    
    console.log("Note: User must first call applyForSBT() before admin can approve");
    console.log("For local testing, we'll simulate the complete flow...\n");
    
    // For testing, let's assume the application exists and just try to approve
    // But first, let me try a different approach - check if we can call applyForSBT
    // We could potentially get the user signer if it's one of the test accounts
    
    const [, account2] = await hre.ethers.getSigners();
    if (account2.address.toLowerCase() === userAddress.toLowerCase()) {
      console.log("User account found in signers, proceeding with application...");
      const applyTx = await sbtContract.connect(account2).applyForSBT(voterHash);
      await applyTx.wait();
      console.log("✓ Application submitted by user");
    } else {
      console.log("User account not in signers, using manual registration approach...");
      // For manual testing, try using the voting mechanism in PublicFundManagement instead
      console.log("Alternatively: User can call applyForSBT from MetaMask wallet");
    }
    
    // Step 2: Admin approves
    console.log(`\nStep 2: Admin approving application...`);
    const approveTx = await sbtContract.approveApplication(userAddress, nullifier);
    const receipt = await approveTx.wait();
    
    console.log(`\n✅ Successfully registered ${userAddress} as a public voter!`);
    console.log(`   Transaction: ${receipt.transactionHash}`);
    console.log(`   Block: #${receipt.blockNumber}`);
    
    // Verify registration
    const verified = await sbtContract.isRegisteredVoter(userAddress);
    if (verified) {
      console.log(`\n✓ Verification successful: User is now a registered voter`);
    }
    
  } catch (error) {
    console.error("\n✗ Error registering voter:");
    console.error(error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

main();

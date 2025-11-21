const hre = require("hardhat");

async function main() {
  try {
    const [admin] = await hre.ethers.getSigners();
    
    console.log("=== Registering Public Voter ===\n");
    console.log("Admin account:", admin.address);
    
    // Find SBT contract
    const provider = hre.ethers.provider;
    const possibleAddresses = [
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
    console.log(`✓ Found SBT at: ${sbtAddress}\n`);
    
    // The address to register as public voter
    const userAddress = "0x8b51eb6dca86274aaef40100ac5b0499f2cf6888";
    
    // Check if already registered
    console.log(`Checking if ${userAddress} is already registered...`);
    const isRegistered = await sbtContract.isRegisteredVoter(userAddress);
    
    if (isRegistered) {
      console.log("✓ User is already registered as a voter!");
      process.exit(0);
    }
    
    console.log("Not yet registered. Proceeding with registration...\n");
    
    // We'll try to get the user signer if they're one of the test accounts
    // Otherwise, we can have admin submit the application on behalf of the user
    const signers = await hre.ethers.getSigners();
    let userSigner = null;
    
    // Check if this address is in our signers
    for (const signer of signers) {
      if (signer.address.toLowerCase() === userAddress.toLowerCase()) {
        userSigner = signer;
        break;
      }
    }
    
    if (userSigner) {
      console.log(`✓ Found user account in signers\n`);
      
      // Step 1: User applies for SBT
      console.log(`Step 1: ${userAddress} applying for SBT...`);
      const voterHash = hre.ethers.id("voter_" + userAddress);
      const applyTx = await sbtContract.connect(userSigner).applyForSBT(voterHash);
      await applyTx.wait();
      console.log("✓ Application submitted\n");
      
      // Step 2: Admin approves
      console.log(`Step 2: Admin approving application...`);
      const nullifier = Math.floor(Math.random() * 1000000);
      const approveTx = await sbtContract.connect(admin).approveApplication(userAddress, nullifier);
      const receipt = await approveTx.wait();
      console.log(`✓ Application approved`);
      console.log(`  Block: #${receipt.blockNumber}\n`);
    } else {
      console.log(`⚠ User account not found in signers`);
      console.log(`User would need to call applyForSBT() from their MetaMask wallet first\n`);
      console.log(`For testing: Use one of these test accounts instead:`);
      for (let i = 1; i < Math.min(5, signers.length); i++) {
        console.log(`  ${signers[i].address}`);
      }
      process.exit(1);
    }
    
    // Verify
    console.log(`Verifying registration...`);
    const verified = await sbtContract.isRegisteredVoter(userAddress);
    if (verified) {
      console.log(`\n✅ Success! ${userAddress} is now a registered public voter`);
      console.log(`\nThis account can now:`);
      console.log(`  • Vote on public voting proposals`);
      console.log(`  • Use the MetaMask wallet to participate`);
    } else {
      console.log(`\n✗ Verification failed`);
    }
    
  } catch (error) {
    console.error("\n✗ Error:");
    console.error(error.message);
    process.exit(1);
  }
}

main();

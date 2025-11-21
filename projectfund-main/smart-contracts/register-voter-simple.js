const hre = require("hardhat");

async function main() {
  try {
    const signers = await hre.ethers.getSigners();
    
    console.log("=== Available Hardhat Test Accounts ===\n");
    for (let i = 0; i < Math.min(5, signers.length); i++) {
      console.log(`Account ${i}: ${signers[i].address}`);
    }
    
    // Use account 1 as our "public voter"
    const publicVoter = signers[1];
    const admin = signers[0];
    
    console.log(`\nAdmin: ${admin.address}`);
    console.log(`Public Voter to register: ${publicVoter.address}\n`);
    
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
    
    // Step 1: Public voter applies for SBT
    console.log(`Step 1: ${publicVoter.address} applying for SBT...`);
    const voterHash = hre.ethers.id("voter_" + publicVoter.address);
    const applyTx = await sbtContract.connect(publicVoter).applyForSBT(voterHash);
    await applyTx.wait();
    console.log("✓ Application submitted\n");
    
    // Step 2: Admin approves the application
    console.log(`Step 2: Admin approving application...`);
    const nullifier = 1;
    const approveTx = await sbtContract.connect(admin).approveApplication(publicVoter.address, nullifier);
    const receipt = await approveTx.wait();
    console.log(`✓ Application approved`);
    console.log(`  Transaction: ${receipt.transactionHash}`);
    console.log(`  Block: #${receipt.blockNumber}\n`);
    
    // Verify
    console.log(`Verifying registration...`);
    const isRegistered = await sbtContract.isRegisteredVoter(publicVoter.address);
    if (isRegistered) {
      console.log(`\n✅ Success! ${publicVoter.address} is now a registered voter`);
      console.log(`\nNow update your MetaMask to use this address:`)
      console.log(`Address: ${publicVoter.address}`);
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

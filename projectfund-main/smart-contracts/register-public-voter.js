const hre = require("hardhat");

async function main() {
  const [admin] = await hre.ethers.getSigners();
  
  // SBT contract address (from deployment)
  const SBT_ADDRESS = "0xC80B845A6359381b77AA7E06b64277cf82Cb9F13"; // From frontend .env
  
  // User to register
  const userAddress = "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC";
  
  try {
    // Get SBT contract
    const SBT = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);
    
    console.log(`\nAttempting to register public user: ${userAddress}`);
    console.log(`Using SBT contract at: ${SBT_ADDRESS}\n`);
    
    // Check if already registered
    const isRegistered = await SBT.isRegisteredVoter(userAddress);
    if (isRegistered) {
      console.log("✓ User is already registered as a voter!");
      process.exit(0);
    }
    
    // First, submit application (the user would normally do this)
    // We'll do it as admin for testing
    console.log("Submitting application...");
    const voterHash = hre.ethers.id("voter_hash_" + userAddress);
    
    // Impersonate the user by using ethers with the user signer (if available)
    // For now, we'll just show the process
    console.log("Note: In production, the user would call applyForSBT() with their own account");
    
    // If this was already called by the user, we can directly approve:
    console.log("Approving voter application...");
    const nullifier = 1;
    const tx = await SBT.approveApplication(userAddress, nullifier);
    const receipt = await tx.wait();
    
    console.log(`\n✅ Successfully registered ${userAddress} as a public voter!`);
    console.log(`   Transaction: ${receipt.transactionHash}`);
    console.log(`   Block: #${receipt.blockNumber}`);
    
  } catch (error) {
    console.error("\n✗ Error registering voter:");
    console.error(error.message);
    process.exit(1);
  }
}

main();

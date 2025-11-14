const hre = require("hardhat");

async function main() {
  console.log("=== ProjectFund Voter Registration Tool ===\n");

  // Get environment variables
  const SBT_ADDRESS = process.env.SBT_ADDRESS || process.argv[2];
  const VOTER_ADDRESS = process.env.VOTER_ADDRESS || process.argv[3];

  if (!SBT_ADDRESS || !VOTER_ADDRESS) {
    console.log("Usage: npx hardhat run register-voter-quick.js --network sepolia");
    console.log("\nEnvironment variables:");
    console.log("  SBT_ADDRESS: Your SBT contract address");
    console.log("  VOTER_ADDRESS: The wallet to register as voter\n");
    console.log("Or provide as arguments:");
    console.log("  npx hardhat run register-voter-quick.js --network sepolia 0xSBT_ADDRESS 0xVOTER_ADDRESS\n");
    process.exit(1);
  }

  console.log("Configuration:");
  console.log("  SBT Address:", SBT_ADDRESS);
  console.log("  Voter Address:", VOTER_ADDRESS);
  console.log("");

  // Get the SBT contract
  const sbtContract = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);

  // Step 1: Check current status
  console.log("Step 1: Checking current status...");
  const [hasApplied, isRegistered] = await sbtContract.getApplicationStatus(VOTER_ADDRESS);
  console.log("  Has Applied:", hasApplied);
  console.log("  Is Registered:", isRegistered);

  if (isRegistered) {
    console.log("\n✅ Voter is already registered! No action needed.\n");
    return;
  }

  // Step 2: Apply for SBT (if not already applied)
  if (!hasApplied) {
    console.log("\nStep 2: Applying for Voter SBT...");
    const voterHash = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("voter_" + VOTER_ADDRESS + Date.now())
    );

    try {
      const tx = await sbtContract.applyForSBT(voterHash);
      console.log("  ⏳ Transaction submitted:", tx.hash);
      await tx.wait();
      console.log("  ✅ Application submitted successfully!");
    } catch (error) {
      console.error("  ❌ Error applying for SBT:", error.message);
      process.exit(1);
    }
  } else {
    console.log("\nStep 2: Application already submitted, waiting for owner approval...");
  }

  // Step 3: Inform about approval
  console.log("\nStep 3: Next steps");
  console.log("  ⚠️  The contract owner needs to approve this application.");
  console.log("  📝  Send these details to the owner:\n");
  console.log("    - Voter Address:", VOTER_ADDRESS);
  console.log("    - SBT Address:", SBT_ADDRESS);
  console.log("\n  The owner should run:");
  console.log("    npx hardhat run approve-voter-quick.js --network sepolia");
  console.log("    SBT_ADDRESS=" + SBT_ADDRESS);
  console.log("    VOTER_ADDRESS=" + VOTER_ADDRESS);
  console.log("    NULLIFIER=12345 (any unique number)\n");

  console.log("Step 4: Verify after approval");
  console.log("  After owner approves, run this again to verify:");
  console.log("    npx hardhat run register-voter-quick.js --network sepolia");
  console.log("    SBT_ADDRESS=" + SBT_ADDRESS);
  console.log("    VOTER_ADDRESS=" + VOTER_ADDRESS + "\n");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

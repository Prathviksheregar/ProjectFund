const hre = require("hardhat");

async function main() {
  console.log("=== ProjectFund Admin - Approve Voter ===\n");

  // Get environment variables
  const SBT_ADDRESS = process.env.SBT_ADDRESS || process.argv[2];
  const VOTER_ADDRESS = process.env.VOTER_ADDRESS || process.argv[3];
  const NULLIFIER = parseInt(process.env.NULLIFIER || process.argv[4] || "12345");

  if (!SBT_ADDRESS || !VOTER_ADDRESS) {
    console.log("Usage: npx hardhat run approve-voter-quick.js --network sepolia");
    console.log("\nEnvironment variables:");
    console.log("  SBT_ADDRESS: Your SBT contract address");
    console.log("  VOTER_ADDRESS: The wallet to approve");
    console.log("  NULLIFIER: Unique number for this voter (default: 12345)\n");
    console.log("Or provide as arguments:");
    console.log("  npx hardhat run approve-voter-quick.js --network sepolia 0xSBT 0xVOTER 12345\n");
    process.exit(1);
  }

  console.log("Configuration:");
  console.log("  SBT Address:", SBT_ADDRESS);
  console.log("  Voter Address:", VOTER_ADDRESS);
  console.log("  Nullifier:", NULLIFIER);
  console.log("");

  // Get the SBT contract
  const sbtContract = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);

  // Step 1: Check if application exists
  console.log("Step 1: Checking application status...");
  const [hasApplied, isRegistered] = await sbtContract.getApplicationStatus(VOTER_ADDRESS);
  console.log("  Has Applied:", hasApplied);
  console.log("  Is Already Registered:", isRegistered);

  if (!hasApplied && !isRegistered) {
    console.log("  ❌ No application found for this address!");
    console.log("  Please have the voter run: register-voter-quick.js first\n");
    process.exit(1);
  }

  if (isRegistered) {
    console.log("  ✅ Already registered! No action needed.\n");
    return;
  }

  // Step 2: Approve the application
  console.log("\nStep 2: Approving voter...");
  try {
    const tx = await sbtContract.approveApplication(VOTER_ADDRESS, NULLIFIER);
    console.log("  ⏳ Transaction submitted:", tx.hash);
    await tx.wait();
    console.log("  ✅ Voter approved successfully!");
  } catch (error) {
    console.error("  ❌ Error approving voter:", error.message);
    process.exit(1);
  }

  // Step 3: Verify
  console.log("\nStep 3: Verifying registration...");
  const verified = await sbtContract.isRegisteredVoter(VOTER_ADDRESS);
  if (verified) {
    console.log("  ✅ Voter is now registered!\n");
    console.log("The voter can now vote on proposals.");
  } else {
    console.log("  ⚠️  Verification failed. Please wait a moment and try again.\n");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

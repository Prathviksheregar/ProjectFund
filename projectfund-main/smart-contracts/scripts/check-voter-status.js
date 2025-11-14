const hre = require("hardhat");

async function main() {
  console.log("=== ProjectFund Voter Status Checker ===\n");

  // Get environment variables
  const SBT_ADDRESS = process.env.SBT_ADDRESS || process.argv[2];
  const VOTER_ADDRESS = process.env.VOTER_ADDRESS || process.argv[3];

  if (!SBT_ADDRESS || !VOTER_ADDRESS) {
    console.log("Usage: npx hardhat run check-voter-status.js --network sepolia");
    console.log("\nEnvironment variables:");
    console.log("  SBT_ADDRESS: Your SBT contract address");
    console.log("  VOTER_ADDRESS: The wallet to check\n");
    console.log("Or provide as arguments:");
    console.log("  npx hardhat run check-voter-status.js --network sepolia 0xSBT 0xVOTER\n");
    process.exit(1);
  }

  console.log("Checking voter status...\n");
  console.log("  SBT Address:", SBT_ADDRESS);
  console.log("  Voter Address:", VOTER_ADDRESS);
  console.log("");

  try {
    // Get the SBT contract
    const sbtContract = await hre.ethers.getContractAt("SBT", SBT_ADDRESS);

    // Check application status
    console.log("📋 Application Status:");
    const [hasApplied, isRegistered] = await sbtContract.getApplicationStatus(VOTER_ADDRESS);
    console.log("  Has Applied: ", hasApplied ? "✅ Yes" : "❌ No");
    console.log("  Is Registered: ", isRegistered ? "✅ Yes" : "❌ No");

    // Get voter count
    const voterCount = await sbtContract.getVoterCount();
    console.log("\n📊 Contract Stats:");
    console.log("  Total Voters:", voterCount.toString());

    // If registered, try to get token ID
    if (isRegistered) {
      try {
        const tokenId = await sbtContract.getTokenIdByAddress(VOTER_ADDRESS);
        console.log("\n🎫 Voter SBT Token:");
        console.log("  Token ID:", tokenId.toString());
        console.log("  Status: ✅ Can vote on proposals");
      } catch (e) {
        console.log("\n⚠️  Token lookup failed:", e.message);
      }
    } else {
      console.log("\n⚠️  Status: Not registered yet");
      if (!hasApplied) {
        console.log("  Next step: Register using register-voter-quick.js");
      } else {
        console.log("  Next step: Wait for owner to approve using approve-voter-quick.js");
      }
    }

    console.log("");
  } catch (error) {
    console.error("❌ Error checking status:", error.message);
    console.log("\n⚠️  Make sure:");
    console.log("  1. You're on the correct network (Sepolia)");
    console.log("  2. The SBT address is correct");
    console.log("  3. The contract is deployed and verified");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

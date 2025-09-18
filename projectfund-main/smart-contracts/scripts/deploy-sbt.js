const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  try {
    // Deploy SBT contract
    console.log("Deploying SBT token contract...");
    const SBT = await ethers.getContractFactory("SBT");
    const sbt = await SBT.deploy();
    await sbt.waitForDeployment();
    
    const sbtAddress = await sbt.getAddress();
    console.log("SBT token deployed to:", sbtAddress);
    
    // Print instructions
    console.log("\n----------------------------------");
    console.log("IMPORTANT: Update your frontend .env file with:");
    console.log(`NEXT_PUBLIC_SBT_CONTRACT=${sbtAddress}`);
    console.log("----------------------------------\n");
    
    return sbtAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then((address) => {
    console.log("Deployment successful! SBT address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

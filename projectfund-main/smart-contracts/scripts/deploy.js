const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SBT contract
  console.log("Deploying SBT...");
  const SBT = await ethers.getContractFactory("SBT");
  const sbt = await SBT.deploy();
  await sbt.waitForDeployment();
  const sbtAddress = await sbt.getAddress();
  console.log("SBT deployed to:", sbtAddress);

  // Deploy PublicFundManagement contract
  console.log("Deploying PublicFundManagement...");
  const PublicFundManagement = await ethers.getContractFactory("PublicFundManagement");
  const publicFundManagement = await PublicFundManagement.deploy(sbtAddress);
  await publicFundManagement.waitForDeployment();
  const publicFundManagementAddress = await publicFundManagement.getAddress();
  console.log("PublicFundManagement deployed to:", publicFundManagementAddress);

  // Update frontend .env file
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env");
  let envContent = "";
  
  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  }

  // Update contract addresses
  const sbtTokenRegex = /NEXT_PUBLIC_SBT_CONTRACT=.*/;
  const fundManagementRegex = /NEXT_PUBLIC_FUND_MANAGEMENT_CONTRACT=.*/;

  if (sbtTokenRegex.test(envContent)) {
    envContent = envContent.replace(sbtTokenRegex, `NEXT_PUBLIC_SBT_CONTRACT=${sbtAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_SBT_CONTRACT=${sbtAddress}`;
  }

  if (fundManagementRegex.test(envContent)) {
    envContent = envContent.replace(fundManagementRegex, `NEXT_PUBLIC_FUND_MANAGEMENT_CONTRACT=${publicFundManagementAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_FUND_MANAGEMENT_CONTRACT=${publicFundManagementAddress}`;
  }

  fs.writeFileSync(frontendEnvPath, envContent);

  console.log(".env.local file updated successfully!");

  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("SBT Contract:", sbtAddress);
  console.log("PublicFundManagement Contract:", publicFundManagementAddress);
  console.log("Network: Sepolia");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
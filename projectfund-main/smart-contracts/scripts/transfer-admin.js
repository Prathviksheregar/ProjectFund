// scripts/transfer-admin.js
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.FUND_MANAGEMENT_CONTRACT || "0x3A7C892248f9024d2Bfe9dE91A26C5F24e9E9641";
  const newAdmin = "0x77a9880fc1637d02e988049c3057ddf9fa43119b";

  const PublicFundManagement = await ethers.getContractAt("PublicFundManagement", contractAddress);
  const tx = await PublicFundManagement.transferAdmin(newAdmin);
  await tx.wait();
  console.log(`Admin transferred to: ${newAdmin}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

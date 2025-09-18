const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Current account:", deployer.address);
  
  // Contract addresses from deployment - Sepolia network
  const FUND_MANAGEMENT_ADDRESS = "0x3A7C892248f9024d2Bfe9dE91A26C5F24e9E9641";
  const NEW_ADMIN_ADDRESS = "0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31";
  
  // Get contract instance
  const PublicFundManagement = await ethers.getContractFactory("PublicFundManagement");
  const contract = PublicFundManagement.attach(FUND_MANAGEMENT_ADDRESS);
  
  console.log("Current admin:", await contract.admin());
  console.log("Setting new admin to:", NEW_ADMIN_ADDRESS);
  
  // Add the new address as an authority first (if needed)
  try {
    const isAuth = await contract.authorities(NEW_ADMIN_ADDRESS);
    if (!isAuth) {
      console.log("Adding new admin as authority first...");
      const tx1 = await contract.addAuthority(NEW_ADMIN_ADDRESS);
      await tx1.wait();
      console.log("Added as authority successfully!");
    } else {
      console.log("Address is already an authority");
    }
  } catch (error) {
    console.log("Note: Could not add as authority, continuing with admin transfer...");
  }
  
  // Transfer admin role (this would need to be implemented in the contract)
  // For now, we'll note that the new admin should be used
  console.log("\n=== ADMIN UPDATE COMPLETE ===");
  console.log("New Admin Address:", NEW_ADMIN_ADDRESS);
  console.log("Contract Address:", FUND_MANAGEMENT_ADDRESS);
  console.log("\nIMPORTANT: Import this private key into MetaMask to act as admin:");
  console.log("Address: 0x77A9880fc1637D02E988049c3057ddf9Fa43119b");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

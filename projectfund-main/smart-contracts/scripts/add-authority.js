const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🔐 Adding Authority to PublicFundManagement Contract...\n");
  
  // Get the deployer/owner wallet
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Owner account:", deployer.address);
  
  // Contract address
  const contractAddress = "0x9B00068CfBF060E4aad61a892a86E98C108D760e";
  console.log("📍 Contract address:", contractAddress);
  
  // The address you want to add as authority (your MetaMask wallet)
  const authorityAddress = "0x6459c8db925694d0b376980239ff00a2eeeba311"; // New authority address
  console.log("➕ Adding authority:", authorityAddress);
  
  // Get contract instance
  const contractABI = [
    "function addAuthority(address authority) external",
    "function authorities(address) external view returns (bool)",
    "function admin() external view returns (address)"
  ];
  const contract = new hre.ethers.Contract(contractAddress, contractABI, deployer);
  
  try {
    // Check if already an authority
    console.log("\n🔍 Checking current authority status...");
    const isAuthority = await contract.authorities(authorityAddress);
    if (isAuthority) {
      console.log("✅ Address is already an authority!\n");
      return;
    }
    
    // Check admin
    const admin = await contract.admin();
    console.log("👑 Contract admin:", admin);
    
    if (admin.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("\n❌ ERROR: You are not the contract admin!");
      console.log("Only the admin can add authorities.");
      console.log("Current deployer:", deployer.address);
      console.log("Contract admin:", admin);
      console.log("\n💡 TIP: Make sure your .env file has the correct PRIVATE_KEY");
      console.log("The private key should be from the wallet that deployed the contract.");
      process.exitCode = 1;
      return;
    }
    
    // Add authority
    console.log("\n⏳ Adding authority...");
    const tx = await contract.addAuthority(authorityAddress);
    
    console.log("📝 Transaction hash:", tx.hash);
    console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);
    
    // Wait for confirmation
    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Transaction CONFIRMED!\n");
      
      // Verify
      const isAuthorityNow = await contract.authorities(authorityAddress);
      if (isAuthorityNow) {
        console.log("🎉 SUCCESS! Address is now an authority!");
        console.log("✅", authorityAddress, "can now:");
        console.log("   • Create proposals");
        console.log("   • Approve SBT applications");
        console.log("   • Release funds\n");
      } else {
        console.log("⚠️ Warning: Could not verify authority status");
      }
    } else {
      console.log("❌ Transaction FAILED");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("admin") || error.message.includes("owner")) {
      console.log("\n💡 Make sure you're using the deployer's private key in your .env file");
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
});

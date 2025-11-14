const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🚀 Funding PublicFundManagement Contract...\n");
  
  // Get the deployer wallet
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Sending from account:", deployer.address);
  
  // Get deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Current balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Contract address
  const contractAddress = "0x9B00068CfBF060E4aad61a892a86E98C108D760e";
  console.log("📍 Contract address:", contractAddress);
  
  // Check contract balance before
  const contractBalanceBefore = await hre.ethers.provider.getBalance(contractAddress);
  console.log("📊 Contract balance BEFORE:", hre.ethers.formatEther(contractBalanceBefore), "ETH\n");
  
  // Amount to send (0.03 ETH)
  const amountToSend = hre.ethers.parseEther("0.03");
  console.log("💸 Depositing:", hre.ethers.formatEther(amountToSend), "ETH...\n");
  
  // Get contract instance
  const contractABI = [
    "function depositFunds() external payable"
  ];
  const contract = new hre.ethers.Contract(contractAddress, contractABI, deployer);
  
  // Call depositFunds function
  console.log("⏳ Transaction pending...");
  const tx = await contract.depositFunds({ value: amountToSend });
  
  console.log("📝 Transaction hash:", tx.hash);
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/tx/" + tx.hash);
  
  // Wait for confirmation
  console.log("\n⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  
  if (receipt.status === 1) {
    console.log("✅ Transaction CONFIRMED!\n");
    
    // Check contract balance after
    const contractBalanceAfter = await hre.ethers.provider.getBalance(contractAddress);
    console.log("📊 Contract balance AFTER:", hre.ethers.formatEther(contractBalanceAfter), "ETH");
    
    // Check deployer balance after
    const balanceAfter = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Your balance AFTER:", hre.ethers.formatEther(balanceAfter), "ETH\n");
    
    console.log("🎉 SUCCESS! Contract is now funded and ready to distribute funds!\n");
    console.log("📋 Next Steps:");
    console.log("   1. Test SBT application");
    console.log("   2. Create a proposal");
    console.log("   3. Vote and release funds\n");
  } else {
    console.log("❌ Transaction FAILED");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
});

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("\n🔍 Checking Contract Balance...\n");
  
  const contractAddress = "0xAe28655F95F45F28f600793073aC875AE5191549";
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📍 Deployer account:", deployer.address);
  
  // Get deployer balance
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(deployerBalance), "ETH");
  
  // Get contract balance
  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  console.log("📊 Contract balance:", hre.ethers.formatEther(contractBalance), "ETH\n");
  
  if (hre.ethers.formatEther(contractBalance) === "0.0") {
    console.log("⚠️  Contract balance is 0.0 ETH. Restoring funds...\n");
    
    // Amount to send (0.05 ETH)
    const amountToSend = hre.ethers.parseEther("0.05");
    console.log("💸 Depositing:", hre.ethers.formatEther(amountToSend), "ETH...");
    
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
      
      console.log("\n🎉 SUCCESS! Contract balance restored!\n");
    } else {
      console.log("❌ Transaction FAILED");
      process.exitCode = 1;
    }
  } else {
    console.log("✅ Contract already has funds:", hre.ethers.formatEther(contractBalance), "ETH");
  }
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
});

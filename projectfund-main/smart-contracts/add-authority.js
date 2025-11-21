const hre = require("hardhat");

async function addAuthority() {
  try {
    // The authority address to add
    const authorityAddress = "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC";
    
    // Contract address - use the latest deployment
    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Latest from deployment
    
    // Get the contract instance
    const PublicFundManagement = await hre.ethers.getContractFactory("PublicFundManagement");
    const contract = await PublicFundManagement.attach(contractAddress);
    
    console.log(`Adding authority: ${authorityAddress}`);
    console.log(`Contract: ${contractAddress}`);
    
    // Call addAuthority function
    const tx = await contract.addAuthority(authorityAddress);
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log("Receipt:", receipt);
    
    console.log(`✅ Authority ${authorityAddress} has been added successfully!`);
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

addAuthority();

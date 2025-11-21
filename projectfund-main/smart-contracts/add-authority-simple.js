const { ethers } = require('ethers');

async function main() {
  console.log("\n🔐 Adding Authority...\n");
  
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Use the first account (admin)
  const adminPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const signer = new ethers.Wallet(adminPrivateKey, provider);
  
  console.log("👤 Admin account:", signer.address);
  
  const contractAddress = "0x9B00068CfBF060E4aad61a892a86E98C108D760e";
  const authorityAddress = "0x6459c8db925694d0b376980239ff00a2eeeba311";
  
  console.log("📍 Contract:", contractAddress);
  console.log("➕ Adding as authority:", authorityAddress);
  
  const contractABI = [
    "function addAuthority(address authority) external",
    "function authorities(address) external view returns (bool)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  try {
    // Check if already an authority
    console.log("\n🔍 Checking current status...");
    const isAuthority = await contract.authorities(authorityAddress);
    if (isAuthority) {
      console.log("✅ Already an authority!\n");
      return;
    }
    
    console.log("⏳ Not yet an authority, adding...\n");
    
    const tx = await contract.addAuthority(authorityAddress);
    console.log("📝 Transaction hash:", tx.hash);
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ SUCCESS! Transaction confirmed!\n");
      
      const isAuthorityNow = await contract.authorities(authorityAddress);
      if (isAuthorityNow) {
        console.log("🎉 Address is now an authority!");
        console.log("✅", authorityAddress, "\n");
      }
    } else {
      console.log("❌ Transaction failed");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

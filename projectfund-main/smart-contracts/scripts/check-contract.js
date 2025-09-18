const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  
  // The address we want to check
  const contractAddress = "0x46F27CE202dFEa1d7eD6Cc9EA9d4f586352a8e31";
  
  console.log("Checking if address is a contract:", contractAddress);
  
  // Get the code at the address
  const code = await provider.getCode(contractAddress);
  
  // If code is just "0x", it's not a contract
  if (code === "0x") {
    console.log("The address is NOT a contract! It's a regular wallet address.");
  } else {
    console.log("The address is a contract.");
    console.log("Contract bytecode:", code);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

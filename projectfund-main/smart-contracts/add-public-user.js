const hre = require("hardhat");

async function addPublicUser() {
  try {
    // The public user address to add
    const publicUserAddress = "0x8ffB13e194414c545870F8BD2feeeDD1d47f5fEC";
    
    console.log(`Adding public user: ${publicUserAddress}`);
    
    // Get the SBT contract - we need to interact with it to register this voter
    // First, let's get the accounts
    const [admin] = await hre.ethers.getSigners();
    
    console.log(`Admin account: ${admin.address}`);
    
    // Get the PublicFundManagement contract address from deployment
    const publicFundAddress = "0xAe28655F95F45F28f600793073aC875AE5191549";
    
    // Get the PublicFundManagement contract
    const PublicFundManagement = await hre.ethers.getContractFactory("PublicFundManagement");
    const publicFundContract = PublicFundManagement.attach(publicFundAddress);
    
    // Get the SBT contract address from the PublicFundManagement contract
    const sbtAddress = await publicFundContract.sbtContract();
    console.log(`SBT Contract Address: ${sbtAddress}`);
    
    // Get the SBT contract
    const SBT = await hre.ethers.getContractFactory("SimpleSBT");
    const sbtContract = SBT.attach(sbtAddress);
    
    // Register the user as a voter on the SBT contract
    console.log(`Registering ${publicUserAddress} as a voter...`);
    const registerTx = await sbtContract.registerVoter(publicUserAddress);
    console.log("Transaction sent:", registerTx.hash);
    
    // Wait for transaction to be mined
    const receipt = await registerTx.wait();
    console.log("Transaction confirmed!");
    console.log("Receipt:", receipt);
    
    // Verify the user is registered
    const isRegistered = await sbtContract.isRegisteredVoter(publicUserAddress);
    console.log(`Is ${publicUserAddress} registered as voter?`, isRegistered);
    
    if (isRegistered) {
      console.log(`✅ Public user ${publicUserAddress} has been registered successfully!`);
    } else {
      console.log(`❌ Failed to register public user`);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

addPublicUser();

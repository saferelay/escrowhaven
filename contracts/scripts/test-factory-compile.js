const hre = require("hardhat");

async function main() {
  console.log("Testing factory compilation...");
  
  try {
    // Just try to get the factory
    const Factory = await hre.ethers.getContractFactory("SafeRelayFactoryV2_1");
    console.log("✅ Factory contract found and compiled!");
    
    // Check if we can get the EIP-712 escrow
    const Escrow = await hre.ethers.getContractFactory("SafeRelayEscrowV2_1");
    console.log("✅ Escrow contract found and compiled!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);

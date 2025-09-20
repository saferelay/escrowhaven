const hre = require("hardhat");

async function main() {
  console.log("Starting contract verification on Polygon Mainnet...\n");

  // Factory Contract
  const FACTORY_ADDRESS = "0xb6Ac0936f512e1c79C8514A417d127D034Cb2045";
  
  console.log("1. Verifying Factory Contract...");
  console.log("   Address:", FACTORY_ADDRESS);
  
  try {
    await hre.run("verify:verify", {
      address: FACTORY_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ Factory verified successfully!\n");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Factory already verified\n");
    } else {
      console.error("❌ Factory verification failed:", error.message, "\n");
    }
  }
  
  console.log("View on Polygonscan:");
  console.log(`https://polygonscan.com/address/${FACTORY_ADDRESS}#code`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
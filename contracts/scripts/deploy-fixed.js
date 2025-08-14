const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Starting deployment to Base Sepolia...");
    console.log("Time:", new Date().toISOString());
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);
    
    // Check balance (updated syntax)
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      console.error("❌ ERROR: No ETH in wallet!");
      console.log("Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
      console.log("Your address:", deployer.address);
      process.exit(1);
    }
    
    // Deploy Factory
    console.log("\n📝 Deploying TransparentEscrowFactory...");
    const Factory = await hre.ethers.getContractFactory("TransparentEscrowFactory");
    
    console.log("⏳ Sending transaction...");
    const factory = await Factory.deploy();
    
    console.log("⏳ Waiting for confirmation...");
    const deployTx = await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("\n✅ SUCCESS!");
    console.log("🏭 Factory deployed to:", factoryAddress);
    console.log("\n📌 SAVE THIS ADDRESS:", factoryAddress);
    
    // Try to create a test escrow
    console.log("\n🧪 Creating test escrow...");
    const tx = await factory.createEscrowWithSplitter(
      deployer.address, // Use deployer as freelancer for testing
      hre.ethers.parseUnits("10", 6) // 10 USDC
    );
    
    console.log("⏳ Waiting for test escrow...");
    const receipt = await tx.wait();
    console.log("✅ Test escrow created!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

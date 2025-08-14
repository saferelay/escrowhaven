const hre = require("hardhat");

async function main() {
  try {
    console.log("🚀 Starting deployment to Base Sepolia...");
    console.log("Time:", new Date().toISOString());
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("💰 Balance:", hre.ethers.utils.formatEther(balance), "ETH");
    
    if (balance.eq(0)) {
      console.error("❌ ERROR: No ETH in wallet!");
      console.log("Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
      console.log("Your address:", deployer.address);
      process.exit(1);
    }
    
    // Check network
    const network = await hre.ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
    
    // Deploy Factory
    console.log("\n📝 Deploying TransparentEscrowFactory...");
    const Factory = await hre.ethers.getContractFactory("TransparentEscrowFactory");
    
    console.log("⏳ Sending transaction...");
    const factory = await Factory.deploy();
    
    console.log("⏳ Waiting for confirmation...");
    console.log("📋 Transaction hash:", factory.deployTransaction.hash);
    
    await factory.deployed();
    
    console.log("\n✅ SUCCESS!");
    console.log("🏭 Factory deployed to:", factory.address);
    console.log("\n📌 SAVE THIS ADDRESS:", factory.address);
    
    // Try to create a test escrow
    console.log("\n🧪 Creating test escrow...");
    const tx = await factory.createEscrowWithSplitter(
      deployer.address, // Use deployer as freelancer for testing
      hre.ethers.utils.parseUnits("10", 6) // 10 USDC
    );
    
    console.log("⏳ Waiting for test escrow...");
    const receipt = await tx.wait();
    console.log("✅ Test escrow created! Gas used:", receipt.gasUsed.toString());
    
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error.message);
    if (error.error) {
      console.error("Details:", error.error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

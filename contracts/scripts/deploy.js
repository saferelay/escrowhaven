const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EscrowFactory to Base Sepolia...");
  
  // Hardcode private key for testing
  const privateKey = "0x721c1ec84ad0afcb5680a54c4acf4767d99e08d9f19052ae6429c3756895d8d3";
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  
  console.log("📝 Deploying with account:", wallet.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient balance for deployment");
  }
  
  // Deploy EscrowFactory
  console.log("⏳ Deploying EscrowFactory...");
  const EscrowFactory = await ethers.getContractFactory("EscrowFactory", wallet);
  const factory = await EscrowFactory.deploy();
  
  console.log("⏳ Waiting for deployment confirmation...");
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("✅ EscrowFactory deployed successfully!");
  console.log("📍 Contract Address:", factoryAddress);
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${factoryAddress}`);
  
  console.log("\n🎉 Deployment complete! Save this address:");
  console.log(`FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

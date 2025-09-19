const hre = require("hardhat");

async function main() {
  // Check we're on mainnet
  if (hre.network.name !== "polygon-mainnet") {
    console.error("❌ This script is for mainnet only!");
    console.error("Run with: --network polygon-mainnet");
    process.exit(1);
  }

  console.log("🚀 Deploying EscrowHavenFactory to Polygon MAINNET...\n");
  console.log("⚠️  USING REAL MONEY NETWORK!\n");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
  
  // Require minimum balance
  if (parseFloat(hre.ethers.formatEther(balance)) < 5) {
    console.error("❌ Insufficient MATIC! Need at least 5 MATIC for deployment");
    console.error("Send MATIC to:", deployer.address);
    process.exit(1);
  }
  
  // Deploy Factory
  console.log("Deploying EscrowHavenFactory...");
  const Factory = await hre.ethers.getContractFactory("EscrowHavenFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ MAINNET Factory deployed to:", factoryAddress);
  
  // Get deployment transaction
  const deployTx = factory.deploymentTransaction();
  console.log("Transaction hash:", deployTx.hash);
  console.log("View on Polygonscan: https://polygonscan.com/tx/" + deployTx.hash);
  
  // Wait for confirmations
  console.log("\nWaiting for 5 confirmations...");
  await deployTx.wait(5);
  console.log("✅ Confirmed!\n");
  
  // Output deployment info
  console.log("\n" + "=".repeat(50));
  console.log("MAINNET DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Add to your .env.local:");
  console.log(`ESCROWHAVEN_FACTORY_ADDRESS_MAINNET=${factoryAddress}`);
  console.log(`NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS_MAINNET=${factoryAddress}`);
  
  console.log("\n📋 Network Info:");
  console.log("Network:", hre.network.name);
  const network = await hre.ethers.provider.getNetwork();
  console.log("Chain ID:", network.chainId.toString());
  
  console.log("\n⚠️  CRITICAL NEXT STEPS:");
  console.log("1. Save this factory address securely!");
  console.log("2. Update .env.local with mainnet addresses");
  console.log("3. Update environment.ts for production");
  console.log("4. Test with small amount first ($1-5)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
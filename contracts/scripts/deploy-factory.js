const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EscrowHavenFactory to Polygon Amoy...\n");
  
  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance - Fixed for ethers v6
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC\n");
  
  // Deploy Factory
  console.log("Deploying EscrowHavenFactory...");
  const Factory = await hre.ethers.getContractFactory("EscrowHavenFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed to:", factoryAddress);
  
  // Get deployment transaction
  const deployTx = factory.deploymentTransaction();
  console.log("Transaction hash:", deployTx.hash);
  
  // Wait for confirmations
  console.log("\nWaiting for 5 confirmations...");
  await deployTx.wait(5);
  console.log("✅ Confirmed!\n");
  
  // Test the prediction function
  console.log("Testing address prediction...");
  const testSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("test-" + Date.now()));
  const testClient = "0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD";
  const testFreelancer = "0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7";
  
  const result = await factory.getVaultAddress(testSalt, testClient, testFreelancer);
  const [predictedVault, predictedSplitter] = result;
  
  console.log("Predicted vault:", predictedVault);
  console.log("Predicted splitter:", predictedSplitter);
  
  // Output deployment info
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE!");
  console.log("=".repeat(50));
  console.log("\n📋 Add to your .env.local:");
  console.log(`NEXT_PUBLIC_ESCROWHAVEN_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`POLYGON_FACTORY_ADDRESS=${factoryAddress}`);
  
  console.log("\n📋 Network Info:");
  console.log("Network:", hre.network.name);
  const network = await hre.ethers.provider.getNetwork();
  console.log("Chain ID:", network.chainId.toString());
  
  console.log("\n⚠️  IMPORTANT NEXT STEPS:");
  console.log("1. Update .env.local with new factory address");
  console.log("2. Update check-and-deploy route.ts FACTORY constant");
  console.log("3. Restart your Next.js server");
  console.log("4. Create a NEW escrow (old ones won't work)");
}

// Run deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeRelay with YOUR Mock USDC...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

  // YOUR Mock USDC on Polygon Amoy
  const YOUR_MOCK_USDC = "0x8B0180f2101c8260d49339abfEe87927412494B4";
  const BACKEND_ADDRESS = deployer.address; // Use deployer as backend for testing
  
  console.log("Using YOUR Mock USDC:", YOUR_MOCK_USDC);
  console.log("Backend address:", BACKEND_ADDRESS);

  // Deploy Factory with YOUR Mock USDC
  const Factory = await hre.ethers.getContractFactory("SafeRelayFactory");
  const factory = await Factory.deploy(BACKEND_ADDRESS, YOUR_MOCK_USDC);
  await factory.deployed();

  console.log("\n✅ SafeRelayFactory deployed to:", factory.address);
  console.log("   - Backend:", BACKEND_ADDRESS);
  console.log("   - USDC:", YOUR_MOCK_USDC);
  
  // Save deployment info
  const deployment = {
    network: hre.network.name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    factory: factory.address,
    backend: BACKEND_ADDRESS,
    usdcAddress: YOUR_MOCK_USDC,
    platformFeeRecipient: "0xE99318b378CC5C163223bbfF06D4d5159E4e5f1e",
    deployedAt: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'saferelay-deployment-fixed.json',
    JSON.stringify(deployment, null, 2)
  );

  console.log("\nDeployment saved to saferelay-deployment-fixed.json");
  
  // Update .env.local
  console.log("\n📝 Add this to your .env.local:");
  console.log(`FACTORY_CONTRACT_ADDRESS=${factory.address}`);
  console.log(`POLYGON_FACTORY_ADDRESS=${factory.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

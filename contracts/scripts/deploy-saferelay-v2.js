const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SafeRelay V2...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get balance (ethers v6 way)
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    console.log("\n❌ No MATIC balance! Get test MATIC from:");
    console.log("https://faucet.polygon.technology/");
    console.log("Your address:", deployer.address);
    return;
  }
  
  // First, let's check if the contracts exist
  const fs = require("fs");
  const contractPath = "./saferelay-v2/SafeRelayFactoryV2.sol";
  
  if (!fs.existsSync(contractPath)) {
    console.log("\n❌ SafeRelayFactoryV2 contract not found!");
    console.log("The V2 contracts need to be created first.");
    console.log("Run the commands from the previous message to create them.");
    return;
  }
  
  try {
    // Compile first
    console.log("\nCompiling contracts...");
    await hre.run("compile");
    
    // Deploy Factory V2
    console.log("\nDeploying SafeRelayFactoryV2...");
    const SafeRelayFactoryV2 = await ethers.getContractFactory("SafeRelayFactoryV2");
    const factory = await SafeRelayFactoryV2.deploy(
      deployer.address, // backend signer
      "0x8B0180f2101c8260d49339abfEe87927412494B4" // Mock USDC on Polygon Amoy
    );
    
    // Wait for deployment
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("SafeRelayFactoryV2 deployed to:", factoryAddress);
    
    // Wait for confirmations
    console.log("Waiting for confirmations...");
    await factory.deploymentTransaction().wait(2);
    
    // Save deployment
    const deployment = {
      network: "polygon-amoy",
      factoryV2: factoryAddress,
      deployedAt: new Date().toISOString(),
      mockUSDC: "0x8B0180f2101c8260d49339abfEe87927412494B4",
      deployer: deployer.address,
      deploymentTx: factory.deploymentTransaction().hash
    };
    
    fs.writeFileSync(
      "./saferelay-v2-deployment.json",
      JSON.stringify(deployment, null, 2)
    );
    
    console.log("\n✅ Deployment complete!");
    console.log("Factory address:", factoryAddress);
    console.log("\nAdd to your .env.local:");
    console.log(`SAFERELAY_FACTORY_V2_ADDRESS=${factoryAddress}`);
    
  } catch (error) {
    console.error("\nDeployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

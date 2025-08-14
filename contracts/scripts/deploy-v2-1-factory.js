const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeRelayFactoryV2_1...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const SafeRelayFactoryV2_1 = await hre.ethers.getContractFactory("contracts/saferelay/SafeRelayFactoryV2_1.sol:SafeRelayFactoryV2_1");
  const factory = await SafeRelayFactoryV2_1.deploy();
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("Factory deployed to:", factoryAddress);
  
  // Verify
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for confirmations...");
    await factory.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [],
        contract: "contracts/saferelay/SafeRelayFactoryV2_1.sol:SafeRelayFactoryV2_1"
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
  
  console.log("\n=== FACTORY DEPLOYMENT COMPLETE ===");
  console.log("Factory address:", factoryAddress);
  console.log("\nUPDATE YOUR .env FILE:");
  console.log(`POLYGON_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
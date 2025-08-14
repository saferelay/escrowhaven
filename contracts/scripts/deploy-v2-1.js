const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeRelayFactoryV2_1 to Polygon Amoy...");
  
  const Factory = await hre.ethers.getContractFactory("SafeRelayFactoryV2_1");
  const factory = await Factory.deploy();
  
  // Wait for deployment - new syntax for ethers v6
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("SafeRelayFactoryV2_1 deployed to:", factoryAddress);
  console.log("\n📝 Add to .env.local:");
  console.log(`SAFERELAY_FACTORY_V2_1_ADDRESS=${factoryAddress}`);
  
  // Wait for confirmations
  console.log("\nWaiting for confirmations...");
  const receipt = await factory.deploymentTransaction().wait(5);
  console.log("✅ Deployment confirmed!");
  
  // Verify on PolygonScan
  console.log("\nVerifying on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: []
    });
    console.log("✅ Contract verified!");
  } catch (err) {
    console.log("❌ Verification failed:", err.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

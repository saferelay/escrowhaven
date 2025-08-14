const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying SafeRelay Contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    console.log("\n❌ No MATIC balance! Get test MATIC from:");
    console.log("https://faucet.polygon.technology/");
    return;
  }
  
  try {
    console.log("\nDeploying SafeRelayFactory...");
    // Just use the contract name - Hardhat will find it
    const SafeRelayFactory = await ethers.getContractFactory("SafeRelayFactory");
    const factory = await SafeRelayFactory.deploy(
      deployer.address, // backend signer
      "0x8B0180f2101c8260d49339abfEe87927412494B4" // Mock USDC on Polygon Amoy
    );
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("SafeRelayFactory deployed to:", factoryAddress);
    
    // Wait for some confirmations
    console.log("Waiting for confirmations...");
    await factory.deploymentTransaction().wait(2);
    
    const deployment = {
      network: "polygon-amoy",
      factory: factoryAddress,
      deployedAt: new Date().toISOString(),
      mockUSDC: "0x8B0180f2101c8260d49339abfEe87927412494B4",
      deployer: deployer.address,
      deploymentTx: factory.deploymentTransaction().hash
    };
    
    fs.writeFileSync(
      "./saferelay-deployment-new.json",
      JSON.stringify(deployment, null, 2)
    );
    
    console.log("\n✅ Deployment complete!");
    console.log("Deployment saved to saferelay-deployment-new.json");
    console.log("\n🔴 Update your .env.local in the root directory:");
    console.log(`SAFERELAY_FACTORY_ADDRESS=${factoryAddress}`);
    
  } catch (error) {
    console.error("\nDeployment failed:", error);
    // More detailed error info
    if (error.reason) console.error("Reason:", error.reason);
    if (error.data) console.error("Data:", error.data);
  }
}

main().catch(console.error);

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting SafeRelay V2 deployment to Polygon Amoy...\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "ChainId:", network.chainId);

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from address:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "MATIC\n");

  try {
    // Deploy SafeRelayFactoryV2
    console.log("Deploying SafeRelayFactoryV2...");
    const SafeRelayFactoryV2 = await hre.ethers.getContractFactory("SafeRelayFactoryV2");
    const factory = await SafeRelayFactoryV2.deploy();
    
    console.log("Waiting for deployment...");
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ SafeRelayFactoryV2 deployed to:", factoryAddress);

    // Wait for some confirmations
    console.log("\nWaiting for confirmations...");
    await factory.deploymentTransaction().wait(3);
    console.log("✅ Confirmed!");

    // Verify the Mock USDC is set correctly
    const mockUSDC = await factory.usdcAddresses(80002); // Polygon Amoy chainId
    console.log("\nMock USDC address for Amoy:", mockUSDC);

    // Save deployment info
    const deploymentInfo = {
      network: "polygon-amoy",
      chainId: network.chainId.toString(),
      contracts: {
        SafeRelayFactoryV2: factoryAddress,
        mockUSDC: mockUSDC
      },
      deployer: deployer.address,
      deployedAt: new Date().toISOString()
    };

    const deploymentPath = path.join(__dirname, "..", "saferelay-v2-deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n📝 Deployment info saved to:", deploymentPath);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Add this to your .env.local:");
    console.log(`SAFERELAY_FACTORY_V2_ADDRESS=${factoryAddress}`);

    // Test creating an escrow
    console.log("\n🧪 Testing escrow creation...");
    const testTx = await factory.createEscrow(
      "test@client.com",
      "test@freelancer.com",
      deployer.address, // Using deployer as test client wallet
      "0x0000000000000000000000000000000000000001", // Dummy freelancer wallet
      hre.ethers.parseUnits("100", 6) // 100 USDC
    );
    
    const receipt = await testTx.wait();
    console.log("✅ Test escrow created! Gas used:", receipt.gasUsed.toString());

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeRelayFactoryV2_1 with EIP-712 support...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get the factory contract
  const Factory = await hre.ethers.getContractFactory("SafeRelayFactoryV2_1");
  
  console.log("Deploying factory...");
  const factory = await Factory.deploy();
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("Factory deployed to:", factoryAddress);
  
  // Test deployment to verify it creates EIP-712 contracts
  console.log("\nTesting factory by creating a test escrow...");
  const testClient = "0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD";
  const testFreelancer = "0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7";
  const testAmount = hre.ethers.parseUnits("1", 6);
  
  const tx = await factory.createEscrow(testClient, testFreelancer, testAmount);
  const receipt = await tx.wait();
  
  const event = receipt.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed.name === 'EscrowCreated';
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = factory.interface.parseLog(event);
    const testEscrowAddress = parsed.args.escrowAddress;
    console.log("Test escrow created at:", testEscrowAddress);
    
    // Verify it's an EIP-712 contract
    const escrowContract = await hre.ethers.getContractAt(
      ["function getDomainSeparator() view returns (bytes32)"],
      testEscrowAddress
    );
    
    try {
      const domainSeparator = await escrowContract.getDomainSeparator();
      console.log("✅ Factory is creating EIP-712 contracts!");
      console.log("Domain Separator:", domainSeparator);
    } catch {
      console.log("❌ Factory is NOT creating EIP-712 contracts");
    }
  }
  
  // Save deployment info
  const fs = require('fs');
  const deployment = {
    factoryAddress: factoryAddress,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contractType: "SafeRelayFactoryV2_1_EIP712"
  };
  
  fs.writeFileSync('../../v2-1-eip712-factory-deployment.json', JSON.stringify(deployment, null, 2));
  
  console.log('\n🚀 DEPLOYMENT COMPLETE!');
  console.log('\n📝 IMPORTANT: Update your .env.local file:');
  console.log(`SAFERELAY_FACTORY_V2_1_ADDRESS=${factoryAddress}`);
  console.log('\nThen restart your Next.js server!');
  
  // Verify on explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    console.log("Verifying factory contract...");
    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: []
      });
      console.log("✅ Contract verified on explorer!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

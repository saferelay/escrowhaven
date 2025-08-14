// scripts/deploy-v2-1-eip712.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeRelayEscrowV2_1 with EIP-712...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy a test escrow to get bytecode
  const SafeRelayEscrowV2_1 = await hre.ethers.getContractFactory("contracts/saferelay/SafeRelayEscrowV2_1_EIP712.sol:SafeRelayEscrowV2_1");
  
  // Test deployment parameters
  const testParams = {
    usdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", // Mock USDC on Polygon Amoy
    client: deployer.address,
    freelancer: deployer.address,
    feeRecipient: "0xE99318b378CC5C163223bbfF06D4d5159E4e5f1e",
    amount: hre.ethers.parseUnits("100", 6) // Updated for ethers v6
  };
  
  const escrow = await SafeRelayEscrowV2_1.deploy(
    testParams.usdc,
    testParams.client,
    testParams.freelancer,
    testParams.feeRecipient,
    testParams.amount
  );
  
  await escrow.waitForDeployment(); // Updated for ethers v6
  const escrowAddress = await escrow.getAddress(); // Updated for ethers v6
  console.log("Test escrow deployed to:", escrowAddress);
  
  // Get the bytecode for the factory
  const bytecode = SafeRelayEscrowV2_1.bytecode;
  console.log("\nBytecode hash:", hre.ethers.keccak256(bytecode).slice(0, 10) + "...");
  console.log("Bytecode length:", bytecode.length);
  
  // Verify the contract
  if (hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await escrow.deploymentTransaction().wait(5); // Updated for ethers v6
    
    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: escrowAddress,
        constructorArguments: [
          testParams.usdc,
          testParams.client,
          testParams.freelancer,
          testParams.feeRecipient,
          testParams.amount
        ],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Implementation address:", escrowAddress);
  console.log("\nNEXT STEPS:");
  console.log("1. Deploy the updated factory");
  console.log("2. Update your .env with the new factory address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
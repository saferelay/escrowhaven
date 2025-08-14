const hre = require("hardhat");

async function main() {
  console.log("Deploying to:", hre.network.name);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance));

  // Deploy EscrowFactory
  const EscrowFactory = await hre.ethers.getContractFactory("EscrowFactory");
  const factory = await EscrowFactory.deploy();
  await factory.deployed();

  console.log("EscrowFactory deployed to:", factory.address);
  
  // Get USDC address for this network
  const usdcAddress = await factory.getUSDCAddress();
  console.log("USDC address on this network:", usdcAddress);
  
  console.log("\n✅ Deployment complete!");
  console.log("====================================");
  console.log("SAVE THIS ADDRESS:");
  console.log("POLYGON_FACTORY_ADDRESS=", factory.address);
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

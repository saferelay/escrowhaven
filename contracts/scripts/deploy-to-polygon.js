const hre = require("hardhat");

async function main() {
  console.log("Deploying to Polygon...");

  // Deploy Factory Contract
  const Factory = await hre.ethers.getContractFactory("TransparentEscrowFactory");
  const factory = await Factory.deploy();
  await factory.deployed();

  console.log("Factory deployed to:", factory.address);
  console.log("Save this address as POLYGON_FACTORY_ADDRESS!");

  // Verify on Polygonscan
  if (hre.network.name === "polygon") {
    console.log("Waiting for Polygonscan verification...");
    await hre.run("verify:verify", {
      address: factory.address,
      constructorArguments: [],
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

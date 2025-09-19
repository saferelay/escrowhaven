const hre = require("hardhat");

async function main() {
  const factoryAddress = "0xF8bB5782143d4c42dE4eA27440ce6a3420eD6AD1";
  const factory = await hre.ethers.getContractAt("EscrowHavenFactory", factoryAddress);
  
  const salt = "0xf81943b04dab995320dee8488f3f34c252239bbd7a3ca6332adeccb75981dc3b";
  const client = "0x7349D3d258cc1938D560EDA424dB3b11a8BD37CD";
  const freelancer = "0xf7AC04242EA50291eFd30AC8A215364D0E1e23d7";
  
  console.log("Deploying vault...");
  
  // Just use high gas limit without specifying price
  const tx = await factory.deployVault(salt, client, freelancer, {
    gasLimit: 3000000
  });
  
  console.log("TX Hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed!");
  
  if (receipt.events && receipt.events[0]) {
    console.log("Vault deployed to:", receipt.events[0].args[0]);
    console.log("Splitter deployed to:", receipt.events[0].args[1]);
  } else {
    console.log("Receipt:", receipt);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
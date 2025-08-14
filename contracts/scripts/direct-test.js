async function test() {
  console.log("Direct connection test...");
  
  try {
    const { ethers } = require('hardhat');
    
    // Your private key (without 0x)
    const PRIVATE_KEY = "721c1ec84ad0afcb5680a54c4acf4767d99e08d9f19052ae6429c3756895d8d3";
    
    console.log("Creating provider...");
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
    
    console.log("Creating wallet...");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log("Wallet address:", wallet.address);
    
    console.log("Getting balance...");
    const balance = await wallet.getBalance();
    console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
    
    console.log("Getting block number...");
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block:", blockNumber);
    
    if (balance.eq(0)) {
      console.log("\n⚠️  WARNING: Your wallet has 0 ETH!");
      console.log("Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();

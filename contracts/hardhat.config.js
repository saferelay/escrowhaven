require("@nomicfoundation/hardhat-ethers");
require("dotenv").config({ path: '../.env.local' }); // Updated to read from parent directory

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    "polygon-amoy": {
      url: process.env.ALCHEMY_API_KEY 
        ? `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 35000000000
    },
    "polygon-mainnet": {
      url: process.env.ALCHEMY_API_KEY
        ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET 
        ? [process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET] 
        : process.env.PRIVATE_KEY 
        ? [process.env.PRIVATE_KEY]
        : [],
      gasPrice: 100000000000, // 100 gwei for faster confirmation
      timeout: 60000 // 60 second timeout for mainnet
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
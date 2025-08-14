const hre = require("hardhat");

console.log("Hardhat config:");
console.log("Sources path:", hre.config.paths.sources);
console.log("Artifacts path:", hre.config.paths.artifacts);
console.log("Contracts in sources:");

const fs = require('fs');
const path = require('path');

try {
  const files = fs.readdirSync(hre.config.paths.sources);
  files.forEach(file => {
    if (file.endsWith('.sol')) {
      console.log(" -", file);
    }
  });
} catch (e) {
  console.log("Error reading sources:", e.message);
}

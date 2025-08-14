console.log("Current directory:", process.cwd());
console.log("Looking for .env file...");

const fs = require('fs');
const path = require('path');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
console.log("Checking path:", envPath);
console.log(".env exists:", fs.existsSync(envPath));

// Load dotenv manually
require('dotenv').config();

console.log("\nEnvironment variables:");
console.log("PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
console.log("PRIVATE_KEY length:", process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.length : 0);

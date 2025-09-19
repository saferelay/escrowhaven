#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 EscrowHaven Environment Configuration Check\n');
console.log('=' .repeat(60));

// Check for environment files
const envFiles = [
  '.env',
  '.env.local', 
  '.env.production',
  '.env.production.local'
];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📄 Found: ${file}`);
    console.log('-'.repeat(40));
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        if (line.trim().startsWith('#')) console.log(line);
        return;
      }
      
      const [key, value] = line.split('=');
      if (!key) return;
      
      // Mask sensitive values but show if they're set
      let displayValue = value ? value.trim() : '';
      
      // Show full value for non-sensitive keys
      const nonSensitiveKeys = [
        'NEXT_PUBLIC_ENVIRONMENT',
        'NEXT_PUBLIC_APP_URL',
        'NODE_ENV',
        'NEXT_PUBLIC_NETWORK',
        'NEXT_PUBLIC_CHAIN_ID'
      ];
      
      if (nonSensitiveKeys.includes(key.trim())) {
        console.log(`${key.trim()}=${displayValue}`);
      } else if (displayValue) {
        // For sensitive keys, show if they're set and first/last few chars
        const maskedValue = displayValue.length > 8 
          ? `${displayValue.substring(0, 4)}...[${displayValue.length} chars]...${displayValue.slice(-4)}`
          : `[${displayValue.length} chars]`;
        console.log(`${key.trim()}=${maskedValue} ✅`);
      } else {
        console.log(`${key.trim()}= ❌ (NOT SET)`);
      }
    });
  } else {
    console.log(`\n❌ Missing: ${file}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 Environment Summary:\n');

// Check current environment
console.log(`Current NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`Current NEXT_PUBLIC_ENVIRONMENT: ${process.env.NEXT_PUBLIC_ENVIRONMENT || 'not set'}`);

// Check for production readiness
console.log('\n🚀 Production Readiness Check:\n');

const requiredProductionVars = [
  'NEXT_PUBLIC_ENVIRONMENT',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'ESCROWHAVEN_FACTORY_ADDRESS_MAINNET',
  'NEXT_PUBLIC_TRANSAK_API_KEY',
  'ALCHEMY_API_KEY'
];

let missingVars = [];

// Check .env.production or .env.production.local
const prodEnvFile = fs.existsSync('.env.production') ? '.env.production' : 
                    fs.existsSync('.env.production.local') ? '.env.production.local' : null;

if (prodEnvFile) {
  const content = fs.readFileSync(prodEnvFile, 'utf8');
  
  requiredProductionVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = content.match(regex);
    if (!match || !match[1].trim()) {
      missingVars.push(varName);
      console.log(`❌ ${varName} - Missing or empty`);
    } else {
      console.log(`✅ ${varName} - Set`);
    }
  });
} else {
  console.log('❌ No production environment file found!');
  console.log('   Need either .env.production or .env.production.local');
}

if (missingVars.length > 0) {
  console.log('\n⚠️  Missing Production Variables:');
  missingVars.forEach(v => console.log(`   - ${v}`));
}

console.log('\n' + '='.repeat(60));
console.log('\n📝 Next Steps:');
console.log('1. Copy .env.local to .env.production');
console.log('2. Update NEXT_PUBLIC_ENVIRONMENT=production');
console.log('3. Ensure all production API keys are set');
console.log('4. Verify contract addresses are mainnet addresses');
console.log('5. Update NEXT_PUBLIC_APP_URL to https://escrowhaven.io');
console.log('\n');
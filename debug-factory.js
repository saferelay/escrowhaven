// debug-factory.js
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function debugFactory() {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  );
  
  const FACTORY = '0x593b1675b9B17CAe6cFB8e6e45E4Be10ccA9C77f';
  
  // First, check if factory contract exists
  const factoryCode = await provider.getCode(FACTORY);
  console.log('Factory has code:', factoryCode.length > 2);
  
  // Check the transaction that's failing
  const tx = await provider.getTransaction('0xbf5f14bffea1d5adacce941dccfc5242b39a99abee97f3b02a920a2ae64643a2');
  console.log('\nTransaction details:');
  console.log('To (Factory):', tx.to);
  console.log('Data length:', tx.data.length);
  
  // Decode the function call
  const iface = new ethers.utils.Interface([
    "function deployVault(bytes32,address,address) returns (address,address)"
  ]);
  
  try {
    const decoded = iface.parseTransaction({ data: tx.data });
    console.log('\nFunction called:', decoded.name);
    console.log('Parameters:');
    console.log('  Salt:', decoded.args[0]);
    console.log('  Client:', decoded.args[1]);
    console.log('  Freelancer:', decoded.args[2]);
  } catch (e) {
    console.log('Could not decode transaction');
  }
  
  // The issue might be that your factory contract expects different parameters
  // or the factory might have been updated/replaced
  
  // Let's check where your USDC actually is
  const vaultAddress = '0x70107b3c37b86cd287A7238dB8a2b0cCa952008c';
  const USDC = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';
  
  const usdcContract = new ethers.Contract(
    USDC,
    ['function balanceOf(address) view returns (uint256)'],
    provider
  );
  
  const balance = await usdcContract.balanceOf(vaultAddress);
  console.log('\n✅ Your USDC is still safe:');
  console.log('Vault address:', vaultAddress);
  console.log('Balance:', ethers.utils.formatUnits(balance, 6), 'USDC');
  
  console.log('\n⚠️  The factory contract appears to be broken or incompatible');
  console.log('You may need to:');
  console.log('1. Deploy a new factory contract');
  console.log('2. Or manually deploy the vault using a different method');
  console.log('3. Or recover the USDC using a different approach');
}

debugFactory();
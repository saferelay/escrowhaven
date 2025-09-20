const hre = require("hardhat");
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBatch() {
  // Get unverified mainnet contracts
  const { data: contracts } = await supabase
    .from('escrows')
    .select('*')
    .eq('factory_address', '0xb6Ac0936f512e1c79C8514A417d127D034Cb2045')
    .eq('contract_verified', false)
    .not('vault_address', 'is', null)
    .limit(5);

  if (!contracts || contracts.length === 0) {
    console.log('All contracts verified!');
    return;
  }

  for (const contract of contracts) {
    console.log(`\nVerifying ${contract.vault_address}...`);
    
    try {
      // Verify vault
      await hre.run("verify:verify", {
        address: contract.vault_address,
        constructorArguments: [
          "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
          contract.client_wallet_address,
          contract.freelancer_wallet_address,
          contract.splitter_address,
          "0x0000000000000000000000000000000000000000"
        ]
      });
      
      // Mark as verified
      await supabase
        .from('escrows')
        .update({ 
          contract_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', contract.id);
        
      console.log('✅ Verified');
      
    } catch (error) {
      if (error.message?.includes('Already Verified')) {
        await supabase
          .from('escrows')
          .update({ contract_verified: true })
          .eq('id', contract.id);
        console.log('Already verified');
      }
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 5000));
  }
}

verifyBatch();
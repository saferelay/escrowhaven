const hre = require("hardhat");
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config({ path: '../.env.local' });

async function verifyUnverifiedContracts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get unverified contracts
  const { data: contracts } = await supabase
    .from('escrows')
    .select('*')
    .eq('contract_verified', false)
    .not('vault_address', 'is', null)
    .eq('factory_address', '0xb6Ac0936f512e1c79C8514A417d127D034Cb2045')
    .limit(10); // Process 10 at a time

  if (!contracts || contracts.length === 0) {
    console.log('No unverified contracts found');
    return;
  }

  console.log(`Verifying ${contracts.length} contracts...`);

  for (const contract of contracts) {
    try {
      console.log(`\nVerifying ${contract.vault_address}...`);
      
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
      
      await supabase
        .from('escrows')
        .update({ 
          contract_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', contract.id);
        
      console.log('✅ Verified successfully');
      
    } catch (error) {
      if (error.message?.includes('Already Verified')) {
        await supabase
          .from('escrows')
          .update({ 
            contract_verified: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', contract.id);
        console.log('✓ Already verified, updated database');
      } else {
        console.log('❌ Failed:', error.message);
      }
    }
    
    // Delay between verifications
    await new Promise(r => setTimeout(r, 5000));
  }
}

verifyUnverifiedContracts();
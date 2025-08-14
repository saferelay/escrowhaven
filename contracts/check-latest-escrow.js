const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkLatestEscrow() {
    // Connect to Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Get the latest escrow
    const { data: escrow, error } = await supabase
        .from('escrows')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error) {
        console.error('Error fetching escrow:', error);
        return;
    }
    
    console.log('\n=== Latest Escrow ===');
    console.log('ID:', escrow.id);
    console.log('Vault Address:', escrow.vault_address);
    console.log('Status:', escrow.status);
    console.log('Contract Version:', escrow.contract_version);
    console.log('Amount:', escrow.amount_cents / 100, 'USD');
    console.log('Created:', new Date(escrow.created_at).toLocaleString());
    
    if (escrow.vault_address) {
        // Check if it's EIP-712
        const provider = new ethers.providers.JsonRpcProvider('https://polygon-amoy.g.alchemy.com/v2/FWlMqBQAg9Muo0SRaeVr5hqVkWLgLkHN');
        const testABI = ["function getDomainSeparator() view returns (bytes32)"];
        const contract = new ethers.Contract(escrow.vault_address, testABI, provider);
        
        try {
            const domainSeparator = await contract.getDomainSeparator();
            console.log('\n✅ This IS an EIP-712 contract!');
            console.log('Domain Separator:', domainSeparator);
            console.log('\n🎉 Ready to test human-readable signing!');
        } catch (error) {
            console.log('\n❌ This is NOT an EIP-712 contract');
        }
    }
}

checkLatestEscrow().catch(console.error);

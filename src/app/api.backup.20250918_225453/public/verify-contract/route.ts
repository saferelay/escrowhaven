// src/app/api/public/verify-contract/route.ts - Privacy-conscious version

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ isValid: false, message: 'No address provided' });
    }
    
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Normalize the address
    const normalizedAddress = address.toLowerCase();
    
    // Check if this address exists - but DON'T return email addresses
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('id, status, amount_cents, created_at, contract_version, network, is_test_mode')
      .or(`vault_address.eq.${address},vault_address.eq.${normalizedAddress}`)
      .single();
    
    if (!error && escrow) {
      // Found the escrow - return WITHOUT sensitive data
      const network = escrow.is_test_mode ? 'Testnet' : (escrow.network || 'Polygon');
      return NextResponse.json({
        isValid: true,
        type: `Escrow Vault (${escrow.contract_version || 'v2.1'})`,
        status: escrow.status,
        message: `Valid SafeRelay escrow contract on ${network}`,
        details: {
          created: new Date(escrow.created_at).toLocaleDateString(),
          status: escrow.status,
          amount: `$${(escrow.amount_cents / 100).toFixed(2)}`,
          network: network,
          escrowId: escrow.id.slice(0, 8) + '...' // Only show partial ID
        }
      });
    }
    
    // Not found
    return NextResponse.json({ 
      isValid: false, 
      message: 'This address is not found in our database. If this is a recently deployed contract, it may take a few moments to appear.' 
    });
    
  } catch (error) {
    console.error('Contract verification error:', error);
    return NextResponse.json({ 
      isValid: false, 
      message: 'Verification service temporarily unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
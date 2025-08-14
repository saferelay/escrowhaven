import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json();

    // Get escrow details
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Get the base URL from environment
    const baseUrl = process.env.STRIPE_ONRAMP_LINK!;
    
    // Build the complete URL with additional parameters
    // Note: URL already has parameters, so we use & to add more
    const completeUrl = `${baseUrl}&destination_address=${escrow.vault_address}&source_amount=${(escrow.amount_cents / 100).toFixed(2)}`;

    console.log('Generated onramp URL:', completeUrl);

    return NextResponse.json({
      success: true,
      onramp_url: completeUrl,
      debug_url: completeUrl, // For debugging
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

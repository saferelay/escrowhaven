import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// SafeRelay Escrow ABI
const ESCROW_ABI = [
  "function recordApproval(address userIdentifier) external",
  "function getStatus() view returns (bool funded, bool clientOk, bool freelancerOk, bool released)"
];

// Create provider outside of the request handler to avoid Next.js fetch issues
let provider: ethers.providers.JsonRpcProvider | null = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider({
      url: 'https://polygon-amoy.drpc.org',
      skipFetchSetup: true // Skip fetch setup to avoid Next.js issues
    }, {
      chainId: 80002,
      name: 'polygon-amoy'
    });
  }
  return provider;
}

export async function POST(request: NextRequest) {
  try {
    const { escrowId, verificationCode, userEmail } = await request.json();

    console.log('SafeRelay approval request:', { escrowId, userEmail });

    // Get escrow from database
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (fetchError || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }

    // Verify user is authorized
    const isClient = userEmail === escrow.client_email;
    const isFreelancer = userEmail === escrow.freelancer_email;

    if (!isClient && !isFreelancer) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get working provider
    const provider = getProvider();
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const escrowContract = new ethers.Contract(escrow.vault_address, ESCROW_ABI, signer);

    // Calculate user identifier (deterministic from email)
    const prefix = isClient ? 'client:' : 'freelancer:';
    const userIdentifier = ethers.utils.getAddress(
      '0x' + ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(prefix + userEmail)
      ).slice(26)
    );

    console.log('Recording approval for:', userIdentifier);
    console.log('Is client:', isClient);
    console.log('Escrow address:', escrow.vault_address);

    // Record approval on blockchain
    try {
      const tx = await escrowContract.recordApproval(userIdentifier, {
        gasLimit: 500000,
        gasPrice: ethers.utils.parseUnits('30', 'gwei')
      });
      console.log('Approval transaction:', tx.hash);
      
      await tx.wait();
      console.log('Approval confirmed!');
    } catch (blockchainError: any) {
      console.error('Blockchain error:', blockchainError);
      return NextResponse.json(
        { error: 'Failed to record approval on blockchain', details: blockchainError.message },
        { status: 500 }
      );
    }

    // Update database
    const updateData = isClient 
      ? { client_approved: true }
      : { freelancer_approved: true };

    await supabase
      .from('escrows')
      .update(updateData)
      .eq('id', escrowId);

    // Check if both approved (blockchain will auto-release)
    const status = await escrowContract.getStatus();
    
    console.log('Contract status after approval:', status);
    
    if (status.released) {
      console.log('🎉 Auto-release triggered!');
      
      // Update database to reflect release
      await supabase
        .from('escrows')
        .update({
          status: 'RELEASED',
          released_at: new Date().toISOString(),
          auto_released_at: new Date().toISOString()
        })
        .eq('id', escrowId);

      // Try to trigger splitter
      const SPLITTER_ABI = ["function split() external"];
      const splitter = new ethers.Contract(escrow.splitter_address, SPLITTER_ABI, signer);
      
      try {
        const splitTx = await splitter.split({
          gasLimit: 500000,
          gasPrice: ethers.utils.parseUnits('30', 'gwei')
        });
        console.log('Payment split triggered:', splitTx.hash);
        await splitTx.wait();
      } catch (e) {
        console.log('Split may have already happened or no funds yet');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Approval recorded successfully',
      released: status.released,
      approvalStatus: {
        client: status.clientOk,
        freelancer: status.freelancerOk
      }
    });

  } catch (error: any) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Approval failed', details: error.message },
      { status: 500 }
    );
  }
}

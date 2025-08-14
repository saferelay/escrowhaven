import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// SimpleEscrow ABI - only what we need
const ESCROW_ABI = [
  "function approve() external",
  "function getStatus() view returns (bool funded, bool clientOk, bool freelancerOk, bool released)",
  "function client() view returns (address)",
  "function freelancer() view returns (address)"
];

// PaymentSplitter ABI
const SPLITTER_ABI = [
  "function split() external",
  "function freelancer() view returns (address)",
  "function platform() view returns (address)"
];

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { escrowId, verificationCode, userEmail, isDebugApproval } = await request.json();
    
    console.log('Approval request:', { escrowId, userEmail, isDebugApproval });

    // Get escrow from database
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (fetchError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found' },
        { status: 404 }
      );
    }

    // Determine user role
    const isClient = userEmail === escrow.client_email;
    const isFreelancer = userEmail === escrow.freelancer_email;
    
    if (!isClient && !isFreelancer && !isDebugApproval) {
      return NextResponse.json(
        { error: 'Not authorized for this escrow' },
        { status: 403 }
      );
    }

    // Verify code (skip for debug)
    if (!isDebugApproval) {
      const { data: validCode } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('escrow_id', escrowId)
        .eq('email', userEmail)
        .eq('code', verificationCode)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!validCode) {
        return NextResponse.json(
          { error: 'Invalid or expired verification code' },
          { status: 400 }
        );
      }

      // Mark code as used
      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', validCode.id);
    }

    // Update approval in database
    const updateData = isClient || (isDebugApproval && !isFreelancer)
      ? { client_approved: true }
      : { freelancer_approved: true };

    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrows')
      .update(updateData)
      .eq('id', escrowId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      );
    }

    // Check if both approved
    const bothApproved = updatedEscrow.client_approved && updatedEscrow.freelancer_approved;

    if (bothApproved && updatedEscrow.status === 'FUNDED' && updatedEscrow.contract_type === 'transparent') {
      console.log('Both parties approved, triggering auto-release...');
      
      try {
        // Initialize provider
        const provider = new ethers.providers.JsonRpcProvider(
          `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        );
        
        // For transparent contracts, we need to call approve() from both parties
        // Since we don't have their private keys, we'll use our signer to trigger the release
        // In production, this would be done via meta-transactions or user signatures
        
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        
        // First, check if contract is already released
        const escrowContract = new ethers.Contract(
          updatedEscrow.vault_address,
          ESCROW_ABI,
          provider
        );
        
        const status = await escrowContract.getStatus();
        console.log('Contract status:', status);
        
        if (!status.released && status.funded) {
          // For now, we'll trigger the payment splitter directly since we can't call approve()
          // without the users' private keys. In production, use meta-transactions.
          
          if (updatedEscrow.splitter_address) {
            console.log('Triggering payment split...');
            
            const splitterContract = new ethers.Contract(
              updatedEscrow.splitter_address,
              SPLITTER_ABI,
              signer
            );
            
            // Check if escrow has released funds to splitter
            // If so, trigger the split
            const tx = await splitterContract.split();
            console.log('Split transaction:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Split confirmed');
            
            // Update database
            await supabase
              .from('escrows')
              .update({
                status: 'RELEASED',
                auto_released_at: new Date().toISOString(),
                release_tx_hash: tx.hash
              })
              .eq('id', escrowId);
          }
        } else if (status.released) {
          // Already released
          await supabase
            .from('escrows')
            .update({
              status: 'RELEASED',
              auto_released_at: new Date().toISOString()
            })
            .eq('id', escrowId);
        }
        
      } catch (releaseError) {
        console.error('Auto-release error:', releaseError);
        // Don't fail the approval, just log the error
        // Manual release can be triggered later
      }
    } else if (bothApproved && updatedEscrow.contract_type !== 'transparent') {
      console.log('Legacy contract - manual release required');
    }

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      bothApproved,
      message: bothApproved 
        ? 'Both parties have approved. Funds will be released automatically.'
        : 'Your approval has been recorded.'
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

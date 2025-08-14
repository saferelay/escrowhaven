// src/app/api/escrow/release-v2-1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/blockchain-provider-fixed';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Correct ABI matching the actual SafeRelayEscrowV2_1 contract
const ESCROW_V2_1_ABI = [
  // State variables
  "function usdc() view returns (address)",
  "function client() view returns (address)",
  "function freelancer() view returns (address)",
  "function safeRelayFeeRecipient() view returns (address)",
  "function totalAmount() view returns (uint256)",
  "function released() view returns (bool)",
  "function refunded() view returns (bool)",
  
  // Main functions
  "function releaseWithSignature(uint256 nonce, uint256 deadline, bytes calldata signature) external",
  "function refundWithSignature(uint256 nonce, uint256 deadline, bytes calldata signature) external",
  "function settlementRelease(uint256 freelancerAmount, uint256 nonce, uint256 deadline, bytes calldata signature) external",
  
  // View functions
  "function getStatus() external view returns (bool funded, bool isReleased, bool isRefunded)",
  "function getDomainSeparator() external view returns (bytes32)"
];

// EIP-712 Type Hashes (must match contract exactly)
const RELEASE_TYPEHASH = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("ReleasePayment(string action,address recipient,uint256 amount,uint256 nonce,uint256 deadline)")
);

const REFUND_TYPEHASH = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("RefundPayment(string action,address recipient,uint256 amount,uint256 nonce,uint256 deadline)")
);

const SETTLEMENT_TYPEHASH = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("SettlementRelease(string action,address recipient,uint256 amount,uint256 totalAmount,uint256 nonce,uint256 deadline)")
);

export async function POST(request: NextRequest) {
  try {
    const { 
      escrowId, 
      action, 
      userEmail, 
      signature, 
      nonce, 
      deadline,
      eip712,
      signerAddress,
      settlementAmount
    } = await request.json();
    
    console.log('=== RELEASE V2.1 WITH SIGNATURE ===');
    console.log('Action:', action);
    console.log('User:', userEmail);
    console.log('Nonce:', nonce);
    console.log('Deadline:', deadline);
    
    // Validate inputs
    if (!escrowId || !action || !userEmail || !signature || !nonce || !deadline) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Get escrow details
    const { data: escrow, error } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
      
    if (error || !escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
    }
    
    if (!escrow.vault_address) {
      return NextResponse.json({ error: 'No vault deployed for this escrow' }, { status: 400 });
    }
    
    // Verify user is authorized
    const isClient = userEmail.toLowerCase() === escrow.client_email.toLowerCase();
    const isFreelancer = userEmail.toLowerCase() === escrow.freelancer_email.toLowerCase();
    
    if (!isClient && !isFreelancer) {
      return NextResponse.json({ 
        error: 'User not authorized for this escrow' 
      }, { status: 403 });
    }
    
    // Verify action matches user role
    if (action === 'release' && !isClient) {
      return NextResponse.json({ 
        error: 'Only client can release payment' 
      }, { status: 403 });
    }
    
    if (action === 'refund' && !isFreelancer) {
      return NextResponse.json({ 
        error: 'Only freelancer can refund payment' 
      }, { status: 403 });
    }
    
    if (action === 'settlement' && !isClient) {
      return NextResponse.json({ 
        error: 'Only client can execute settlement' 
      }, { status: 403 });
    }
    
    // Get signer for backend transaction execution
    const signer = await getSigner();
    const provider = signer.provider;
    
    if (!provider) {
      throw new Error('No provider available');
    }
    
    // Create contract instance
    const contract = new ethers.Contract(escrow.vault_address, ESCROW_V2_1_ABI, signer);
    
    // Get contract state
    const [
      contractClient,
      contractFreelancer,
      contractTotalAmount,
      status,
      domainSeparator
    ] = await Promise.all([
      contract.client(),
      contract.freelancer(),
      contract.totalAmount(),
      contract.getStatus(),
      contract.getDomainSeparator()
    ]);
    
    console.log('Contract state:');
    console.log('- Client:', contractClient);
    console.log('- Freelancer:', contractFreelancer);
    console.log('- Total amount:', ethers.utils.formatUnits(contractTotalAmount, 6), 'USDC');
    console.log('- Status:', status);
    console.log('- Domain separator:', domainSeparator);
    
    // Verify contract status
    if (status.isReleased) {
      return NextResponse.json({ error: 'Escrow already released' }, { status: 400 });
    }
    
    if (status.isRefunded) {
      return NextResponse.json({ error: 'Escrow already refunded' }, { status: 400 });
    }
    
    if (!status.funded) {
      return NextResponse.json({ error: 'Escrow not yet funded' }, { status: 400 });
    }
    
    // Verify the signature matches what the contract expects
    try {
      console.log('Verifying signature...');
      
      let expectedSigner: string;
      let structHash: string;
      
      if (action === 'release') {
        // For release, client signs to send funds to freelancer
        expectedSigner = contractClient;
        structHash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'address', 'uint256', 'uint256', 'uint256'],
            [
              RELEASE_TYPEHASH,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Release Full Payment")),
              contractFreelancer,
              contractTotalAmount,
              nonce,
              deadline
            ]
          )
        );
      } else if (action === 'refund') {
        // For refund, freelancer signs to send funds back to client
        expectedSigner = contractFreelancer;
        structHash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'address', 'uint256', 'uint256', 'uint256'],
            [
              REFUND_TYPEHASH,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Refund Full Payment")),
              contractClient,
              contractTotalAmount,
              nonce,
              deadline
            ]
          )
        );
      } else if (action === 'settlement') {
        // For settlement, client signs to split funds
        if (!settlementAmount) {
          return NextResponse.json({ error: 'Settlement amount required' }, { status: 400 });
        }
        
        expectedSigner = contractClient;
        const freelancerAmountWei = ethers.utils.parseUnits(settlementAmount, 6);
        
        structHash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ['bytes32', 'bytes32', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
            [
              SETTLEMENT_TYPEHASH,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Settlement Release")),
              contractFreelancer,
              freelancerAmountWei,
              contractTotalAmount,
              nonce,
              deadline
            ]
          )
        );
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
      
      // Create the EIP-712 digest
      const digest = ethers.utils.keccak256(
        ethers.utils.concat([
          '0x1901',
          domainSeparator,
          structHash
        ])
      );
      
      // Recover signer from signature
      const recoveredAddress = ethers.utils.recoverAddress(digest, signature);
      console.log('Recovered signer:', recoveredAddress);
      console.log('Expected signer:', expectedSigner);
      
      // Verify the signature is from the correct party
      if (recoveredAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
        // Also check if it matches the wallet address from DB (for compatibility)
        const dbWallet = isClient ? escrow.client_wallet_address : escrow.freelancer_wallet_address;
        if (!dbWallet || recoveredAddress.toLowerCase() !== dbWallet.toLowerCase()) {
          return NextResponse.json({ 
            error: 'Invalid signature',
            details: `Expected signature from ${expectedSigner}, got ${recoveredAddress}`
          }, { status: 400 });
        }
      }
      
      console.log('✅ Signature verified successfully');
      
    } catch (verifyError: any) {
      console.error('Signature verification error:', verifyError);
      return NextResponse.json({ 
        error: 'Failed to verify signature',
        details: verifyError.message
      }, { status: 400 });
    }
    
    // Execute the transaction
    try {
      // Get current gas price and add buffer
      const gasPrice = await provider.getGasPrice();
      const gasPriceWithBuffer = gasPrice.mul(150).div(100); // 1.5x buffer
      
      console.log('Gas settings:');
      console.log('- Network gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');
      console.log('- Using gas price:', ethers.utils.formatUnits(gasPriceWithBuffer, 'gwei'), 'gwei');
      
      let tx;
      
      if (action === 'release') {
        console.log('Executing release...');
        tx = await contract.releaseWithSignature(
          nonce,
          deadline,
          signature,
          {
            gasPrice: gasPriceWithBuffer,
            gasLimit: 300000
          }
        );
      } else if (action === 'refund') {
        console.log('Executing refund...');
        tx = await contract.refundWithSignature(
          nonce,
          deadline,
          signature,
          {
            gasPrice: gasPriceWithBuffer,
            gasLimit: 300000
          }
        );
      } else if (action === 'settlement') {
        console.log('Executing settlement...');
        const freelancerAmountWei = ethers.utils.parseUnits(settlementAmount, 6);
        tx = await contract.settlementRelease(
          freelancerAmountWei,
          nonce,
          deadline,
          signature,
          {
            gasPrice: gasPriceWithBuffer,
            gasLimit: 350000
          }
        );
      }
      
      console.log('Transaction sent:', tx.hash);
      console.log('Waiting for confirmation...');
      
      // Wait for confirmation with timeout
      const receipt = await Promise.race([
        tx.wait(1),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
        )
      ]);
      
      console.log('Transaction confirmed!');
      console.log('- Block:', receipt.blockNumber);
      console.log('- Gas used:', receipt.gasUsed.toString());
      console.log('- Status:', receipt.status === 1 ? 'Success' : 'Failed');
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on-chain');
      }
      
      // Update database
      const updateData: any = {
        last_action_by: userEmail,
        last_action_at: new Date().toISOString()
      };
      
      // Check final contract state
      const finalStatus = await contract.getStatus();
      
      if (finalStatus.isReleased) {
        updateData.status = 'RELEASED';
        updateData.released_at = new Date().toISOString();
        updateData.release_tx_hash = tx.hash;
        updateData.completed_at = new Date().toISOString();
      } else if (finalStatus.isRefunded) {
        updateData.status = 'REFUNDED';
        updateData.refund_tx_hash = tx.hash;
        updateData.completed_at = new Date().toISOString();
      }
      
      await supabase
        .from('escrows')
        .update(updateData)
        .eq('id', escrowId);
      
      return NextResponse.json({
        success: true,
        message: action === 'release' ? '✅ Payment released successfully!' : 
                  action === 'refund' ? '✅ Payment refunded successfully!' :
                  '✅ Settlement executed successfully!',
        status: finalStatus.isReleased ? 'RELEASED' : finalStatus.isRefunded ? 'REFUNDED' : 'FUNDED',
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`
      });
      
    } catch (contractError: any) {
      console.error('Contract execution error:', contractError);
      
      let errorMessage = 'Transaction failed';
      let errorDetails = contractError.message;
      
      // Parse specific error messages
      if (contractError.message.includes('Already processed')) {
        errorMessage = 'Already processed';
        errorDetails = 'This escrow has already been released or refunded.';
      } else if (contractError.message.includes('Expired')) {
        errorMessage = 'Signature expired';
        errorDetails = 'The signature deadline has passed. Please try again.';
      } else if (contractError.message.includes('Invalid signature')) {
        errorMessage = 'Invalid signature';
        errorDetails = 'The signature verification failed.';
      } else if (contractError.message.includes('Insufficient balance')) {
        errorMessage = 'Insufficient balance';
        errorDetails = 'The escrow does not have enough funds.';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails,
        rawError: process.env.NODE_ENV === 'development' ? contractError.message : undefined
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('Release V2.1 error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
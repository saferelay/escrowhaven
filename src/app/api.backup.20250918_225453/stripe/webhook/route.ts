// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil', // Use the correct API version
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Contract ABI for deployVault function
const FACTORY_ABI = [
  "function deployVault(bytes32 salt, address client, address freelancer, uint256 expectedAmount) returns (address escrow, address splitter)"
];

async function deployVaultOnChain(metadata: any) {
  try {
    const isTestMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
    
    // Setup provider
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: isTestMode 
          ? 'https://rpc-amoy.polygon.technology' 
          : process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        skipFetchSetup: true
      },
      isTestMode ? 80002 : 137
    );
    
    // Use deployment wallet
    const deploymentKey = isTestMode 
      ? process.env.PRIVATE_KEY! 
      : process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET!;
    
    const signer = new ethers.Wallet(deploymentKey, provider);
    
    // Factory contract
    const factoryAddress = isTestMode 
      ? process.env.ESCROWHAVEN_FACTORY_ADDRESS!
      : process.env.ESCROWHAVEN_FACTORY_ADDRESS_MAINNET!;
    
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
    
    // Deploy the vault
    const amountUsdc = ethers.utils.parseUnits(metadata.amountUsdc, 6);
    
    console.log('Deploying vault with params:', {
      salt: metadata.salt,
      client: metadata.clientAddress,
      freelancer: metadata.freelancerAddress,
      amount: ethers.utils.formatUnits(amountUsdc, 6)
    });
    
    const tx = await factory.deployVault(
      metadata.salt,
      metadata.clientAddress,
      metadata.freelancerAddress,
      amountUsdc,
      {
        gasLimit: 3000000,
        maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei')
      }
    );
    
    console.log('Deployment transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait(2);
    
    // Parse events to get vault address
    const event = receipt.events?.find((e: any) => e.event === 'VaultCreated');
    const vaultAddress = event?.args?.vault;
    const splitterAddress = event?.args?.splitter;
    
    console.log('Vault deployed:', vaultAddress);
    console.log('Splitter deployed:', splitterAddress);
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      vaultAddress,
      splitterAddress
    };
  } catch (error: any) {
    console.error('Failed to deploy vault on-chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers(); // Add await here
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log('Received Stripe webhook:', event.type);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Checkout completed for escrow:', session.client_reference_id);
      
      try {
        // Get the payment intent to access metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        
        const metadata = paymentIntent.metadata;
        const escrowId = metadata.escrowId;
        
        // Update payment session status
        await supabase
          .from('payment_sessions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('session_id', session.id);
        
        // Deploy the vault on-chain
        const deploymentResult = await deployVaultOnChain(metadata);
        
        if (deploymentResult.success) {
          // Update escrow with deployment info
          await supabase
            .from('escrows')
            .update({
              status: 'FUNDED',
              funded_at: new Date().toISOString(),
              funding_tx_hash: deploymentResult.transactionHash,
              deployment_tx: deploymentResult.transactionHash,
              vault_address: deploymentResult.vaultAddress,
              splitter_address: deploymentResult.splitterAddress,
              funding_provider: 'stripe',
              funding_session_id: session.id
            })
            .eq('id', escrowId);
          
          console.log('Escrow funded successfully:', escrowId);
        } else {
          // Mark as payment received but deployment failed
          await supabase
            .from('escrows')
            .update({
              status: 'PAYMENT_RECEIVED',
              payment_received_at: new Date().toISOString(),
              funding_provider: 'stripe',
              funding_session_id: session.id,
              deployment_error: deploymentResult.error
            })
            .eq('id', escrowId);
          
          console.error('Deployment failed but payment received:', deploymentResult.error);
          
          // You might want to implement a retry mechanism here
        }
      } catch (error: any) {
        console.error('Failed to process payment completion:', error);
        
        // Log the error but don't fail the webhook
        await supabase
          .from('webhook_errors')
          .insert({
            provider: 'stripe',
            event_type: event.type,
            session_id: session.id,
            error: error.message,
            metadata: session,
            created_at: new Date().toISOString()
          });
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update payment session status
      await supabase
        .from('payment_sessions')
        .update({ 
          status: 'expired',
          failed_at: new Date().toISOString()
        })
        .eq('session_id', session.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Log the failure
      console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error);
      
      // You might want to notify the user
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
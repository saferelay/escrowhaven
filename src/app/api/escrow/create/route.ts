// src/app/api/escrow/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';
import { ethers } from 'ethers';
import { getConfig } from '@/lib/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Contract ABIs
const SAFERELAY_FACTORY_ABI = [
  "function createEscrow(string memory payerEmail, string memory recipientEmail, address recipientWallet, uint256 amount) returns (address escrow, address splitter)",
  "event EscrowCreated(address indexed escrow, address indexed splitter, string payerEmail, string recipientEmail, uint256 amount)"
];

const FACTORY_V2_ABI = [
  "function createEscrowForUser(address client, address freelancer, uint256 amount, bytes32 salt) returns (address)",
  "function getEscrowAddress(bytes32 salt) view returns (address)"
];

// V2.1 Factory ABI (for EIP-712 contracts)
const FACTORY_V2_1_ABI = [
  "function createEscrow(address client, address freelancer, uint256 amount) returns (address)",
  "event EscrowCreated(address indexed escrow, address indexed client, address indexed freelancer, uint256 amount, uint256 createdAt)"
];

// Provider management
let provider: ethers.providers.JsonRpcProvider | null = null;

function getProvider() {
  if (!provider) {
    const config = getConfig();
    provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  }
  return provider;
}

// Generate premium link format
function generatePremiumLink(escrowId: string): string {
  // Use last 5 characters of escrow ID for uniqueness
  const uniqueId = escrowId.replace(/-/g, '').slice(-5).toUpperCase();
  return `secure-payment-${uniqueId}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Core fields
      amountUsd,
      payerEmail,
      recipientEmail,
      initiatorRole,
      initiatorWallet,
      description,
      
      // Optional fields for different flows
      recipientWallet,
      deployContract = false,  // Whether to deploy smart contract immediately
      contractType = 'v2.1',   // Default to v2.1 for EIP-712
      testMode = false
    } = body;
    
    // Validation
    if (!amountUsd || !payerEmail || !recipientEmail || !initiatorRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (amountUsd <= 0 || amountUsd > 50000) {
      return NextResponse.json(
        { error: 'Amount must be between $0.01 and $50,000' },
        { status: 400 }
      );
    }
    
    if (payerEmail === recipientEmail) {
      return NextResponse.json(
        { error: 'Payer and recipient cannot be the same' },
        { status: 400 }
      );
    }
    
    const config = getConfig();
    console.log('Creating escrow - Mode:', config.isTestMode ? 'TEST' : 'PRODUCTION');
    console.log('Deploy contract:', deployContract, 'Type:', contractType);
    
    // Create pending escrow record
    const escrowData: any = {
      amount_cents: Math.round(amountUsd * 100),
      client_email: payerEmail,
      freelancer_email: recipientEmail,
      initiator_email: initiatorRole === 'payer' ? payerEmail : recipientEmail,
      initiator_role: initiatorRole,
      contract_version: 'v2.1',  // Use v2.1 for new escrows
      contract_type: 'legacy',    // Will be updated if we deploy contract
      status: 'INITIATED',
      description,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_test_mode: config.isTestMode || testMode,
    };
    
    // Set wallet addresses based on what we know
    if (initiatorWallet) {
      escrowData.initiator_wallet_address = initiatorWallet;
      if (initiatorRole === 'payer') {
        escrowData.client_wallet_address = initiatorWallet;
      } else {
        escrowData.freelancer_wallet_address = initiatorWallet;
      }
    }
    
    if (recipientWallet && initiatorRole === 'payer') {
      escrowData.freelancer_wallet_address = recipientWallet;
    }
    
    // Save to database
    const { data: escrow, error: dbError } = await supabase
      .from('escrows')
      .insert(escrowData)
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create escrow' },
        { status: 500 }
      );
    }
    
    // Generate and save premium link
    const premiumLink = generatePremiumLink(escrow.id);
    
    // Update escrow with premium link
    const { error: updateError } = await supabase
      .from('escrows')
      .update({ premium_link: premiumLink })
      .eq('id', escrow.id);
    
    if (updateError) {
      console.error('Failed to save premium link:', updateError);
      // Don't fail the request, just log the error
    }
    
    // Deploy smart contract if requested and we have recipient wallet
    let contractData = null;
    if (deployContract && contractType !== 'none') {
      // Check if recipient has a wallet in database
      let finalRecipientWallet = recipientWallet;
      if (!finalRecipientWallet) {
        const { data: recipientWalletData } = await supabase
          .from('user_wallets')
          .select('wallet_address')
          .eq('email', recipientEmail.toLowerCase())
          .single();

        if (recipientWalletData?.wallet_address) {
          finalRecipientWallet = recipientWalletData.wallet_address;
          console.log('Found recipient wallet in database:', finalRecipientWallet);
        } else {
          console.log('Recipient wallet not found, skipping contract deployment');
        }
      }
      
      if (finalRecipientWallet) {
        try {
          const provider = getProvider();
          const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
          
          if (contractType === 'v2.1') {
            // Use V2.1 Factory for EIP-712 contracts
            const factoryAddress = process.env.SAFERELAY_FACTORY_V2_1_ADDRESS;
            if (!factoryAddress) {
              throw new Error('V2.1 factory not configured');
            }
            
            const factory = new ethers.Contract(factoryAddress, FACTORY_V2_1_ABI, signer);
            const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
            
            // Generate deterministic addresses for the escrow
            const clientAddress = ethers.utils.getAddress(
              '0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payerEmail)).slice(26)
            );
            const freelancerAddress = finalRecipientWallet;
            
            console.log('Deploying V2.1 EIP-712 escrow...');
            console.log('Factory:', factoryAddress);
            console.log('Client:', clientAddress);
            console.log('Freelancer:', freelancerAddress);
            console.log('Amount:', ethers.utils.formatUnits(amountUsdc, 6));
            
            const tx = await factory.createEscrow(
              clientAddress,
              freelancerAddress,
              amountUsdc
            );
            
            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed');
            
            // Get the escrow address from events
            const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
            if (event) {
              contractData = {
                vault_address: event.args.escrow,
                deployment_tx: tx.hash,
                network: config.network,
                contract_type: 'v2.1-eip712'
              };
              
              console.log('Escrow deployed at:', contractData.vault_address);
            }
          } else if (contractType === 'saferelay') {
            // Original SafeRelay Factory deployment
            const factoryAddress = config.contracts.factory;
            if (!factoryAddress) {
              throw new Error('SafeRelay factory not configured');
            }
            
            const factory = new ethers.Contract(factoryAddress, SAFERELAY_FACTORY_ABI, signer);
            const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
            
            console.log('Deploying SafeRelay escrow...');
            const tx = await factory.createEscrow(
              payerEmail,
              recipientEmail,
              finalRecipientWallet,
              amountUsdc
            );
            
            const receipt = await tx.wait();
            const event = receipt.events?.find((e: any) => e.event === 'EscrowCreated');
            
            if (event) {
              contractData = {
                vault_address: event.args.escrow,
                splitter_address: event.args.splitter,
                deployment_tx: tx.hash,
                network: config.network
              };
            }
          } else if (contractType === 'factoryV2') {
            // Factory V2 deployment
            const factoryAddress = config.contracts.factoryV2;
            if (!factoryAddress) {
              throw new Error('Factory V2 not configured');
            }
            
            const factory = new ethers.Contract(factoryAddress, FACTORY_V2_ABI, signer);
            const amountUsdc = ethers.utils.parseUnits(amountUsd.toString(), 6);
            
            // Generate deterministic addresses
            const clientAddress = ethers.utils.getAddress(
              '0x' + ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payerEmail)).slice(26)
            );
            const freelancerAddress = finalRecipientWallet;
            
            // Generate salt
            const salt = ethers.utils.keccak256(
              ethers.utils.defaultAbiCoder.encode(
                ['address', 'address', 'uint256', 'uint256'],
                [clientAddress, freelancerAddress, amountUsdc, Date.now()]
              )
            );
            
            console.log('Deploying Factory V2 escrow...');
            const tx = await factory.createEscrowForUser(
              clientAddress,
              freelancerAddress,
              amountUsdc,
              salt
            );
            
            const receipt = await tx.wait();
            const vaultAddress = await factory.getEscrowAddress(salt);
            
            contractData = {
              vault_address: vaultAddress,
              deployment_tx: tx.hash,
              network: config.network,
              contract_type: 'factoryV2'
            };
          }
          
          // Update escrow with contract data
          if (contractData) {
            await supabase
              .from('escrows')
              .update({
                vault_address: contractData.vault_address,
                deployment_tx: contractData.deployment_tx,
                network: contractData.network,
                contract_type: contractData.contract_type
              })
              .eq('id', escrow.id);
          }
        } catch (contractError) {
          console.error('Contract deployment error:', contractError);
          // Don't fail the whole request, just log the error
        }
      }
    }
    
    // Send invite email to the other party with premium link
    const otherPartyEmail = initiatorRole === 'payer' ? recipientEmail : payerEmail;
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${premiumLink}`;
    const fallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/escrow/${escrow.id}`;
    
    try {
      await sendEmail({
        to: otherPartyEmail,
        ...emailTemplates.escrowInvite({
          initiatorEmail: escrowData.initiator_email,
          initiatorRole,
          amountUsd,
          description,
          inviteUrl,  // Use premium link in email
          fallbackUrl // Include fallback just in case
        })
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      escrowId: escrow.id,
      premiumLink: premiumLink,
      status: 'INITIATED',
      contractData,
      redirectUrl: `/escrow/${escrow.id}`,
      shareableUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${premiumLink}`
    });
    
  } catch (error) {
    console.error('Create escrow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
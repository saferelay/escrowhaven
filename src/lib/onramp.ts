// src/lib/onramp.ts
import { ethers } from 'ethers';

export interface OnrampConfig {
  email: string;
  targetUsdcAmount: number;
  escrowId: string;
  factoryAddress: string;
  clientAddress: string;
  freelancerAddress: string;
  salt: string;
  isTestMode: boolean;
}

// Generate calldata for your EscrowHavenFactory
export function generateCalldata(
    salt: string,
    clientAddress: string,
    freelancerAddress: string,
    usdcAmount: number
  ): string {
    const factoryInterface = new ethers.utils.Interface([
      "function deployVault(bytes32,address,address,uint256) returns (address,address)"  
    ]);
    
    return factoryInterface.encodeFunctionData('deployVault', [
      salt,
      clientAddress,
      freelancerAddress,
      ethers.utils.parseUnits(usdcAmount.toFixed(6), 6)
    ]);
  }

// Generate deterministic salt
export function generateSalt(escrowId: string, timestamp?: number): string {
  const fixedTimestamp = timestamp || Date.now();
  return ethers.utils.id(`${escrowId}-${fixedTimestamp}`);
}

// Store salt in database to ensure consistency
export async function getOrCreateSalt(
  escrowId: string,
  supabase: any
): Promise<{ salt: string; isNew: boolean }> {
  // Check if salt already exists
  const { data: escrow } = await supabase
    .from('escrows')
    .select('deployment_salt')
    .eq('id', escrowId)
    .single();
  
  if (escrow?.deployment_salt) {
    return { salt: escrow.deployment_salt, isNew: false };
  }
  
  // Generate and store new salt
  const newSalt = generateSalt(escrowId);
  
  await supabase
    .from('escrows')
    .update({ deployment_salt: newSalt })
    .eq('id', escrowId);
  
  return { salt: newSalt, isNew: true };
}

// Create Onramp widget URL// 
export function createOnrampWidget(config: OnrampConfig): string {
    const baseUrl = 'https://onramp.money/app/';
    const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || '1687307';
    
    const calldata = generateCalldata(
      config.salt,
      config.clientAddress,
      config.freelancerAddress,
      config.targetUsdcAmount
    );
    
    const params = new URLSearchParams({
      appId: appId,
      walletAddress: config.factoryAddress,
      coinCode: 'USDC',
      
      // Use coinAmount as per Onramp dev team
      coinAmount: config.targetUsdcAmount.toFixed(6), // Changed from cryptoAmount
      
      // Lock the amount
      isAmountEditable: 'false',
      isFiatCurrencyEditable: 'true',
      isCoinCodeEditable: 'false',
      
      // Smart contract execution
      calldata: calldata,
      
      // User and order data
      userEmail: config.email,
      partnerOrderId: config.escrowId,
      
      // UI customization
      primaryColor: '2563EB',
      secondaryColor: '1d4ed8',
      isDarkMode: 'false',
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
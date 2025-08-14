import { ethers } from 'ethers';
import { config } from './config';

// ABI for the createEscrow function
const FACTORY_ABI = [
  "function createEscrow(string memory payerEmail, string memory recipientEmail, address recipientWallet, uint256 amount) returns (address)"
];

export interface TransakOneConfig {
  apiKey: string;
  environment: 'STAGING' | 'PRODUCTION';
  walletAddress: string; // User's wallet address
  email: string;
  fiatAmount: number;
  clientEmail: string;
  freelancerEmail: string;
  recipientAddress: string; // Freelancer's wallet/Transak address
}

export function generateTransakOneParams(params: TransakOneConfig) {
  // Generate salt for deterministic escrow address
  const salt = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${params.clientEmail}-${params.freelancerEmail}-${Date.now()}`
    )
  );
  
  // Get factory address from config
  const factoryAddress = config.contracts.factoryV2 || config.contracts.factory;
  
  // Transak should work with your USDC on both test and production
  const usdcAddress = config.usdc.address;
  
  // Encode the function call
  const iface = new ethers.utils.Interface(FACTORY_ABI);
  const calldata = iface.encodeFunctionData('createEscrow', [
    params.clientEmail,
    params.freelancerEmail,
    params.recipientAddress,
    ethers.utils.parseUnits(params.fiatAmount.toString(), 6)
  ]);
  
  return {
    apiKey: params.apiKey,
    environment: params.environment,
    network: params.environment === 'STAGING' ? 'polygon_amoy' : 'polygon',
    email: params.email,
    fiatAmount: params.fiatAmount,
    fiatCurrency: 'USD',
    cryptoCurrencyCode: 'USDC',
    productsAvailed: 'ONE',
    partnerOrderId: salt, // Use salt as order ID for tracking
    walletAddress: params.walletAddress,
    disableWalletAddressForm: true,
    
    // Transak One specific params
    calldata: calldata,
    contractAddress: factoryAddress,
    sourceTokenData: {
      tokenAddress: usdcAddress, // Your Mock USDC on Amoy or real USDC on mainnet
      amount: ethers.utils.parseUnits(params.fiatAmount.toString(), 6).toString(),
    },
    
    // Add webhook URL for notifications
    webhookURL: params.environment === 'STAGING' 
      ? undefined // Set this when you have a staging webhook URL
      : process.env.NEXT_PUBLIC_APP_URL + '/api/transak/webhook',
      
    // Theme customization
    themeColor: '2563EB', // Your brand blue
    widgetHeight: '650px',
    widgetWidth: '100%',
  };
}

// Helper to get Transak deposit address for off-ramp
export async function getTransakDepositAddress(userEmail: string): Promise<string> {
  // In production, this would call Transak API to get/create user's deposit address
  // For now, return a deterministic address based on email
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userEmail));
  return ethers.utils.getAddress('0x' + hash.slice(26));
}

// Helper to verify Transak webhook signatures
export function verifyTransakWebhook(payload: any, signature: string, secret: string): boolean {
  // Implement Transak webhook verification
  // This is a placeholder - check Transak docs for actual implementation
  const expectedSignature = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(JSON.stringify(payload) + secret)
  );
  return signature === expectedSignature;
}

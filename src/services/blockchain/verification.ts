// src/services/blockchain/verification.ts
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class BlockchainVerifier {
  private provider: ethers.providers.JsonRpcProvider;  // v5 syntax
  private usdcContract: ethers.Contract;
  
  constructor(network: 'polygon' | 'polygon-amoy' = 'polygon-amoy') {
    const isTestnet = network === 'polygon-amoy';
    
    // Use your existing RPC setup
    const rpcUrl = isTestnet 
      ? 'https://rpc-amoy.polygon.technology'
      : `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
    
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);  // v5 syntax
    
    // USDC addresses from your constants
    const usdcAddress = isTestnet
      ? '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' // Amoy
      : '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Polygon
    
    const usdcAbi = [
      'function balanceOf(address account) view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ];
    
    this.usdcContract = new ethers.Contract(usdcAddress, usdcAbi, this.provider);
  }

  async verifyFunding(escrowId: string): Promise<{
    isFunded: boolean;
    actualBalance: string;
    blockNumber?: number;
  }> {
    const { data: escrow } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', escrowId)
      .single();
    
    if (!escrow?.vault_address) {
      return { isFunded: false, actualBalance: '0' };
    }
    
    // Check actual USDC balance
    const balance = await this.usdcContract.balanceOf(escrow.vault_address);
    const expectedAmount = ethers.utils.parseUnits(  // v5 syntax
      (escrow.amount_cents / 100).toString(), 
      6 // USDC decimals
    );
    
    const isFunded = balance.gte(expectedAmount);  // v5 uses .gte() not >=
    
    // Update database if funded but not marked
    if (isFunded && escrow.status === 'ACCEPTED') {
      const block = await this.provider.getBlock('latest');
      
      await supabase
        .from('escrows')
        .update({
          status: 'FUNDED',
          blockchain_verified: true,
          verified_at: new Date().toISOString(),
          funded_block_number: block?.number
        })
        .eq('id', escrowId);
      
      // Log the verification
      await this.logVerification(escrowId, 'FUNDING_VERIFIED', {
        balance: balance.toString(),
        expected: expectedAmount.toString(),
        block: block?.number
      });
    }
    
    return { 
      isFunded, 
      actualBalance: ethers.utils.formatUnits(balance, 6),  // v5 syntax
      blockNumber: await this.provider.getBlockNumber()
    };
  }

  async verifyRelease(escrowId: string, txHash: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { success: false, error: 'Transaction not found' };
      }
      
      if (receipt.status === 0) {
        // Transaction failed - revert database
        await supabase
          .from('escrows')
          .update({
            status: 'FUNDED',
            release_tx_hash: null,
            release_error: 'Transaction reverted on chain'
          })
          .eq('id', escrowId);
        
        return { success: false, error: 'Transaction reverted' };
      }
      
      // Transaction succeeded - mark as verified
      await supabase
        .from('escrows')
        .update({
          status: 'RELEASED',
          blockchain_verified: true,
          release_block_number: receipt.blockNumber
        })
        .eq('id', escrowId);
      
      return { success: true };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async logVerification(escrowId: string, action: string, data: any) {
    // Check if table exists first - if not, just log to console
    try {
      await supabase
        .from('blockchain_verifications')
        .insert({
          escrow_id: escrowId,
          action,
          data,
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.log('Verification log:', { escrowId, action, data });
    }
  }
}
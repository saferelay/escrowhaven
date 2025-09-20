import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { vaultAddress, clientWallet, freelancerWallet, splitterAddress } = await request.json();
    
    // Build the verification command
    const args = [
      '"0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"', // USDC
      `"${clientWallet}"`,
      `"${freelancerWallet}"`,
      `"${splitterAddress}"`,
      '"0x0000000000000000000000000000000000000000"' // arbitrator
    ].join(' ');
    
    const command = `cd contracts && npx hardhat verify --network polygon ${vaultAddress} ${args}`;
    
    console.log('Running verification for:', vaultAddress);
    
    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env }
    });
    
    if (stdout.includes('Successfully verified') || stdout.includes('Already Verified')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Contract verified',
        url: `https://polygonscan.com/address/${vaultAddress}#code`
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: stderr || 'Verification failed' 
    });
    
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}
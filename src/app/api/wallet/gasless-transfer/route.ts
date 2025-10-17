// src/app/api/wallet/gasless-transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Polygon mainnet
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

export async function POST(request: NextRequest) {
  try {
    const { 
      action, // 'deposit-to-escrow' or 'withdraw-to-wallet'
      userAddress,
      destinationAddress, // escrow address or user wallet
      amount,
      signature,
      nonce
    } = await request.json();
    
    console.log('Gasless wallet transfer:', { action, userAddress, amount });
    
    // Determine network
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    
    const provider = new ethers.providers.StaticJsonRpcProvider(
      {
        url: isProduction
          ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        skipFetchSetup: true
      },
      {
        chainId: isProduction ? 137 : 80002,
        name: isProduction ? 'polygon-mainnet' : 'polygon-amoy'
      }
    );
    
    // Use SAME gas sponsor wallet as escrow operations
    const privateKey = (isProduction 
      ? process.env.DEPLOYMENT_PRIVATE_KEY_MAINNET 
      : process.env.PRIVATE_KEY)!.replace(/['"]/g, '');
    
    const backendSigner = new ethers.Wallet(privateKey, provider);
    console.log('Using gas sponsor:', await backendSigner.getAddress());
    
    // Check balance
    const signerBalance = await provider.getBalance(backendSigner.address);
    console.log('Gas wallet MATIC balance:', ethers.utils.formatEther(signerBalance));
    
    if (signerBalance.lt(ethers.utils.parseEther('0.05'))) {
      console.warn('⚠️ Low MATIC balance in gas wallet!');
    }
    
    // USDC contract
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, backendSigner);
    
    // Check user's USDC balance
    const userBalance = await usdcContract.balanceOf(userAddress);
    const usdcAmount = ethers.utils.parseUnits(amount.toString(), 6);
    
    console.log('User USDC balance:', ethers.utils.formatUnits(userBalance, 6));
    console.log('Transfer amount:', ethers.utils.formatUnits(usdcAmount, 6));
    
    if (userBalance.lt(usdcAmount)) {
      return NextResponse.json(
        { error: 'Insufficient USDC balance' },
        { status: 400 }
      );
    }
    
    let tx;
    const gasConfig = isProduction ? {
      gasLimit: 200000,
      gasPrice: ethers.utils.parseUnits('100', 'gwei')
    } : {
      gasLimit: 200000,
      gasPrice: ethers.utils.parseUnits('50', 'gwei')
    };
    
    if (action === 'deposit-to-escrow') {
      // User wants to fund escrow from their wallet
      // Backend sponsors the gas for USDC.transfer()
      
      console.log('Executing USDC transfer from user wallet to escrow...');
      
      // Verify signature (user authorized this transfer)
      const messageHash = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'uint256'],
        [userAddress, destinationAddress, usdcAmount, nonce]
      );
      
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(messageHash),
        signature
      );
      
      if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      // Execute transfer with gas sponsorship
      // Note: This requires user to have approved backend as spender first
      tx = await usdcContract.transferFrom(
        userAddress,
        destinationAddress,
        usdcAmount,
        gasConfig
      );
      
    } else if (action === 'withdraw-to-wallet') {
      // Contract releases funds to user wallet
      // Backend sponsors the gas for this transfer
      
      console.log('Executing USDC transfer to user wallet...');
      
      tx = await usdcContract.transfer(
        userAddress,
        usdcAmount,
        gasConfig
      );
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed on-chain');
    }
    
    console.log('✅ Transfer completed:', receipt.transactionHash);
    console.log('Gas used:', receipt.gasUsed.toString());
    
    const explorerUrl = isProduction
      ? `https://polygonscan.com/tx/${receipt.transactionHash}`
      : `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`;
    
    return NextResponse.json({
      success: true,
      txHash: receipt.transactionHash,
      explorer: explorerUrl,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error: any) {
    console.error('Gasless transfer error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Transfer failed',
        details: error.reason 
      },
      { status: 500 }
    );
  }
}
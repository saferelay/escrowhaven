// Simple URL-based offramp - no SDK needed
export async function createSimpleMoonPayOfframp({
    email,
    walletAddress,
    amount,
    withdrawalId,
  }: {
    email?: string;
    walletAddress: string;
    amount: number;
    withdrawalId: string;
  }) {
    try {
      console.log('=== Creating MoonPay Offramp URL ===');
      
      const moonPayMode = process.env.NEXT_PUBLIC_MOONPAY_MODE || 'sandbox';
      const isProduction = moonPayMode === 'production';
      
      const apiKey = isProduction
        ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY
        : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY;
      
      const currencyCode = isProduction ? 'usdc_polygon' : 'eth';
      
      // Build parameters
      const params: Record<string, string> = {
        baseCurrencyCode: 'usd',
        baseCurrencyAmount: amount.toFixed(2),
        defaultCurrencyCode: currencyCode,
        walletAddress: walletAddress,
        externalTransactionId: withdrawalId,
      };
      
      if (email) {
        params.email = email;
      }
      
      // Get signed URL from backend
      const response = await fetch('/api/moonpay/sign-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, flow: 'sell' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate signed URL');
      }
      
      const { url } = await response.json();
      console.log('✅ Signed URL generated');
      
      // Open in new window or iframe
      window.open(url, '_blank', 'width=500,height=700');
      
      return { success: true, url };
      
    } catch (error) {
      console.error('Error creating offramp:', error);
      throw error;
    }
  }
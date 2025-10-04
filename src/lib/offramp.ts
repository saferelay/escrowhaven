// src/lib/offramp.ts
export interface OfframpConfig {
    email: string;
    usdcAmount: number;
    withdrawalId: string;
    userWalletAddress: string;
    isTestMode?: boolean;
  }
  
  export function createOfframpWidget(cfg: OfframpConfig): string {
    const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "1687307";
    
    // Use /main/sell/ endpoint (not /sell/ or /app/)
    const baseSell = "https://onramp.money/main/sell/";
  
    const params = new URLSearchParams({
      appId,
  
      // Wallet where USDC will be withdrawn FROM
      walletAddress: cfg.userWalletAddress,
  
      // USDC on Polygon - THIS IS THE KEY
      coinCode: "usdc",
      network: "matic20",  // ← This is the correct network code for Polygon
  
      // Amount of USDC to sell
      coinAmount: cfg.usdcAmount.toFixed(6),
  
      // Tracking
      merchantRecognitionId: cfg.withdrawalId,
      
      // User info
      userEmail: cfg.email,
  
      // Optional: where to redirect after completion
      // redirectUrl: `${window.location.origin}/dashboard?withdrawal=complete`,
  
      // Theme
      primaryColor: "2563EB",
      secondaryColor: "1d4ed8",
      isDarkMode: "false",
    });
  
    if (cfg.isTestMode) {
      params.set("environment", "sandbox");
    }
  
    return `${baseSell}?${params.toString()}`;
  }
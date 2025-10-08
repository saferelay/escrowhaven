'use client';

import { useState, useRef } from 'react';

export function OnrampSDKTest() {
  const [status, setStatus] = useState('Ready to test');
  const instanceRef = useRef<any>(null);

  const testSDKInit = async () => {
    try {
      setStatus('Creating instance...');
      const { OnrampWebSDK } = await import('@onramp.money/onramp-web-sdk');
      
      const onrampInstance = new OnrampWebSDK({
        appId: Number(process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "1687307"),
        flowType: 2,
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        coinCode: 'usdc',
        network: 'matic20',
        coinAmount: 10,
      } as any);
      
      // Attach event listeners BEFORE showing
      onrampInstance.on('WIDGET_EVENTS', (e: any) => {
        console.log('🟦 WIDGET_EVENT:', e.type, e);
        setStatus(`Widget: ${e.type}`);
      });
      
      onrampInstance.on('TX_EVENTS', (e: any) => {
        console.log('🟩 TX_EVENT:', e.type, e);
        setStatus(`TX: ${e.type}`);
        
        // Look for depositAddress
        if (e.data?.depositAddress) {
          console.log('🎯 DEPOSIT ADDRESS FOUND:', e.data.depositAddress);
        }
      });
      
      instanceRef.current = onrampInstance;
      setStatus('✓ Instance ready');
      
    } catch (error: any) {
      setStatus(`✗ Error: ${error.message}`);
      console.error('SDK init failed:', error);
    }
  };

  const showWidget = () => {
    if (!instanceRef.current) {
      setStatus('Create instance first');
      return;
    }
    
    try {
      instanceRef.current.show();
      setStatus('Widget shown');
    } catch (error: any) {
      setStatus(`✗ Show error: ${error.message}`);
      console.error('Show failed:', error);
    }
  };

  const closeWidget = () => {
    if (!instanceRef.current) return;
    
    try {
      instanceRef.current.close();
      setStatus('Widget closed');
    } catch (error: any) {
      setStatus(`✗ Close error: ${error.message}`);
      console.error('Close failed:', error);
    }
  };

  return (
    <div className="p-6 bg-white border border-[#E0E2E7] rounded-lg space-y-3">
      <h3 className="text-base font-medium text-black">Onramp SDK Test - Step 3</h3>
      <p className="text-sm text-[#787B86]">Status: {status}</p>
      
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={testSDKInit}
          className="px-4 py-2 bg-[#2962FF] text-white text-sm font-medium rounded-lg hover:bg-[#1E53E5]"
        >
          1. Create Instance
        </button>
        
        <button 
          onClick={showWidget}
          disabled={!instanceRef.current}
          className="px-4 py-2 bg-[#26A69A] text-white text-sm font-medium rounded-lg hover:bg-[#229085] disabled:opacity-50"
        >
          2. Show Widget
        </button>
        
        <button 
          onClick={closeWidget}
          disabled={!instanceRef.current}
          className="px-4 py-2 bg-[#EF5350] text-white text-sm font-medium rounded-lg hover:bg-[#E53935] disabled:opacity-50"
        >
          3. Close Widget
        </button>
      </div>
      
      <div className="text-xs text-[#787B86] space-y-1">
        <p>• Create instance with event listeners</p>
        <p>• Show widget (Onramp overlay will appear)</p>
        <p>• Watch console for 🎯 DEPOSIT ADDRESS</p>
        <p>• Close when done testing</p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

export function OnrampSDKTest() {
  const [status, setStatus] = useState('Ready to test');
  const [instance, setInstance] = useState<any>(null);

  const testSDKInit = async () => {
    try {
      setStatus('Importing SDK...');
      const { OnrampWebSDK } = await import('@onramp.money/onramp-web-sdk');
      
      setStatus('Creating instance...');
      
      const onrampInstance = new OnrampWebSDK({
        appId: Number(process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "1687307"),
        flowType: 2,
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        coinCode: 'usdc',
        network: 'matic20',
        coinAmount: 10,
      } as any);
      
      setInstance(onrampInstance);
      setStatus('✓ Instance created (not shown yet)');
      console.log('SDK instance:', onrampInstance);
      console.log('Instance methods:', Object.keys(onrampInstance));
      
    } catch (error: any) {
      setStatus(`✗ Error: ${error.message}`);
      console.error('SDK init failed:', error);
    }
  };

  const testEventListeners = () => {
    if (!instance) {
      setStatus('Create instance first');
      return;
    }

    try {
      setStatus('Testing event listeners...');
      
      instance.on('WIDGET_EVENTS', (e: any) => {
        console.log('Widget event:', e);
      });
      
      instance.on('TX_EVENTS', (e: any) => {
        console.log('TX event:', e);
      });
      
      setStatus('✓ Event listeners attached');
      
    } catch (error: any) {
      setStatus(`✗ Event error: ${error.message}`);
      console.error('Event listener failed:', error);
    }
  };

  return (
    <div className="p-6 bg-white border border-[#E0E2E7] rounded-lg space-y-3">
      <h3 className="text-base font-medium text-black">Onramp SDK Test</h3>
      <p className="text-sm text-[#787B86]">Status: {status}</p>
      
      <div className="flex gap-2">
        <button 
          onClick={testSDKInit}
          className="px-4 py-2 bg-[#2962FF] text-white text-sm font-medium rounded-lg hover:bg-[#1E53E5]"
        >
          1. Create Instance
        </button>
        
        <button 
          onClick={testEventListeners}
          disabled={!instance}
          className="px-4 py-2 bg-[#26A69A] text-white text-sm font-medium rounded-lg hover:bg-[#229085] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          2. Test Events
        </button>
      </div>
      
      <p className="text-xs text-[#787B86]">
        Watch console for logs. CPU should stay normal.
      </p>
    </div>
  );
}
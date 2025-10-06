'use client';

import { useState } from 'react';

export function OnrampSDKTest() {
  const [status, setStatus] = useState('Not loaded');

  const testSDK = async () => {
    try {
      setStatus('Loading SDK...');
      const { OnrampWebSDK } = await import('@onramp.money/onramp-web-sdk');
      setStatus('SDK loaded successfully!');
      console.log('OnrampWebSDK:', OnrampWebSDK);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded">
      <h3 className="font-medium mb-2">Onramp SDK Test</h3>
      <p className="text-sm mb-2">Status: {status}</p>
      <button 
        onClick={testSDK}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test SDK Import
      </button>
    </div>
  );
}
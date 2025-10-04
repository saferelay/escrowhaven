// src/app/moonpay-activation/page.tsx
'use client';
import React from 'react';

export default function MoonpayActivationRemoved() {
  return (
    <div className="p-6 text-sm text-gray-700">
      The MoonPay activation flow has been removed. 
      Please use the new Onramp.money funding flow from the escrow detail screen.
    </div>
  );
}

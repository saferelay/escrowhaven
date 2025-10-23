'use client';

import { useState } from 'react';
import { loadMoonPay } from '@moonpay/moonpay-js';

export default function MoonPayApprovalTest() {
  const [status, setStatus] = useState('Ready to test');
  const [error, setError] = useState('');

  const runApprovalTest = async () => {
    try {
      setStatus('Loading MoonPay SDK...');
      setError('');
      
      // Verify API key
      const apiKey = process.env.NEXT_PUBLIC_MOONPAY_PUBLISHABLE_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_MOONPAY_PUBLISHABLE_KEY not found in environment variables');
      }
      
      console.log('[MoonPay Test] Using API key:', apiKey.substring(0, 10) + '...');
      
      // Load MoonPay SDK
      const moonPay = await loadMoonPay();
      console.log('[MoonPay Test] SDK loaded successfully');
      
      setStatus('Initializing widget for approval test...');
      
      // Initialize with BUY flow (required for approval test)
      const moonPaySdk = moonPay({
        flow: 'buy', // CRITICAL: Must be 'buy' for approval test
        environment: 'sandbox', // Test environment
        variant: 'overlay', // Modal overlay
        params: {
          apiKey: apiKey,
          theme: 'light',
          baseCurrencyCode: 'usd', // User pays with USD
          baseCurrencyAmount: '100', // $100 test transaction
          defaultCurrencyCode: 'eth', // Must buy ETH for test (MoonPay requirement)
        }
      });
      
      console.log('[MoonPay Test] Widget initialized');
      setStatus('Widget ready! Opening MoonPay...');
      
      // Show the widget
      moonPaySdk.show();
      console.log('[MoonPay Test] Widget displayed');
      
      setStatus('✅ Widget opened! Complete the test transaction with test card.');
      
    } catch (err) {
      console.error('[MoonPay Test] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('❌ Error - check console and fix issues above');
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '40px auto', 
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          MoonPay Integration Test
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Complete this test for MoonPay onboarding approval
        </p>
      </div>

      {/* Prerequisites */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd',
        padding: '24px', 
        borderRadius: '12px',
        marginBottom: '24px' 
      }}>
        <h3 style={{ marginTop: 0, fontSize: '18px' }}>✅ Prerequisites Checklist:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>ETH Enabled:</strong> Go to MoonPay Dashboard → Settings → Currencies → Enable ETH
          </li>
          <li>
            <strong>Domain Added:</strong> Dashboard → Developers → Domains → Add "http://localhost:3000"
          </li>
          <li>
            <strong>API Key Set:</strong> Add NEXT_PUBLIC_MOONPAY_PUBLISHABLE_KEY to .env.local
          </li>
          <li>
            <strong>SDK Installed:</strong> Run: npm install @moonpay/moonpay-js
          </li>
        </ul>
      </div>

      {/* Test Button */}
      <button 
        onClick={runApprovalTest}
        style={{
          width: '100%',
          background: '#7D00FF',
          color: 'white',
          padding: '20px 32px',
          border: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '24px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#6600DD'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#7D00FF'}
      >
        🚀 Run MoonPay Approval Test
      </button>
      
      {/* Status Display */}
      <div style={{ 
        background: status.includes('❌') ? '#fef2f2' : '#f0fdf4', 
        border: `1px solid ${status.includes('❌') ? '#fecaca' : '#bbf7d0'}`,
        padding: '16px 20px', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <strong>Status:</strong> {status}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '16px 20px', 
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#dc2626'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        background: '#fafafa', 
        padding: '24px', 
        borderRadius: '12px',
        border: '1px solid #e5e5e5'
      }}>
        <h4 style={{ marginTop: 0 }}>📝 What to do when widget opens:</h4>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>1. Use Test Card:</strong>
          <div style={{ 
            background: '#fff', 
            padding: '12px', 
            borderRadius: '6px',
            fontFamily: 'monospace',
            marginTop: '8px',
            border: '1px solid #e5e5e5'
          }}>
            Card: 4000 0209 5159 5032<br/>
            Expiry: 12/25<br/>
            CVV: 123
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>2. Enter Test Info:</strong>
          <ul style={{ marginTop: '8px' }}>
            <li>Email: test@example.com (or your email)</li>
            <li>Address: Any test address</li>
            <li>Name: Test User</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>3. Complete Purchase:</strong>
          <ul style={{ marginTop: '8px' }}>
            <li>Click through all steps</li>
            <li>Accept terms and conditions</li>
            <li>Complete the transaction</li>
          </ul>
        </div>

        <div>
          <strong>4. Verify Success:</strong>
          <ul style={{ marginTop: '8px' }}>
            <li>Check MoonPay Dashboard → Transactions</li>
            <li>Transaction should appear as "Completed"</li>
            <li>Onboarding step will auto-complete ✅</li>
          </ul>
        </div>
      </div>

      {/* After Test */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px 20px',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px'
      }}>
        <strong>💡 After test completes:</strong>
        <ul style={{ marginTop: '8px', marginBottom: 0 }}>
          <li>You can disable ETH in MoonPay dashboard (if not needed)</li>
          <li>Your offramp (sell) integration will work once approved</li>
          <li>This test is only for onboarding - not for production use</li>
        </ul>
      </div>

      {/* Links */}
      <div style={{ 
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e5e5',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Helpful Links:</strong>
        <ul>
          <li>
            <a href="https://www.moonpay.com/dashboard" target="_blank" rel="noopener">
              MoonPay Dashboard
            </a>
          </li>
          <li>
            <a href="https://www.moonpay.com/dashboard/getting-started" target="_blank" rel="noopener">
              Onboarding Progress
            </a>
          </li>
          <li>
            <a href="https://docs.moonpay.com" target="_blank" rel="noopener">
              MoonPay Documentation
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
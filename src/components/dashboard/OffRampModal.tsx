// src/components/dashboard/OffRampModal.tsx
import { useEffect, useState } from 'react';
import { loadMoonPay } from '@moonpay/moonpay-js';

interface OffRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmount: number;
  userEmail: string;
  walletAddress: string;
  withdrawalId: string;
}

export function OffRampModal({ 
  isOpen, 
  onClose, 
  availableAmount, 
  userEmail, 
  walletAddress,
  withdrawalId 
}: OffRampModalProps) {
  const [loading, setLoading] = useState(true);
  const [moonPayWidget, setMoonPayWidget] = useState<any>(null);

  useEffect(() => {
    let widget: any = null;

    const initMoonPaySell = async () => {
      if (isOpen && availableAmount > 0) {
        try {
          setLoading(true);
          const moonPay = await loadMoonPay();
          
          const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
          
          widget = moonPay({
            flow: 'sell',
            environment: isProduction ? 'production' : 'sandbox',
            variant: 'overlay',
            params: {
              apiKey: isProduction 
                ? process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY!
                : process.env.NEXT_PUBLIC_MOONPAY_TEST_KEY!,
              baseCurrencyCode: 'usdc_polygon',
              baseCurrencyAmount: availableAmount.toString(),
              quoteCurrencyCode: 'usd',
              email: userEmail,
              externalTransactionId: withdrawalId,
              redirectURL: `${window.location.origin}/dashboard?withdrawal=complete&orderId=${withdrawalId}&status=success`,
              theme: 'light',
              colorCode: '#2962FF'
            }
          });
          
          setMoonPayWidget(widget);
          setLoading(false);
          
          // Show the widget
          widget.show();
          
        } catch (error) {
          console.error('MoonPay initialization error:', error);
          setLoading(false);
          alert('Failed to initialize MoonPay. Please try again.');
          onClose();
        }
      }
    };

    if (isOpen) {
      initMoonPaySell();
    }

    // Cleanup
    return () => {
      if (widget) {
        try {
          widget.close();
        } catch (e) {
          console.error('Error closing widget:', e);
        }
      }
    };
  }, [isOpen, availableAmount, userEmail, withdrawalId, onClose]);

  // Handle close
  const handleClose = () => {
    if (moonPayWidget) {
      try {
        moonPayWidget.close();
      } catch (e) {
        console.error('Error closing widget:', e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  // MoonPay handles its own overlay UI, so we only show loading state
  if (!loading && moonPayWidget) {
    // MoonPay widget is active, return null to not interfere
    return null;
  }

  // Loading state
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-[400px] w-full shadow-2xl p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#2962FF] rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Preparing Withdrawal
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            Withdrawing ${availableAmount.toFixed(2)} USDC
          </p>
          <p className="text-xs text-gray-400">
            Loading MoonPay secure checkout...
          </p>
        </div>
      </div>
    </div>
  );
}
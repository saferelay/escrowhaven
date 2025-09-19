// src/components/icons/PaymentIcons.tsx
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const PaymentIconContainer: React.FC<React.PropsWithChildren<IconProps>> = ({
  size = 32,
  className = "",
  children,
}) => (
  <div
    className={`inline-flex items-center justify-center ${className}`}
    style={{
      height: size,
      minWidth: size * 1.2,
      maxWidth: size * 2,
    }}
  >
    {children}
  </div>
);

export const VisaIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/visa.svg" 
      alt="Visa" 
      style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }} 
    />
  </PaymentIconContainer>
);

export const MastercardIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/mastercard.svg" 
      alt="Mastercard" 
      style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }} 
    />
  </PaymentIconContainer>
);

export const AmexIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/amex.svg" 
      alt="American Express" 
      style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }} 
    />
  </PaymentIconContainer>
);

export const BankIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/bank.svg" 
      alt="Bank Transfer" 
      style={{ maxHeight: '130%', width: 'auto', objectFit: 'contain' }} // Increased to 130%
    />
  </PaymentIconContainer>
);

export const ApplePayIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/apple-pay.svg" 
      alt="Apple Pay" 
      style={{ maxHeight: '65%', width: 'auto', objectFit: 'contain' }} // Reduced to 85% to account for border
    />
  </PaymentIconContainer>
);

export const GooglePayIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/google-pay.svg" 
      alt="Google Pay" 
      style={{ maxHeight: '100%', width: 'auto', objectFit: 'contain' }} 
    />
  </PaymentIconContainer>
);

export const UPIIcon: React.FC<IconProps> = ({ size = 32, className = "" }) => (
  <PaymentIconContainer size={size} className={className}>
    <img 
      src="/payment-icons/upi.svg" 
      alt="UPI" 
      style={{ maxHeight: '60%', width: 'auto', objectFit: 'contain' }} // Reduced to 70% as it's too large
    />
  </PaymentIconContainer>
);
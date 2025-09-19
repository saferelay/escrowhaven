// EscrowHaven Design System
// Based on trust-first principles and Stripe-inspired aesthetics

export const colors = {
  // Primary - Deep blue for trust
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Success - Mint green for safety/clarity
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  // Warning - Warm yellow for attention
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Error - Coral for critical actions
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Neutral grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const typography = {
  // Using Inter for clarity
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
};

export const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
};

export const borderRadius = {
  sm: '0.375rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Status mappings with human-friendly names and icon names
export const statusConfig = {
  INITIATED: {
    label: 'Invitation Sent',
    color: 'warning',
    icon: 'invitation',
    description: 'Waiting for acceptance',
  },
  ACCEPTED: {
    label: 'Ready to Fund',
    color: 'success',
    icon: 'accepted',
    description: 'Both parties agreed',
  },
  FUNDED: {
    label: 'Payment Secured',
    color: 'primary',
    icon: 'funded',
    description: 'Awaiting approval',
  },
  RELEASED: {
    label: 'Payment Complete',
    color: 'success',
    icon: 'released',
    description: 'Funds delivered',
  },
  DECLINED: {
    label: 'Declined',
    color: 'error',
    icon: 'declined',
    description: 'Invitation declined',
  },
  REFUND_REQUESTED: {
    label: 'Refund Pending',
    color: 'warning',
    icon: 'refundRequested',
    description: 'Refund needs approval',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'gray',
    icon: 'refunded',
    description: 'Payment returned',
  },
};

// Action button configurations
export const actionButtons = {
  primary: {
    accept: {
      label: 'Accept & Continue',
      description: 'Agree to this payment arrangement',
    },
    fund: {
      label: 'Add Funds',
      description: 'Secure payment in escrow',
    },
    approve: {
      label: 'Release Payment',
      description: 'Confirm work is complete',
    },
  },
  secondary: {
    decline: {
      label: 'Decline',
      description: 'Reject this arrangement',
    },
    dispute: {
      label: 'Report Issue',
      description: 'Something went wrong',
    },
    refund: {
      label: 'Issue Refund',
      description: 'Return payment to sender',
    },
  },
};

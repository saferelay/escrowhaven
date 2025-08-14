import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getExplorerUrl(address: string, network: string = 'base'): string {
  const explorers: Record<string, string> = {
    base: 'https://basescan.org',
    'base-testnet': 'https://goerli.basescan.org',
    polygon: 'https://polygonscan.com',
    'polygon-testnet': 'https://mumbai.polygonscan.com'
  }
  
  return `${explorers[network] || explorers.base}/address/${address}`
}

export function calculateFees(amount: number): {
  platformFee: number
  recipientAmount: number
  feePercentage: number
} {
  const feePercentage = 0.0199 // 1.99%
  const platformFee = amount * feePercentage
  const recipientAmount = amount - platformFee
  
  return {
    platformFee: Math.round(platformFee * 100) / 100,
    recipientAmount: Math.round(recipientAmount * 100) / 100,
    feePercentage: feePercentage * 100
  }
}

export function generateEscrowId(): string {
  const prefix = 'ESC'
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${randomNum}`
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  return 'just now'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
'use client'

import { useState, useEffect } from 'react'

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<void>
  email: string
}

export default function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  email 
}: EmailVerificationModalProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await onVerify(code)
      onClose()
    } catch (err) {
      setError('Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleResend = async () => {
    setResendCooldown(60)
    // Call resend API
    console.log('Resending code to', email)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Verify Your Email</h3>
          <p className="text-gray-600 text-sm">
            We've sent a verification code to<br />
            <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:border-primary-500 focus:outline-none"
              placeholder="000000"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-primary-600 hover:underline disabled:text-gray-400"
          >
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : "Didn't receive code? Resend"}
          </button>
        </div>
      </div>
    </div>
  )
}
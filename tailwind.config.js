// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core EscrowHaven colors (from design system)
        'primary': '#2962FF',
        'primary-hover': '#1E53E5',
        'success': '#26A69A',
        'warning': '#F7931A',
        'danger': '#EF5350',
        
        // Text colors
        'text-primary': '#000000',
        'text-secondary': '#787B86',
        'text-tertiary': '#B2B5BE',
        
        // Background colors
        'bg-input': '#F8F9FD',
        'bg-hover': '#F0F2F5',
        'bg-code': '#F8F9FD',
        'bg-selected': '#E3EFFD',
        'bg-dark': '#131722',
        
        // Border
        'border': '#E0E2E7',
        
        // Keep emerald for existing components
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        // Keep amber for existing components
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Trebuchet MS', 'Roboto', 'Segoe UI', 'Ubuntu', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'h1': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'h2': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        'h3': ['1.875rem', { lineHeight: '1.3' }],
        'h4': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'overline': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.08em' }],
      },
      
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
        '4xl': '6rem',     // 96px
        '5xl': '8rem',     // 128px
      },
      
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(41, 98, 255, 0.1)',
        'button-hover': '0 4px 8px rgba(41, 98, 255, 0.25)',
      },
      
      maxWidth: {
        'container': '960px',
      },
      
      animation: {
        'slide-in': 'slideIn 250ms ease-out',
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Add this line
      },
      
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      
      zIndex: {
        'dropdown': '100',
        'modal': '200',
        'popover': '300',
        'tooltip': '400',
        'notification': '500',
      },
    },
  },
  plugins: [],
}
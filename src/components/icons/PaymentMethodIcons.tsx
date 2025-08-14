// components/icons/PaymentMethodIcons.tsx
export function PaymentMethodIcons() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Using simple, clean representations */}
      
      {/* Mastercard */}
      <div className="h-8">
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA0NSAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTAiIGZpbGw9IiNFQjAwMUIiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIxNSIgcj0iMTAiIGZpbGw9IiNGNzlFMUIiLz4KPHBhdGggZD0iTTIyLjUgNS41QzI0LjgyMDkgNy43NjE1OSAyNi4yNSAxMC44NzcyIDI2LjI1IDE0LjVDMjYuMjUgMTguMTIyOCAyNC44MjA5IDIxLjIzODQgMjIuNSAyMy41QzIwLjE3OTEgMjEuMjM4NCAxOC43NSAxOC4xMjI4IDE4Ljc1IDE0LjVDMTguNzUgMTAuODc3MiAyMC4xNzkxIDcuNzYxNTkgMjIuNSA1LjVaIiBmaWxsPSIjRkY1RjAwIi8+Cjwvc3ZnPg=="
          alt="Mastercard"
          className="h-full"
        />
      </div>

      {/* Visa */}
      <div className="h-8">
        <div className="bg-white border border-gray-200 rounded px-3 py-1 h-full flex items-center">
          <span className="text-[#1A1F71] font-bold text-lg italic">VISA</span>
        </div>
      </div>

      {/* OB */}
      <div className="h-8 flex items-center">
        <div className="font-bold text-gray-700 text-lg">OB</div>
      </div>

      {/* Faster Payments */}
      <div className="h-8 flex items-center">
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L13 3V13L3 8Z" fill="#0052CC"/>
          </svg>
          <div>
            <div className="text-[#0052CC] text-xs font-semibold leading-tight">Faster</div>
            <div className="text-[#0052CC] text-xs font-semibold leading-tight">Payments</div>
          </div>
        </div>
      </div>

      {/* SEPA */}
      <div className="h-8 flex items-center">
        <span className="text-[#003087] font-bold text-lg">S€PA</span>
      </div>

      {/* Apple Pay */}
      <div className="h-8 flex items-center">
        <div className="bg-black text-white rounded-md px-3 py-1 flex items-center gap-1 h-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
          </svg>
          <span className="text-sm font-medium">Pay</span>
        </div>
      </div>

      {/* Google Pay */}
      <div className="h-8 flex items-center">
        <div className="bg-white border border-gray-200 rounded-md px-3 py-1 flex items-center gap-1 h-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12.65 12.19C12.65 11.55 12.61 10.91 12.56 10.28H7.5V13.92H10.48C10.32 14.88 9.82 15.72 9.06 16.29V18.21H10.95C12.13 17.11 12.65 15.45 12.65 12.19Z" fill="#4285F4"/>
            <path d="M7.5 20C9.29 20 10.83 19.42 11.96 18.21L10.06 16.29C9.47 16.69 8.72 16.91 7.5 16.91C5.77 16.91 4.26 15.79 3.72 14.23H1.75V16.21C2.73 18.14 4.96 20 7.5 20Z" fill="#34A853"/>
            <path d="M3.72 14.23C3.6 13.83 3.53 13.41 3.53 12.98C3.53 12.55 3.6 12.13 3.72 11.73V9.75H1.75C1.32 10.6 1.08 11.55 1.08 12.55C1.08 13.55 1.32 14.5 1.75 15.35L3.72 14.23Z" fill="#FBBC04"/>
            <path d="M7.5 8.08C8.79 8.08 9.94 8.53 10.85 9.41L12 8.26C10.83 7.18 9.29 6.58 7.5 6.58C4.96 6.58 2.73 8.44 1.75 10.37L3.72 12.35C4.26 10.79 5.77 9.67 7.5 8.08Z" fill="#EA4335"/>
          </svg>
          <span className="text-gray-700 text-sm font-medium">Pay</span>
        </div>
      </div>

      {/* Wire */}
      <div className="h-8 flex items-center">
        <div className="flex items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 21H21M3 10H21M5 6L12 3L19 6M5 21V10M19 21V10M9 21V14H15V21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-gray-700 font-medium">Wire</span>
        </div>
      </div>
    </div>
  );
}
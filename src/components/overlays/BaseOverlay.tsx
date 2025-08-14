// src/components/overlays/BaseOverlay.tsx
'use client';

interface BaseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'default' | 'large';
}

export function BaseOverlay({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'default'
}: BaseOverlayProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-xl',
    large: 'max-w-4xl'
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-full ${sizeClasses[size]} bg-white shadow-xl z-50 flex flex-col animate-slide-in`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
}
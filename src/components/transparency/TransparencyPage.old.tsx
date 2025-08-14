// src/components/transparency/TransparencyPage.tsx
'use client';

export function TransparencyPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
            <span className="text-sm font-medium text-gray-900">Transparency Hub</span>
          </div>
        </div>
      </header>
      
      <main className="pt-14 p-8">
        <h1 className="text-4xl font-bold mb-4">Transparency Hub</h1>
        <p className="text-gray-600">Your Money, Your Control - Always</p>
      </main>
    </div>
  );
}
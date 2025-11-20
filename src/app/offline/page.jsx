'use client';

import Image from 'next/image';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-8">
          <Image
            src="/logo.png"
            alt="Head Huntd Logo"
            width={96}
            height={96}
            className="object-contain invert"
            priority
          />
        </div>
        
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          
          <h1 className="text-white text-2xl font-bold mb-2">You're Offline</h1>
          <p className="text-gray-400 mb-6">
            It looks like you've lost your internet connection. Please check your connection and try again.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

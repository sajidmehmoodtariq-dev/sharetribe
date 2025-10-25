'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 text-green-500 shrink-0" viewBox="0 0 100 100" fill="currentColor">
            <text x="10" y="70" fontSize="80" fontFamily="Arial" fontWeight="bold">|||</text>
          </svg>
          <div>
            <h3 className="text-white font-semibold text-sm">Install Head Huntd</h3>
            <p className="text-gray-400 text-xs">Install our app for a better experience!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}

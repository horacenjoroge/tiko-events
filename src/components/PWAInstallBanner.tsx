// src/components/PWAInstallBanner.tsx - Install Prompt Component
'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { PWAManager } from '@/lib/pwa';

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const pwa = PWAManager.getInstance();
    
    // Check if already installed
    if (pwa.isInstalled()) {
      return;
    }

    const handleInstallAvailable = () => setShowBanner(true);
    const handleInstallCompleted = () => setShowBanner(false);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const pwa = PWAManager.getInstance();
      const installed = await pwa.installPWA();
      
      if (installed) {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember user dismissed (could store in localStorage)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-purple-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Install TiKo App</h3>
          <p className="text-xs text-gray-600 mb-3">
            Add TiKo to your home screen for quick access to events and tickets!
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="btn btn-primary btn-sm flex-1"
            >
              {isInstalling ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Download className="w-3 h-3 mr-1" />
              )}
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm px-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
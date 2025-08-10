// src/components/PWAUpdateNotification.tsx - Update Notification
'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { PWAManager } from '@/lib/pwa';

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => setShowUpdate(true);

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const pwa = PWAManager.getInstance();
      await pwa.updateServiceWorker();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-xl shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm">App Update Available</h3>
          <p className="text-xs text-blue-100 mb-3">
            A new version of TiKo is available with improvements and bug fixes.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white text-blue-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors flex-1"
            >
              {isUpdating ? (
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                'Update Now'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

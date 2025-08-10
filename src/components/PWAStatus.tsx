// src/components/PWAStatus.tsx - Connection & Cache Status
'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Settings } from 'lucide-react';
import { enhancedPWA } from '@/lib/pwa'

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheSize, setCacheSize] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get cache size
    updateCacheSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateCacheSize = async () => {
    try {
      const pwa = enhancedPWA;
      const size = await pwa.getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      const pwa = enhancedPWA;
      await pwa.clearCache();
      setCacheSize(0);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Status indicator in header */}
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className="text-xs text-gray-600">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </button>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">App Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Connection Status</p>
                    <p className="text-sm text-gray-600">
                      {isOnline ? 'Connected to internet' : 'Working offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cache Size</p>
                    <p className="text-sm text-gray-600">{formatBytes(cacheSize)}</p>
                  </div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="btn btn-outline btn-sm"
                >
                  Clear Cache
                </button>
              </div>

              <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Offline Features:</p>
                <ul className="space-y-1">
                  <li>• View cached events and tickets</li>
                  <li>• Browse your order history</li>
                  <li>• Access saved content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
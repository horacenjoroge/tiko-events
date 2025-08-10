// src/components/PWAProvider.tsx - PWA Context Provider
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { enhancedPWA, PWAStatus, PWACapabilities } from '@/lib/pwa';
import { notificationManager } from '@/lib/notification';
import { backgroundSync } from '@/lib/background-sync';
import { offlineStorage } from '@/lib/offline-storage';

interface PWAContextType {
  status: PWAStatus | null;
  capabilities: PWACapabilities;
  isLoading: boolean;
  installPWA: () => Promise<boolean>;
  requestNotifications: () => Promise<NotificationPermission>;
  updateApp: () => Promise<void>;
  clearData: () => Promise<void>;
  getDeviceInfo: () => any;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<PWAStatus | null>(null);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    serviceWorker: false,
    pushNotifications: false,
    backgroundSync: false,
    offlineStorage: false,
    installPrompt: false,
    cameraAccess: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePWA();
    setupEventListeners();
  }, []);

  const initializePWA = async () => {
    try {
      setIsLoading(true);
      
      // Get capabilities
      const caps = enhancedPWA.getCapabilities();
      setCapabilities(caps);
      
      // Get initial status
      const initialStatus = await enhancedPWA.getStatus();
      setStatus(initialStatus);
      
      // Setup for Kenya if first time
      const isFirstTime = !localStorage.getItem('pwa_initialized');
      if (isFirstTime) {
        await enhancedPWA.setupForKenya();
        
        // Check for slow network and optimize
        if (navigator.connection?.effectiveType === '2g' || navigator.connection?.effectiveType === 'slow-2g') {
          await enhancedPWA.optimizeForSlowNetwork();
        }
        
        localStorage.setItem('pwa_initialized', 'true');
      }
      
      // Preload critical data if online
      if (navigator.onLine) {
        enhancedPWA.preloadCriticalData().catch(console.error);
      }
      
    } catch (error) {
      console.error('PWA initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Update status when online/offline
    const updateStatus = async () => {
      const newStatus = await enhancedPWA.getStatus();
      setStatus(newStatus);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    // Update status when background sync completes
    window.addEventListener('background-sync', updateStatus);
    
    // Update status periodically
    const statusInterval = setInterval(updateStatus, 60000); // Every minute
    
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('background-sync', updateStatus);
      clearInterval(statusInterval);
    };
  };

  const installPWA = async (): Promise<boolean> => {
    try {
      return await enhancedPWA.installPWA();
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  };

  const requestNotifications = async (): Promise<NotificationPermission> => {
    try {
      return await enhancedPWA.requestNotificationPermission();
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  };

  const updateApp = async (): Promise<void> => {
    try {
      await enhancedPWA.updateServiceWorker();
    } catch (error) {
      console.error('App update failed:', error);
      throw error;
    }
  };

  const clearData = async (): Promise<void> => {
    try {
      await enhancedPWA.clearAllData();
      // Refresh the page after clearing data
      window.location.reload();
    } catch (error) {
      console.error('Data clearing failed:', error);
      throw error;
    }
  };

  const getDeviceInfo = () => {
    const nav = navigator as any;
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      deviceMemory: nav.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt
      } : null
    };
  };

  const contextValue: PWAContextType = {
    status,
    capabilities,
    isLoading,
    installPWA,
    requestNotifications,
    updateApp,
    clearData,
    getDeviceInfo
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

// Hook to use PWA context
export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

// Notification Handler Component
export function NotificationHandler() {
  useEffect(() => {
    // Handle notification events
    const handleNotificationEvent = (event: CustomEvent) => {
      const { type, message } = event.detail;
      
      // Show toast notification
      showToast(message, type);
    };

    const handlePWAAnalytics = (event: CustomEvent) => {
      const { event: eventName, data } = event.detail;
      
      // In production, send to analytics service
      console.log('PWA Analytics:', eventName, data);
    };

    window.addEventListener('pwa-notification', handleNotificationEvent as EventListener);
    window.addEventListener('pwa-analytics', handlePWAAnalytics as EventListener);

    return () => {
      window.removeEventListener('pwa-notification', handleNotificationEvent as EventListener);
      window.removeEventListener('pwa-analytics', handlePWAAnalytics as EventListener);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Simple toast notification function
function showToast(message: string, type: 'success' | 'warning' | 'error' | 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
  
  // Style based on type
  const styles = {
    success: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  toast.className += ` ${styles[type]}`;
  toast.textContent = message;
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 5000);
  
  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  });
}

// PWA Hook for components
export function usePWAFeatures() {
  const pwa = usePWA();
  
  return {
    ...pwa,
    // Convenience methods
    isOnline: pwa.status?.isOnline ?? navigator.onLine,
    isInstalled: pwa.status?.isInstalled ?? false,
    hasNotifications: pwa.status?.notificationPermission === 'granted',
    hasPendingSync: (pwa.status?.syncQueueLength ?? 0) > 0,
    
    // Quick actions
    async enableNotifications() {
      const permission = await pwa.requestNotifications();
      if (permission === 'granted') {
        // Show welcome notification
        await notificationManager.showNotification({
          title: '🎉 Notifications Enabled!',
          body: 'You\'ll now receive updates about your events and tickets.',
          tag: 'welcome-notification'
        });
      }
      return permission;
    },
    
    async saveEventOffline(event: any) {
      await offlineStorage.cacheEvent(event);
      showToast('Event saved for offline viewing', 'success');
    },
    
    async scheduleEventReminder(eventId: string, eventTitle: string, eventDate: string) {
      const reminderTimes = [
        24 * 60 * 60 * 1000,      // 1 day before
        2 * 60 * 60 * 1000,       // 2 hours before
        30 * 60 * 1000            // 30 minutes before
      ];
      
      for (const reminderTime of reminderTimes) {
        await notificationManager.scheduleEventReminder(
          eventTitle,
          eventDate,
          eventId,
          reminderTime
        );
      }
      
      showToast('Event reminders scheduled', 'success');
    },
    
    async queueOfflineOrder(orderData: any) {
      await backgroundSync.queueOrderCreation(orderData);
      showToast('Order queued. Will process when online.', 'info');
    }
  };
}

// Hook for offline capabilities
export function useOfflineCapabilities() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasCache, setHasCache] = useState(false);
  
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Check if we have cached data
    checkCacheStatus();
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);
  
  const checkCacheStatus = async () => {
    try {
      const [events, tickets, orders] = await Promise.all([
        offlineStorage.getCachedEvents(),
        offlineStorage.getCachedTickets(),
        offlineStorage.getCachedOrders()
      ]);
      
      setHasCache(events.length > 0 || tickets.length > 0 || orders.length > 0);
    } catch (error) {
      console.error('Failed to check cache status:', error);
    }
  };
  
  return {
    isOnline,
    hasCache,
    canWork: isOnline || hasCache,
    
    // Offline-specific methods
    async getCachedEvents() {
      return offlineStorage.getCachedEvents();
    },
    
    async getCachedTickets() {
      return offlineStorage.getCachedTickets();
    },
    
    async getCachedOrders() {
      return offlineStorage.getCachedOrders();
    },
    
    async searchOffline(query: string) {
      return offlineStorage.searchCachedEvents(query);
    }
  };
}
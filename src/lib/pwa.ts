// src/lib/enhanced-pwa.ts - Complete PWA Manager with All Features
import { offlineStorage } from './offline-storage';
import { backgroundSync } from './background-sync';
import { notificationManager } from './notification';

export interface PWACapabilities {
  serviceWorker: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  offlineStorage: boolean;
  installPrompt: boolean;
  cameraAccess: boolean;
}

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  notificationPermission: NotificationPermission;
  syncQueueLength: number;
  cacheSize: number;
  lastSyncTime?: Date;
}

export class EnhancedPWAManager {
  private static instance: EnhancedPWAManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;
  private capabilities: PWACapabilities = {
    serviceWorker: false,
    pushNotifications: false,
    backgroundSync: false,
    offlineStorage: false,
    installPrompt: false,
    cameraAccess: false
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializePWA();
    }
  }

  static getInstance(): EnhancedPWAManager {
    if (!EnhancedPWAManager.instance) {
      EnhancedPWAManager.instance = new EnhancedPWAManager();
    }
    return EnhancedPWAManager.instance;
  }

  private async initializePWA() {
    console.log('EnhancedPWA: Initializing complete PWA functionality...');
    
    // Check capabilities
    this.checkCapabilities();
    
    // Initialize core components
    await this.initializeServiceWorker();
    await this.initializeOfflineStorage();
    await this.initializeNotifications();
    await this.initializeBackgroundSync();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup periodic maintenance
    this.setupMaintenanceTasks();
    
    console.log('EnhancedPWA: Initialization complete');
  }

  // Check device/browser capabilities
  private checkCapabilities() {
    this.capabilities = {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'Notification' in window && 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      offlineStorage: 'indexedDB' in window,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      cameraAccess: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    };
    
    console.log('EnhancedPWA: Capabilities detected:', this.capabilities);
  }

  // Initialize service worker
  private async initializeServiceWorker() {
    if (!this.capabilities.serviceWorker) {
      console.warn('EnhancedPWA: Service Worker not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('EnhancedPWA: Service Worker registered successfully');

      // Handle updates
      this.swRegistration.addEventListener('updatefound', () => {
        this.handleServiceWorkerUpdate();
      });

      // Check if controlling
      if (navigator.serviceWorker.controller) {
        console.log('EnhancedPWA: Service Worker is controlling the page');
      }

    } catch (error) {
      console.error('EnhancedPWA: Service Worker registration failed:', error);
    }
  }

  // Initialize offline storage
  private async initializeOfflineStorage() {
    if (!this.capabilities.offlineStorage) {
      console.warn('EnhancedPWA: IndexedDB not supported');
      return;
    }

    try {
      await offlineStorage.initialize();
      console.log('EnhancedPWA: Offline storage initialized');
    } catch (error) {
      console.error('EnhancedPWA: Failed to initialize offline storage:', error);
    }
  }

  // Initialize notifications
  private async initializeNotifications() {
    if (!this.capabilities.pushNotifications) {
      console.warn('EnhancedPWA: Push notifications not supported');
      return;
    }

    try {
      // Check current permission
      const permission = notificationManager.getPermissionStatus();
      console.log('EnhancedPWA: Notification permission:', permission);
      
      if (permission === 'granted') {
        // Already granted, ensure subscription is active
        await this.ensureNotificationSubscription();
      }
    } catch (error) {
      console.error('EnhancedPWA: Failed to initialize notifications:', error);
    }
  }

  // Initialize background sync
  private async initializeBackgroundSync() {
    if (!this.capabilities.backgroundSync) {
      console.warn('EnhancedPWA: Background Sync not supported');
      return;
    }

    try {
      // Background sync manager will initialize itself
      console.log('EnhancedPWA: Background sync initialized');
    } catch (error) {
      console.error('EnhancedPWA: Failed to initialize background sync:', error);
    }
  }

  // Setup event listeners
  private setupEventListeners() {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('EnhancedPWA: App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      
      // Track installation
      this.trackEvent('pwa_installed');
    });

    // Online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Visibility change (app background/foreground)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Background sync events
    window.addEventListener('background-sync', this.handleBackgroundSyncEvent.bind(this));
  }

  // Setup maintenance tasks
  private setupMaintenanceTasks() {
    // Clear expired cache every hour
    setInterval(async () => {
      try {
        await offlineStorage.clearExpiredCache();
        console.log('EnhancedPWA: Cache maintenance completed');
      } catch (error) {
        console.error('EnhancedPWA: Cache maintenance failed:', error);
      }
    }, 60 * 60 * 1000);

    // Sync data every 5 minutes when online
    setInterval(async () => {
      if (navigator.onLine) {
        try {
          await backgroundSync.forcSync();
        } catch (error) {
          // Silent fail for periodic sync
        }
      }
    }, 5 * 60 * 1000);

    // Update app data every 30 minutes when online
    setInterval(async () => {
      if (navigator.onLine) {
        await this.updateCriticalData();
      }
    }, 30 * 60 * 1000);
  }

  // Handle service worker updates
  private handleServiceWorkerUpdate() {
    const newWorker = this.swRegistration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateAvailable();
        }
      });
    }
  }

  // Handle online event
  private handleOnline() {
    console.log('EnhancedPWA: Device came online');
    
    // Trigger background sync
    backgroundSync.forcSync().catch(console.error);
    
    // Update critical data
    this.updateCriticalData();
    
    // Show notification
    this.showConnectionStatus('online');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-online'));
  }

  // Handle offline event
  private handleOffline() {
    console.log('EnhancedPWA: Device went offline');
    
    // Show notification
    this.showConnectionStatus('offline');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  }

  // Handle app visibility changes
  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // App came to foreground
      console.log('EnhancedPWA: App came to foreground');
      
      if (navigator.onLine) {
        // Sync data if online
        backgroundSync.forcSync().catch(console.error);
      }
      
      // Check for updates
      this.checkForUpdates();
    }
  }

  // Handle background sync events
  private handleBackgroundSyncEvent(event: CustomEvent) {
    const { type, data } = event.detail;
    
    switch (type) {
      case 'SYNC_SUCCESS':
        console.log('EnhancedPWA: Background sync successful');
        break;
      case 'SYNC_FAILED':
        console.log('EnhancedPWA: Background sync failed:', data);
        break;
    }
  }

  // Public API methods

  // Install PWA
  async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('EnhancedPWA: User accepted install prompt');
        this.trackEvent('pwa_install_accepted');
        return true;
      } else {
        console.log('EnhancedPWA: User dismissed install prompt');
        this.trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('EnhancedPWA: Install failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      const permission = await notificationManager.requestPermission();
      this.trackEvent('notification_permission_requested', { permission });
      return permission;
    } catch (error) {
      console.error('EnhancedPWA: Failed to request notification permission:', error);
      throw error;
    }
  }

  // Enable camera access for QR scanning
  async enableCameraAccess(): Promise<MediaStream | null> {
    if (!this.capabilities.cameraAccess) {
      throw new Error('Camera access not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      
      this.trackEvent('camera_access_granted');
      return stream;
    } catch (error) {
      console.error('EnhancedPWA: Camera access denied:', error);
      this.trackEvent('camera_access_denied');
      throw error;
    }
  }

  // Get PWA status
  async getStatus(): Promise<PWAStatus> {
    const syncStatus = backgroundSync.getSyncStatus();
    const cacheSize = await offlineStorage.getCacheSize();
    
    return {
      isInstalled: this.isInstalled(),
      isOnline: navigator.onLine,
      notificationPermission: notificationManager.getPermissionStatus(),
      syncQueueLength: syncStatus.queueLength,
      cacheSize,
      lastSyncTime: await this.getLastSyncTime()
    };
  }

  // Get capabilities
  getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Clear all app data
  async clearAllData(): Promise<void> {
    try {
      // Clear cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear IndexedDB
      await offlineStorage.clear('events');
      await offlineStorage.clear('orders');
      await offlineStorage.clear('tickets');
      await offlineStorage.clear('failed-requests');
      await offlineStorage.clear('user-preferences');
      
      // Clear localStorage
      localStorage.clear();
      
      console.log('EnhancedPWA: All data cleared');
      this.trackEvent('data_cleared');
    } catch (error) {
      console.error('EnhancedPWA: Failed to clear data:', error);
      throw error;
    }
  }

  // Preload critical data
  async preloadCriticalData(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      console.log('EnhancedPWA: Preloading critical data...');
      
      // Preload events
      const eventsResponse = await fetch('/api/events?limit=50');
      if (eventsResponse.ok) {
        const events = await eventsResponse.json();
        for (const event of events) {
          await offlineStorage.cacheEvent(event);
        }
      }
      
      // Preload user tickets if authenticated
      const token = localStorage.getItem('accessToken');
      if (token) {
        const ticketsResponse = await fetch('/api/tickets/my-tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ticketsResponse.ok) {
          const tickets = await ticketsResponse.json();
          for (const ticket of tickets) {
            await offlineStorage.cacheTicket(ticket);
          }
        }
        
        // Preload orders
        const ordersResponse = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersResponse.ok) {
          const orders = await ordersResponse.json();
          for (const order of orders) {
            await offlineStorage.cacheOrder(order);
          }
        }
      }
      
      console.log('EnhancedPWA: Critical data preloaded');
    } catch (error) {
      console.error('EnhancedPWA: Failed to preload critical data:', error);
    }
  }

  // Private helper methods

  private async updateCriticalData(): Promise<void> {
    // Only update if user is authenticated and has used the app recently
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity || Date.now() - parseInt(lastActivity) > 24 * 60 * 60 * 1000) {
      return;
    }
    
    await this.preloadCriticalData();
  }

  private async getLastSyncTime(): Promise<Date | undefined> {
    try {
      const timestamp = await offlineStorage.getUserPreference<number>('lastSyncTime');
      return timestamp ? new Date(timestamp) : undefined;
    } catch {
      return undefined;
    }
  }

  private async ensureNotificationSubscription(): Promise<void> {
    const { subscribed } = await notificationManager.getSubscriptionStatus();
    if (!subscribed) {
      // Try to resubscribe
      await notificationManager.requestPermission();
    }
  }

  private showInstallPrompt(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private hideInstallPrompt(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private showUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private showConnectionStatus(status: 'online' | 'offline'): void {
    const message = status === 'online' 
      ? 'You\'re back online! Syncing your data...'
      : 'You\'re offline. Don\'t worry, your data is safely cached.';
      
    window.dispatchEvent(new CustomEvent('pwa-notification', {
      detail: {
        type: status === 'online' ? 'success' : 'warning',
        message
      }
    }));
  }

  private async checkForUpdates(): Promise<void> {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.error('EnhancedPWA: Update check failed:', error);
      }
    }
  }

  private trackEvent(event: string, data?: any): void {
    // Track PWA events for analytics
    console.log(`EnhancedPWA Event: ${event}`, data);
    
    // In production, send to analytics service
    window.dispatchEvent(new CustomEvent('pwa-analytics', {
      detail: { event, data, timestamp: Date.now() }
    }));
  }

  // Kenya-specific optimizations

  // Optimize for slow networks common in Kenya
  async optimizeForSlowNetwork(): Promise<void> {
    // Reduce image quality in cache
    await offlineStorage.setUserPreference('imageQuality', 'low');
    
    // Enable aggressive caching
    await offlineStorage.setUserPreference('aggressiveCaching', true);
    
    // Prioritize text content over images
    await offlineStorage.setUserPreference('prioritizeText', true);
    
    console.log('EnhancedPWA: Optimized for slow network');
  }

  // Setup for Kenyan users
  async setupForKenya(): Promise<void> {
    // Set timezone
    await offlineStorage.setUserPreference('timezone', 'Africa/Nairobi');
    
    // Set currency
    await offlineStorage.setUserPreference('currency', 'KES');
    
    // Enable M-Pesa notifications
    await offlineStorage.setUserPreference('mpesaNotifications', true);
    
    // Setup event reminders in appropriate timezone
    await offlineStorage.setUserPreference('reminderTimezone', 'Africa/Nairobi');
    
    console.log('EnhancedPWA: Configured for Kenya');
  }

  // Backup data to cloud (for premium users)
  async backupData(): Promise<string> {
    try {
      const data = await offlineStorage.exportData();
      
      // In production, upload to cloud storage
      const backup = {
        timestamp: Date.now(),
        version: '1.0.0',
        data: JSON.parse(data)
      };
      
      return JSON.stringify(backup);
    } catch (error) {
      console.error('EnhancedPWA: Backup failed:', error);
      throw error;
    }
  }

  // Restore data from backup
  async restoreData(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData);
      await offlineStorage.importData(JSON.stringify(backup.data));
      
      console.log('EnhancedPWA: Data restored successfully');
      this.trackEvent('data_restored');
    } catch (error) {
      console.error('EnhancedPWA: Restore failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedPWA = EnhancedPWAManager.getInstance();

// Utility functions for PWA features
export const PWAUtils = {
  // Check if device is likely mobile
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if device supports PWA features well
  isPWACompatible(): boolean {
    const capabilities = enhancedPWA.getCapabilities();
    return capabilities.serviceWorker && capabilities.offlineStorage;
  },

  // Get device info for optimization
  getDeviceInfo(): {
    type: 'mobile' | 'tablet' | 'desktop';
    memory?: number;
    connection?: string;
    platform: string;
  } {
    const userAgent = navigator.userAgent;
    const nav = navigator as any;
    
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone/i.test(userAgent)) {
      type = 'mobile';
    } else if (/iPad|Tablet/i.test(userAgent)) {
      type = 'tablet';
    }
    
    return {
      type,
      memory: nav.deviceMemory,
      connection: nav.connection?.effectiveType,
      platform: navigator.platform
    };
  },

  // Estimate optimal cache size for device
  getOptimalCacheSize(): number {
    const device = this.getDeviceInfo();
    const baseSize = 50 * 1024 * 1024; // 50MB base
    
    if (device.memory) {
      if (device.memory >= 8) return 200 * 1024 * 1024; // 200MB
      if (device.memory >= 4) return 100 * 1024 * 1024; // 100MB
      if (device.memory >= 2) return 75 * 1024 * 1024;  // 75MB
    }
    
    return baseSize;
  },

  // Format bytes for display
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
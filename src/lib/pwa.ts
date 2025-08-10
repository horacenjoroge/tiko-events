// src/lib/pwa.ts - PWA Service Management
export class PWAManager {
    private static instance: PWAManager;
    private swRegistration: ServiceWorkerRegistration | null = null;
    private deferredPrompt: any = null;
  
    private constructor() {
      if (typeof window !== 'undefined') {
        this.initializePWA();
      }
    }
  
    static getInstance(): PWAManager {
      if (!PWAManager.instance) {
        PWAManager.instance = new PWAManager();
      }
      return PWAManager.instance;
    }
  
    private async initializePWA() {
      // Register service worker
      await this.registerServiceWorker();
      
      // Listen for install prompt
      this.setupInstallPrompt();
      
      // Setup offline detection
      this.setupOfflineDetection();
      
      // Initialize background sync
      this.setupBackgroundSync();
    }
  
    private async registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          this.swRegistration = registration;
          
          console.log('SW registered: ', registration);
          
          // Listen for SW updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New SW is available
                  this.showUpdateAvailable();
                }
              });
            }
          });
          
        } catch (error) {
          console.log('SW registration failed: ', error);
        }
      }
    }
  
    private setupInstallPrompt() {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallBanner();
      });
  
      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        this.hideInstallBanner();
        this.deferredPrompt = null;
      });
    }
  
    private setupOfflineDetection() {
      window.addEventListener('online', () => {
        this.showNotification('You are back online!', 'success');
        this.syncOfflineData();
      });
  
      window.addEventListener('offline', () => {
        this.showNotification('You are offline. Some features may be limited.', 'warning');
      });
    }
  
    private setupBackgroundSync() {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        // Background sync is supported
        console.log('Background sync is supported');
      }
    }
  
    // Install PWA
    async installPWA(): Promise<boolean> {
      if (!this.deferredPrompt) {
        return false;
      }
  
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    }
  
    // Check if app is installed
    isInstalled(): boolean {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    }
  
    // Show install banner
    private showInstallBanner() {
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    }
  
    private hideInstallBanner() {
      window.dispatchEvent(new CustomEvent('pwa-install-completed'));
    }
  
    // Show update notification
    private showUpdateAvailable() {
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    }
  
    // Update service worker
    async updateServiceWorker() {
      if (this.swRegistration && this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  
    // Cache management
    async clearCache(): Promise<void> {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    }
  
    // Get cache size
    async getCacheSize(): Promise<number> {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    }
  
    // Sync offline data
    private async syncOfflineData() {
      // Get offline data from IndexedDB and sync with server
      try {
        const offlineOrders = await this.getOfflineData('orders');
        const offlineCart = await this.getOfflineData('cart');
        
        // Sync with server
        if (offlineOrders.length > 0) {
          // Process offline orders
          console.log('Syncing offline orders:', offlineOrders);
        }
        
        if (offlineCart.length > 0) {
          // Sync cart items
          console.log('Syncing offline cart:', offlineCart);
        }
      } catch (error) {
        console.error('Failed to sync offline data:', error);
      }
    }
  
    // IndexedDB operations
    private async getOfflineData(storeName: string): Promise<any[]> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('TiKoOfflineDB', 1);
        
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result || []);
          };
          
          getAllRequest.onerror = () => {
            reject(getAllRequest.error);
          };
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  
    // Notification helper
    private showNotification(message: string, type: 'success' | 'warning' | 'error') {
      window.dispatchEvent(new CustomEvent('pwa-notification', {
        detail: { message, type }
      }));
    }
  }
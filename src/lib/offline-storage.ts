// src/lib/offline-storage.ts - IndexedDB for Offline Data Management
export interface OfflineStorageConfig {
    dbName: string;
    version: number;
    stores: StoreConfig[];
  }
  
  export interface StoreConfig {
    name: string;
    keyPath: string;
    autoIncrement?: boolean;
    indices?: IndexConfig[];
  }
  
  export interface IndexConfig {
    name: string;
    keyPath: string;
    unique?: boolean;
  }
  
  export interface StoredEvent {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    venue: any;
    category: any;
    ticketTypes: any[];
    imageUrl?: string;
    status: string;
    cachedAt: number;
    syncStatus: 'synced' | 'pending' | 'failed';
  }
  
  export interface StoredOrder {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    items: any[];
    payments: any[];
    createdAt: string;
    cachedAt: number;
    syncStatus: 'synced' | 'pending' | 'failed';
  }
  
  export interface StoredTicket {
    id: string;
    orderId: string;
    eventId: string;
    eventTitle: string;
    ticketType: string;
    qrCode: string;
    status: string;
    seatInfo?: string;
    cachedAt: number;
    syncStatus: 'synced' | 'pending' | 'failed';
  }
  
  export interface FailedRequest {
    id?: number;
    url: string;
    method: string;
    headers: [string, string][];
    body?: string;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
  }
  
  export interface UserPreference {
    key: string;
    value: any;
    timestamp: number;
  }
  
  export class OfflineStorage {
    private static instance: OfflineStorage;
    private db: IDBDatabase | null = null;
    private readonly config: OfflineStorageConfig = {
      dbName: 'TiKoOfflineDB',
      version: 2,
      stores: [
        {
          name: 'events',
          keyPath: 'id',
          indices: [
            { name: 'category', keyPath: 'category.id' },
            { name: 'status', keyPath: 'status' },
            { name: 'startDate', keyPath: 'startDate' },
            { name: 'cachedAt', keyPath: 'cachedAt' },
            { name: 'syncStatus', keyPath: 'syncStatus' }
          ]
        },
        {
          name: 'orders',
          keyPath: 'id',
          indices: [
            { name: 'orderNumber', keyPath: 'orderNumber', unique: true },
            { name: 'status', keyPath: 'status' },
            { name: 'createdAt', keyPath: 'createdAt' },
            { name: 'syncStatus', keyPath: 'syncStatus' }
          ]
        },
        {
          name: 'tickets',
          keyPath: 'id',
          indices: [
            { name: 'orderId', keyPath: 'orderId' },
            { name: 'eventId', keyPath: 'eventId' },
            { name: 'status', keyPath: 'status' },
            { name: 'syncStatus', keyPath: 'syncStatus' }
          ]
        },
        {
          name: 'failed-requests',
          keyPath: 'id',
          autoIncrement: true,
          indices: [
            { name: 'timestamp', keyPath: 'timestamp' },
            { name: 'method', keyPath: 'method' },
            { name: 'retryCount', keyPath: 'retryCount' }
          ]
        },
        {
          name: 'user-preferences',
          keyPath: 'key',
          indices: [
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        },
        {
          name: 'cart-items',
          keyPath: 'id',
          indices: [
            { name: 'ticketTypeId', keyPath: 'ticketTypeId' },
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        }
      ]
    };
  
    private constructor() {}
  
    static getInstance(): OfflineStorage {
      if (!OfflineStorage.instance) {
        OfflineStorage.instance = new OfflineStorage();
      }
      return OfflineStorage.instance;
    }
  
    // Initialize database
    async initialize(): Promise<void> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.config.dbName, this.config.version);
  
        request.onerror = () => {
          reject(new Error(`Failed to open database: ${request.error?.message}`));
        };
  
        request.onsuccess = () => {
          this.db = request.result;
          console.log('OfflineStorage: Database initialized successfully');
          resolve();
        };
  
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          this.createStores(db);
        };
      });
    }
  
    // Create object stores and indices
    private createStores(db: IDBDatabase): void {
      this.config.stores.forEach(storeConfig => {
        let store: IDBObjectStore;
  
        if (db.objectStoreNames.contains(storeConfig.name)) {
          // Delete existing store if upgrading
          db.deleteObjectStore(storeConfig.name);
        }
  
        // Create store
        store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement || false
        });
  
        // Create indices
        if (storeConfig.indices) {
          storeConfig.indices.forEach(indexConfig => {
            store.createIndex(indexConfig.name, indexConfig.keyPath, {
              unique: indexConfig.unique || false
            });
          });
        }
  
        console.log(`OfflineStorage: Created store '${storeConfig.name}'`);
      });
    }
  
    // Generic CRUD operations
    async get<T>(storeName: string, key: string): Promise<T | null> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
  
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }
  
    async getAll<T>(storeName: string): Promise<T[]> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
  
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  
    async put(storeName: string, data: any): Promise<void> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
  
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async delete(storeName: string, key: string): Promise<void> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
  
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async clear(storeName: string): Promise<void> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
  
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    // Query by index
    async getByIndex<T>(
      storeName: string, 
      indexName: string, 
      value: any
    ): Promise<T[]> {
      if (!this.db) await this.initialize();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
  
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
  
    // Event-specific methods
    async cacheEvent(event: any): Promise<void> {
      const storedEvent: StoredEvent = {
        ...event,
        cachedAt: Date.now(),
        syncStatus: 'synced'
      };
      
      await this.put('events', storedEvent);
      console.log(`OfflineStorage: Cached event ${event.id}`);
    }
  
    async getCachedEvents(): Promise<StoredEvent[]> {
      return this.getAll<StoredEvent>('events');
    }
  
    async getEventsByCategory(categoryId: string): Promise<StoredEvent[]> {
      return this.getByIndex<StoredEvent>('events', 'category', categoryId);
    }
  
    async searchCachedEvents(query: string): Promise<StoredEvent[]> {
      const events = await this.getCachedEvents();
      const lowerQuery = query.toLowerCase();
      
      return events.filter(event => 
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.venue.name.toLowerCase().includes(lowerQuery)
      );
    }
  
    // Order-specific methods
    async cacheOrder(order: any): Promise<void> {
      const storedOrder: StoredOrder = {
        ...order,
        cachedAt: Date.now(),
        syncStatus: 'synced'
      };
      
      await this.put('orders', storedOrder);
      console.log(`OfflineStorage: Cached order ${order.id}`);
    }
  
    async getCachedOrders(): Promise<StoredOrder[]> {
      return this.getAll<StoredOrder>('orders');
    }
  
    async getOrderByNumber(orderNumber: string): Promise<StoredOrder | null> {
      const orders = await this.getByIndex<StoredOrder>('orders', 'orderNumber', orderNumber);
      return orders[0] || null;
    }
  
    // Ticket-specific methods
    async cacheTicket(ticket: any): Promise<void> {
      const storedTicket: StoredTicket = {
        ...ticket,
        cachedAt: Date.now(),
        syncStatus: 'synced'
      };
      
      await this.put('tickets', storedTicket);
      console.log(`OfflineStorage: Cached ticket ${ticket.id}`);
    }
  
    async getCachedTickets(): Promise<StoredTicket[]> {
      return this.getAll<StoredTicket>('tickets');
    }
  
    async getTicketsByOrder(orderId: string): Promise<StoredTicket[]> {
      return this.getByIndex<StoredTicket>('tickets', 'orderId', orderId);
    }
  
    async getTicketsByEvent(eventId: string): Promise<StoredTicket[]> {
      return this.getByIndex<StoredTicket>('tickets', 'eventId', eventId);
    }
  
    // Failed request management
    async addFailedRequest(request: Omit<FailedRequest, 'id'>): Promise<void> {
      const failedRequest: FailedRequest = {
        ...request,
        retryCount: 0,
        maxRetries: 3
      };
      
      await this.put('failed-requests', failedRequest);
      console.log(`OfflineStorage: Stored failed request ${request.url}`);
    }
  
    async getFailedRequests(): Promise<FailedRequest[]> {
      return this.getAll<FailedRequest>('failed-requests');
    }
  
    async updateFailedRequest(id: number, updates: Partial<FailedRequest>): Promise<void> {
      const existing = await this.get<FailedRequest>('failed-requests', id.toString());
      if (existing) {
        await this.put('failed-requests', { ...existing, ...updates });
      }
    }
  
    async removeFailedRequest(id: number): Promise<void> {
      await this.delete('failed-requests', id.toString());
    }
  
    // User preferences
    async setUserPreference(key: string, value: any): Promise<void> {
      const preference: UserPreference = {
        key,
        value,
        timestamp: Date.now()
      };
      
      await this.put('user-preferences', preference);
    }
  
    async getUserPreference<T>(key: string): Promise<T | null> {
      const preference = await this.get<UserPreference>('user-preferences', key);
      return preference ? preference.value : null;
    }
  
    async getAllUserPreferences(): Promise<Record<string, any>> {
      const preferences = await this.getAll<UserPreference>('user-preferences');
      return preferences.reduce((acc, pref) => {
        acc[pref.key] = pref.value;
        return acc;
      }, {} as Record<string, any>);
    }
  
    // Cart management for offline usage
    async addToOfflineCart(item: any): Promise<void> {
      const cartItem = {
        ...item,
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        syncStatus: 'pending'
      };
      
      await this.put('cart-items', cartItem);
    }
  
    async getOfflineCart(): Promise<any[]> {
      return this.getAll('cart-items');
    }
  
    async clearOfflineCart(): Promise<void> {
      await this.clear('cart-items');
    }
  
    // Cache management
    async getCacheSize(): Promise<number> {
      if (!navigator.storage || !navigator.storage.estimate) {
        return 0;
      }
      
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
  
    async clearExpiredCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
      const cutoff = Date.now() - maxAge;
      
      // Clear expired events
      const events = await this.getCachedEvents();
      for (const event of events) {
        if (event.cachedAt < cutoff) {
          await this.delete('events', event.id);
        }
      }
      
      // Clear old failed requests
      const failedRequests = await this.getFailedRequests();
      for (const request of failedRequests) {
        if (request.timestamp < cutoff || request.retryCount >= request.maxRetries) {
          await this.removeFailedRequest(request.id!);
        }
      }
      
      console.log('OfflineStorage: Cleared expired cache');
    }
  
    // Sync status management
    async markForSync(storeName: string, id: string): Promise<void> {
      const item = await this.get(storeName, id);
      if (item) {
        item.syncStatus = 'pending';
        await this.put(storeName, item);
      }
    }
  
    async getPendingSyncItems(storeName: string): Promise<any[]> {
      return this.getByIndex(storeName, 'syncStatus', 'pending');
    }
  
    // Database info and debugging
    async getDatabaseInfo(): Promise<{
      name: string;
      version: number;
      size: number;
      stores: { name: string; count: number }[];
    }> {
      if (!this.db) await this.initialize();
      
      const stores = [];
      for (const storeConfig of this.config.stores) {
        const items = await this.getAll(storeConfig.name);
        stores.push({
          name: storeConfig.name,
          count: items.length
        });
      }
      
      const size = await this.getCacheSize();
      
      return {
        name: this.config.dbName,
        version: this.config.version,
        size,
        stores
      };
    }
  
    // Export/Import for backup
    async exportData(): Promise<string> {
      const data: Record<string, any[]> = {};
      
      for (const storeConfig of this.config.stores) {
        data[storeConfig.name] = await this.getAll(storeConfig.name);
      }
      
      return JSON.stringify(data, null, 2);
    }
  
    async importData(jsonData: string): Promise<void> {
      try {
        const data = JSON.parse(jsonData);
        
        for (const [storeName, items] of Object.entries(data)) {
          await this.clear(storeName);
          for (const item of items as any[]) {
            await this.put(storeName, item);
          }
        }
        
        console.log('OfflineStorage: Data imported successfully');
      } catch (error) {
        console.error('OfflineStorage: Failed to import data:', error);
        throw error;
      }
    }
  }
  
  // Export singleton instance
  export const offlineStorage = OfflineStorage.getInstance();
  
  // Utility functions
  export const OfflineUtils = {
    // Check if we're online
    isOnline(): boolean {
      return navigator.onLine;
    },
  
    // Wait for online connection
    waitForOnline(): Promise<void> {
      return new Promise((resolve) => {
        if (navigator.onLine) {
          resolve();
        } else {
          const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            resolve();
          };
          window.addEventListener('online', handleOnline);
        }
      });
    },
  
    // Debounce function for sync operations
    debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },
  
    // Calculate optimal cache size based on device
    getOptimalCacheSize(): number {
      // Start with 50MB base
      let cacheSize = 50 * 1024 * 1024;
      
      // Adjust based on device memory if available
      if ('memory' in navigator) {
        const deviceMemory = (navigator as any).memory;
        if (deviceMemory >= 8) {
          cacheSize = 200 * 1024 * 1024; // 200MB for high-end devices
        } else if (deviceMemory >= 4) {
          cacheSize = 100 * 1024 * 1024; // 100MB for mid-range
        }
      }
      
      return cacheSize;
    }
  };
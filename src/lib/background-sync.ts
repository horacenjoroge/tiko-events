// src/lib/background-sync.ts - Background Sync for Critical Operations
import { offlineStorage, FailedRequest } from './offline-storage';

export interface SyncOperation {
  id: string;
  type: 'order' | 'payment' | 'ticket' | 'cart' | 'user-preference';
  action: 'create' | 'update' | 'delete';
  data: any;
  endpoint: string;
  method: string;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
  timestamp: number;
  userId?: string;
}

export interface SyncResult {
  success: boolean;
  operation: SyncOperation;
  error?: string;
  response?: any;
}

export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private syncInProgress = false;
  private syncQueue: SyncOperation[] = [];
  private retryDelays = [1000, 5000, 15000, 30000, 60000]; // Progressive delays

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance; // ✅ Fixed: was "return results;"
  }

  private async initialize() {
    // Wait for service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
        console.log('BackgroundSync: Service worker ready');
        
        // Listen for sync events from service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        
        // Load pending operations from storage
        await this.loadPendingOperations();
        
        // Set up online/offline listeners
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Initial sync if online
        if (navigator.onLine) {
          this.scheduleSync();
        }
      } catch (error) {
        console.error('BackgroundSync: Failed to initialize:', error);
      }
    }
  }

  // Load pending operations from IndexedDB
  private async loadPendingOperations() {
    try {
      const failedRequests = await offlineStorage.getFailedRequests();
      this.syncQueue = failedRequests.map(this.convertFailedRequestToOperation);
      console.log(`BackgroundSync: Loaded ${this.syncQueue.length} pending operations`);
    } catch (error) {
      console.error('BackgroundSync: Failed to load pending operations:', error);
    }
  }

  // Convert failed request to sync operation
  private convertFailedRequestToOperation = (request: FailedRequest): SyncOperation => {
    return {
      id: request.id?.toString() || Date.now().toString(),
      type: this.inferOperationType(request.url),
      action: this.inferAction(request.method),
      data: request.body ? JSON.parse(request.body) : null,
      endpoint: request.url,
      method: request.method,
      priority: this.inferPriority(request.url),
      retryCount: request.retryCount,
      maxRetries: request.maxRetries,
      timestamp: request.timestamp
    };
  }

  // Infer operation type from URL
  private inferOperationType(url: string): SyncOperation['type'] {
    if (url.includes('/orders')) return 'order';
    if (url.includes('/payments')) return 'payment';
    if (url.includes('/tickets')) return 'ticket';
    if (url.includes('/cart')) return 'cart';
    if (url.includes('/users') || url.includes('/profile')) return 'user-preference';
    return 'order'; // Default
  }

  // Infer action from HTTP method
  private inferAction(method: string): SyncOperation['action'] {
    switch (method.toUpperCase()) {
      case 'POST': return 'create';
      case 'PUT':
      case 'PATCH': return 'update';
      case 'DELETE': return 'delete';
      default: return 'create';
    }
  }

  // Infer priority from URL
  private inferPriority(url: string): SyncOperation['priority'] {
    if (url.includes('/payments') || url.includes('/orders/create')) return 'high';
    if (url.includes('/orders') || url.includes('/tickets')) return 'medium';
    return 'low';
  }

  // Add operation to sync queue
  async addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.push(syncOperation);
    
    // Store in IndexedDB
    await this.storePendingOperation(syncOperation);
    
    console.log(`BackgroundSync: Added ${operation.type} operation to queue`);
    
    // Try immediate sync if online
    if (navigator.onLine && !this.syncInProgress) {
      this.scheduleSync();
    }
  }

  // Store pending operation in IndexedDB
  private async storePendingOperation(operation: SyncOperation) {
    try {
      const failedRequest: Omit<FailedRequest, 'id'> = {
        url: operation.endpoint,
        method: operation.method,
        headers: [['Content-Type', 'application/json']],
        body: operation.data ? JSON.stringify(operation.data) : undefined,
        timestamp: operation.timestamp,
        retryCount: operation.retryCount,
        maxRetries: operation.maxRetries
      };
      
      await offlineStorage.addFailedRequest(failedRequest);
    } catch (error) {
      console.error('BackgroundSync: Failed to store operation:', error);
    }
  }

  // Schedule background sync
  private scheduleSync(delay = 0) {
    setTimeout(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.performSync();
      }
    }, delay);
  }

  // Perform actual sync
  private async performSync(): Promise<SyncResult[]> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return [];
    }

    this.syncInProgress = true;
    const results: SyncResult[] = [];
    
    try {
      console.log(`BackgroundSync: Starting sync of ${this.syncQueue.length} operations`);
      
      // Sort by priority and timestamp
      const sortedQueue = [...this.syncQueue].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

      // Process operations
      for (const operation of sortedQueue) {
        try {
          const result = await this.executeOperation(operation);
          results.push(result);
          
          if (result.success) {
            // Remove from queue and storage
            this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
            await this.removePendingOperation(operation);
            
            // Notify app of successful sync
            this.notifyApp('SYNC_SUCCESS', { operation, result });
          } else {
            // Increment retry count
            operation.retryCount++;
            
            if (operation.retryCount >= operation.maxRetries) {
              // Max retries reached, remove from queue
              this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
              await this.removePendingOperation(operation);
              
              this.notifyApp('SYNC_FAILED', { operation, error: result.error });
            } else {
              // Update retry count in storage
              await this.updatePendingOperation(operation);
              
              // Schedule retry with exponential backoff
              const delay = this.retryDelays[Math.min(operation.retryCount - 1, this.retryDelays.length - 1)];
              this.scheduleSync(delay);
            }
          }
        } catch (error) {
          console.error(`BackgroundSync: Operation ${operation.id} failed:`, error);
          results.push({
            success: false,
            operation,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      console.log(`BackgroundSync: Completed sync. ${results.filter(r => r.success).length}/${results.length} successful`);
      
    } catch (error) {
      console.error('BackgroundSync: Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
    
    return results;
  }

  // Execute individual operation
  private async executeOperation(operation: SyncOperation): Promise<SyncResult> {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers,
        body: operation.data ? JSON.stringify(operation.data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle specific operation types
      await this.handleSuccessfulOperation(operation, responseData);
      
      return {
        success: true,
        operation,
        response: responseData
      };
      
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Handle successful operation (update local cache)
  private async handleSuccessfulOperation(operation: SyncOperation, response: any) {
    try {
      switch (operation.type) {
        case 'order':
          if (operation.action === 'create' && response.order) {
            await offlineStorage.cacheOrder(response.order);
            if (response.tickets) {
              for (const ticket of response.tickets) {
                await offlineStorage.cacheTicket(ticket);
              }
            }
          }
          break;
          
        case 'payment':
          // Update order with payment info
          if (response.orderId) {
            const order = await offlineStorage.get('orders', response.orderId);
            if (order) {
              order.payments = order.payments || [];
              order.payments.push(response);
              await offlineStorage.cacheOrder(order);
            }
          }
          break;
          
        case 'cart':
          if (operation.action === 'create') {
            await offlineStorage.addToOfflineCart(response);
          }
          break;
          
        case 'user-preference':
          if (operation.action === 'update' && operation.data) {
            for (const [key, value] of Object.entries(operation.data)) {
              await offlineStorage.setUserPreference(key, value);
            }
          }
          break;
      }
    } catch (error) {
      console.error('BackgroundSync: Failed to update local cache:', error);
    }
  }

  // Remove pending operation from storage
  private async removePendingOperation(operation: SyncOperation) {
    try {
      const failedRequests = await offlineStorage.getFailedRequests();
      const request = failedRequests.find(r => 
        r.url === operation.endpoint && 
        r.timestamp === operation.timestamp
      );
      
      if (request && request.id) {
        await offlineStorage.removeFailedRequest(request.id);
      }
    } catch (error) {
      console.error('BackgroundSync: Failed to remove operation from storage:', error);
    }
  }

  // Update pending operation in storage
  private async updatePendingOperation(operation: SyncOperation) {
    try {
      const failedRequests = await offlineStorage.getFailedRequests();
      const request = failedRequests.find(r => 
        r.url === operation.endpoint && 
        r.timestamp === operation.timestamp
      );
      
      if (request && request.id) {
        await offlineStorage.updateFailedRequest(request.id, {
          retryCount: operation.retryCount
        });
      }
    } catch (error) {
      console.error('BackgroundSync: Failed to update operation in storage:', error);
    }
  }

  // Notify app about sync events
  private notifyApp(type: string, data: any) {
    window.dispatchEvent(new CustomEvent('background-sync', {
      detail: { type, data }
    }));
  }

  // Handle online event
  private handleOnline() {
    console.log('BackgroundSync: Device came online, scheduling sync');
    this.scheduleSync(1000); // Delay slightly to ensure connection is stable
  }

  // Handle offline event
  private handleOffline() {
    console.log('BackgroundSync: Device went offline');
    this.syncInProgress = false;
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'SYNC_REQUEST':
        if (navigator.onLine) {
          this.scheduleSync();
        }
        break;
        
      case 'SYNC_SUCCESS':
        this.notifyApp('SW_SYNC_SUCCESS', data);
        break;
        
      case 'SYNC_FAILED':
        this.notifyApp('SW_SYNC_FAILED', data);
        break;
    }
  }

  // Public methods for specific operations

  // Queue order creation
  async queueOrderCreation(orderData: any): Promise<void> {
    await this.addOperation({
      type: 'order',
      action: 'create',
      data: orderData,
      endpoint: '/api/orders/create',
      method: 'POST',
      priority: 'high',
      maxRetries: 5
    });
  }

  // Queue payment
  async queuePayment(paymentData: any): Promise<void> {
    await this.addOperation({
      type: 'payment',
      action: 'create',
      data: paymentData,
      endpoint: '/api/payments',
      method: 'POST',
      priority: 'high',
      maxRetries: 5
    });
  }

  // Queue cart update
  async queueCartUpdate(cartData: any): Promise<void> {
    await this.addOperation({
      type: 'cart',
      action: 'update',
      data: cartData,
      endpoint: '/api/orders/cart',
      method: 'PUT',
      priority: 'medium',
      maxRetries: 3
    });
  }

  // Queue ticket update
  async queueTicketUpdate(ticketId: string, updateData: any): Promise<void> {
    await this.addOperation({
      type: 'ticket',
      action: 'update',
      data: updateData,
      endpoint: `/api/tickets/${ticketId}`,
      method: 'PATCH',
      priority: 'medium',
      maxRetries: 3
    });
  }

  // Queue user preferences update
  async queueUserPreferencesUpdate(preferences: any): Promise<void> {
    await this.addOperation({
      type: 'user-preference',
      action: 'update',
      data: preferences,
      endpoint: '/api/users/preferences',
      method: 'PATCH',
      priority: 'low',
      maxRetries: 2
    });
  }

  // Manual sync trigger
  async forcSync(): Promise<SyncResult[]> {
    if (navigator.onLine) {
      return this.performSync();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    queueLength: number;
    operations: SyncOperation[];
  } {
    return {
      isOnline: navigator.onLine,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      operations: [...this.syncQueue]
    };
  }

  // Clear all pending operations
  async clearQueue(): Promise<void> {
    this.syncQueue = [];
    await offlineStorage.clear('failed-requests');
    console.log('BackgroundSync: Queue cleared');
  }

  // Register for service worker background sync
  async registerBackgroundSync(tag = 'background-sync'): Promise<void> {
    if (this.swRegistration && 'sync' in this.swRegistration) {
      try {
        await this.swRegistration.sync.register(tag);
        console.log(`BackgroundSync: Registered for background sync with tag: ${tag}`);
      } catch (error) {
        console.error('BackgroundSync: Failed to register for background sync:', error);
      }
    }
  }

  // Get retry info for operation
  getRetryInfo(operationId: string): {
    retryCount: number;
    maxRetries: number;
    nextRetryIn?: number;
  } | null {
    const operation = this.syncQueue.find(op => op.id === operationId);
    if (!operation) return null;
    
    const result: any = {
      retryCount: operation.retryCount,
      maxRetries: operation.maxRetries
    };
    
    if (operation.retryCount < operation.maxRetries) {
      const delay = this.retryDelays[Math.min(operation.retryCount, this.retryDelays.length - 1)];
      result.nextRetryIn = delay;
    }
    
    return result;
  }
} // ✅ Fixed: Only one closing brace here

// Export singleton instance
export const backgroundSync = BackgroundSyncManager.getInstance();

// Utility functions for common sync operations
export const SyncUtils = {
  // Create optimistic response for immediate UI updates
  createOptimisticResponse(operation: SyncOperation): any {
    switch (operation.type) {
      case 'order':
        return {
          id: `temp-${Date.now()}`,
          ...operation.data,
          status: 'pending',
          isOptimistic: true
        };
        
      case 'payment':
        return {
          id: `temp-${Date.now()}`,
          ...operation.data,
          status: 'pending',
          isOptimistic: true
        };
        
      default:
        return { ...operation.data, isOptimistic: true };
    }
  },

  // Check if operation should be retried
  shouldRetry(operation: SyncOperation, error: string): boolean {
    // Don't retry client errors (4xx) except 408, 429
    if (error.includes('HTTP 4') && !error.includes('408') && !error.includes('429')) {
      return false;
    }
    
    // Don't retry if max retries reached
    if (operation.retryCount >= operation.maxRetries) {
      return false;
    }
    
    return true;
  },

  // Get human readable status
  getOperationStatus(operation: SyncOperation): string {
    if (operation.retryCount === 0) {
      return 'Pending';
    } else if (operation.retryCount < operation.maxRetries) {
      return `Retrying (${operation.retryCount}/${operation.maxRetries})`;
    } else {
      return 'Failed';
    }
  },

  // Estimate sync completion time
  estimateSyncTime(queueLength: number): number {
    // Rough estimate: 2 seconds per operation + network latency buffer
    return queueLength * 2000 + 5000;
  }
};
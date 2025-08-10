// src/lib/notifications.ts - Complete Push Notifications Manager
export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: any;
    actions?: NotificationAction[];
    requireInteraction?: boolean;
    silent?: boolean;
    timestamp?: number;
  }
  
  export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }
  
  export interface SubscriptionData {
    subscription: PushSubscription;
    userAgent: string;
    timestamp: number;
    userId?: string;
  }
  
  export class NotificationManager {
    private static instance: NotificationManager;
    private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY || '';
    private swRegistration: ServiceWorkerRegistration | null = null;
    private subscription: PushSubscription | null = null;
  
    private constructor() {
      if (typeof window !== 'undefined') {
        this.initialize();
      }
    }
  
    static getInstance(): NotificationManager {
      if (!NotificationManager.instance) {
        NotificationManager.instance = new NotificationManager();
      }
      return NotificationManager.instance;
    }
  
    private async initialize() {
      // Wait for service worker registration
      if ('serviceWorker' in navigator) {
        try {
          this.swRegistration = await navigator.serviceWorker.ready;
          console.log('Notification Manager: Service worker ready');
          
          // Check for existing subscription
          this.subscription = await this.swRegistration.pushManager.getSubscription();
          
          if (this.subscription) {
            console.log('Notification Manager: Existing subscription found');
            await this.sendSubscriptionToServer(this.subscription);
          }
        } catch (error) {
          console.error('Notification Manager: Failed to initialize:', error);
        }
      }
    }
  
    // Check if notifications are supported
    isSupported(): boolean {
      return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }
  
    // Get current permission status
    getPermissionStatus(): NotificationPermission {
      return Notification.permission;
    }
  
    // Request notification permission
    async requestPermission(): Promise<NotificationPermission> {
      if (!this.isSupported()) {
        throw new Error('Notifications are not supported in this browser');
      }
  
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPush();
      }
      
      return permission;
    }
  
    // Subscribe to push notifications
    private async subscribeToPush(): Promise<PushSubscription | null> {
      if (!this.swRegistration) {
        console.error('Service worker not registered');
        return null;
      }
  
      try {
        // Check if already subscribed
        const existingSubscription = await this.swRegistration.pushManager.getSubscription();
        
        if (existingSubscription) {
          this.subscription = existingSubscription;
          await this.sendSubscriptionToServer(existingSubscription);
          return existingSubscription;
        }
  
        // Create new subscription
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
  
        this.subscription = subscription;
  
        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
        
        console.log('Successfully subscribed to push notifications');
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return null;
      }
    }
  
    // Convert VAPID key to Uint8Array
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
  
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
  
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  
    // Send subscription to backend
    private async sendSubscriptionToServer(subscription: PushSubscription) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            userId: this.getCurrentUserId()
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to send subscription to server`);
        }
  
        console.log('Subscription sent to server successfully');
      } catch (error) {
        console.error('Error sending subscription to server:', error);
      }
    }
  
    // Get current user ID from localStorage or auth context
    private getCurrentUserId(): string | undefined {
      try {
        const userStr = localStorage.getItem('tiko_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.id;
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
      return undefined;
    }
  
    // Unsubscribe from push notifications
    async unsubscribe(): Promise<boolean> {
      if (!this.subscription) {
        return true;
      }
  
      try {
        const success = await this.subscription.unsubscribe();
        
        if (success) {
          // Notify server about unsubscription
          await this.notifyServerUnsubscribe();
          this.subscription = null;
          console.log('Successfully unsubscribed from push notifications');
        }
        
        return success;
      } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
        return false;
      }
    }
  
    // Notify server about unsubscription
    private async notifyServerUnsubscribe() {
      try {
        const token = localStorage.getItem('accessToken');
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            userId: this.getCurrentUserId(),
            timestamp: Date.now()
          })
        });
      } catch (error) {
        console.error('Failed to notify server about unsubscription:', error);
      }
    }
  
    // Show local notification
    async showNotification(payload: NotificationPayload): Promise<void> {
      if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }
  
      if (!this.swRegistration) {
        // Fallback to regular notification
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          badge: payload.badge || '/icons/badge-72x72.png',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: payload.requireInteraction || false,
          silent: payload.silent || false,
          timestamp: payload.timestamp || Date.now()
        });
        return;
      }
  
      // Use service worker for better control
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now()
      });
    }
  
    // Predefined notification types for TiKo
    async showOrderConfirmation(orderNumber: string, eventTitle: string) {
      await this.showNotification({
        title: '🎫 Order Confirmed!',
        body: `Your tickets for ${eventTitle} are ready. Order #${orderNumber}`,
        tag: `order-${orderNumber}`,
        data: { type: 'order-confirmation', orderNumber },
        actions: [
          { action: 'view-tickets', title: 'View Tickets', icon: '/icons/ticket-action.png' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true
      });
    }
  
    async showEventReminder(eventTitle: string, eventDate: string, timeUntil: string, eventId?: string) {
      await this.showNotification({
        title: `⏰ Event Reminder: ${eventTitle}`,
        body: `Your event starts ${timeUntil}. Don't forget your tickets!`,
        tag: `reminder-${eventTitle.replace(/\s+/g, '-').toLowerCase()}`,
        data: { type: 'event-reminder', eventTitle, eventDate, eventId },
        actions: [
          { action: 'show-tickets', title: 'Show Tickets' },
          { action: 'get-directions', title: 'Get Directions' },
          { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true
      });
    }
  
    async showPaymentUpdate(status: 'success' | 'failed', orderNumber: string) {
      const isSuccess = status === 'success';
      await this.showNotification({
        title: isSuccess ? '✅ Payment Successful' : '❌ Payment Failed',
        body: isSuccess 
          ? `Payment confirmed for order #${orderNumber}` 
          : `Payment failed for order #${orderNumber}. Please try again.`,
        tag: `payment-${orderNumber}`,
        data: { type: 'payment-update', status, orderNumber },
        actions: isSuccess 
          ? [{ action: 'view-order', title: 'View Order' }]
          : [{ action: 'retry-payment', title: 'Retry Payment' }],
        requireInteraction: !isSuccess
      });
    }
  
    async showNewEventAlert(eventTitle: string, category: string, eventId?: string) {
      await this.showNotification({
        title: `🎉 New ${category} Event!`,
        body: `${eventTitle} has been added. Check it out now!`,
        tag: `new-event-${eventId || eventTitle.replace(/\s+/g, '-').toLowerCase()}`,
        data: { type: 'new-event', eventTitle, category, eventId },
        actions: [
          { action: 'view-event', title: 'View Event' },
          { action: 'dismiss', title: 'Later' }
        ],
        image: '/icons/new-event-banner.png',
        requireInteraction: false
      });
    }
  
    async showLowStockAlert(eventTitle: string, ticketType: string, remaining: number) {
      await this.showNotification({
        title: `⚠️ Limited Tickets Remaining!`,
        body: `Only ${remaining} ${ticketType} tickets left for ${eventTitle}`,
        tag: `low-stock-${eventTitle.replace(/\s+/g, '-').toLowerCase()}`,
        data: { type: 'low-stock', eventTitle, ticketType, remaining },
        actions: [
          { action: 'book-now', title: 'Book Now' },
          { action: 'dismiss', title: 'Maybe Later' }
        ],
        requireInteraction: true
      });
    }
  
    async showEventCancellation(eventTitle: string, eventDate: string, orderNumber?: string) {
      await this.showNotification({
        title: `❌ Event Cancelled`,
        body: `${eventTitle} scheduled for ${eventDate} has been cancelled. You will receive a full refund.`,
        tag: `cancelled-${eventTitle.replace(/\s+/g, '-').toLowerCase()}`,
        data: { type: 'event-cancelled', eventTitle, eventDate, orderNumber },
        actions: [
          { action: 'view-refund', title: 'View Refund Status' },
          { action: 'browse-events', title: 'Browse Other Events' }
        ],
        requireInteraction: true
      });
    }
  
    async showTicketScanSuccess(eventTitle: string, ticketType: string) {
      await this.showNotification({
        title: `✅ Welcome to ${eventTitle}!`,
        body: `Your ${ticketType} ticket has been scanned successfully. Enjoy the event!`,
        tag: `scan-success-${Date.now()}`,
        data: { type: 'ticket-scan', eventTitle, ticketType },
        silent: false,
        requireInteraction: false
      });
    }
  
    // Schedule notification (for reminders)
    async scheduleEventReminder(eventTitle: string, eventDate: string, eventId: string, reminderTime: number) {
      // Calculate time until reminder
      const eventDateTime = new Date(eventDate).getTime();
      const reminderDateTime = eventDateTime - reminderTime;
      const now = Date.now();
      
      if (reminderDateTime <= now) {
        console.warn('Reminder time is in the past');
        return;
      }
  
      // Store reminder in IndexedDB for service worker to handle
      await this.storeScheduledNotification({
        id: `reminder-${eventId}-${reminderTime}`,
        eventTitle,
        eventDate,
        eventId,
        reminderTime: reminderDateTime,
        type: 'event-reminder'
      });
    }
  
    // Store scheduled notification in IndexedDB
    private async storeScheduledNotification(notification: any) {
      try {
        const db = await this.openDB();
        const transaction = db.transaction(['scheduled-notifications'], 'readwrite');
        const store = transaction.objectStore('scheduled-notifications');
        await store.put(notification);
        console.log('Scheduled notification stored:', notification.id);
      } catch (error) {
        console.error('Failed to store scheduled notification:', error);
      }
    }
  
    // Open IndexedDB
    private openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('TiKoNotificationsDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('scheduled-notifications')) {
            const store = db.createObjectStore('scheduled-notifications', { keyPath: 'id' });
            store.createIndex('reminderTime', 'reminderTime');
            store.createIndex('type', 'type');
          }
        };
      });
    }
  
    // Get subscription status
    getSubscriptionStatus(): Promise<{ subscribed: boolean; subscription: PushSubscription | null }> {
      return Promise.resolve({
        subscribed: !!this.subscription,
        subscription: this.subscription
      });
    }
  
    // Test notification (for debugging)
    async testNotification() {
      await this.showNotification({
        title: 'TiKo Test Notification',
        body: 'This is a test notification to verify everything is working correctly.',
        tag: 'test-notification',
        data: { type: 'test' },
        actions: [
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }
  
  // Export singleton instance
  export const notificationManager = NotificationManager.getInstance();
  
  // Utility functions for common notification patterns
  export const NotificationUtils = {
    // Format time until event
    formatTimeUntil(eventDate: string): string {
      const now = new Date();
      const event = new Date(eventDate);
      const diff = event.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return `in ${days} day${days !== 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
      } else if (minutes > 0) {
        return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        return 'now';
      }
    },
  
    // Get reminder times (in milliseconds before event)
    getReminderTimes() {
      return {
        oneWeek: 7 * 24 * 60 * 60 * 1000,      // 1 week
        threeDays: 3 * 24 * 60 * 60 * 1000,    // 3 days
        oneDay: 24 * 60 * 60 * 1000,           // 1 day
        twoHours: 2 * 60 * 60 * 1000,          // 2 hours
        thirtyMinutes: 30 * 60 * 1000           // 30 minutes
      };
    },
  
    // Check if user should receive notifications for category
    shouldNotifyForCategory(category: string, userPreferences: any): boolean {
      if (!userPreferences?.notifications?.categories) {
        return true; // Default to true if no preferences set
      }
      return userPreferences.notifications.categories[category] !== false;
    }
  };
// public/sw.js - TiKo Service Worker
const CACHE_NAME = 'tiko-v1.0.0';
const STATIC_CACHE = 'tiko-static-v1.0.0';
const DYNAMIC_CACHE = 'tiko-dynamic-v1.0.0';
const OFFLINE_CACHE = 'tiko-offline-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png'
];

// API endpoints to cache for offline access
const CACHE_API_ROUTES = [
  '/api/events',
  '/api/categories',
  '/api/venues',
  '/api/auth/me'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !cacheName.includes('v1.0.0');
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different request types
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - network first, cache fallback
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/_next/static/') || url.pathname.includes('.')) {
      // Static assets - cache first
      event.respondWith(handleStaticRequest(request));
    } else {
      // Navigation requests - network first, cache fallback
      event.respondWith(handleNavigationRequest(request));
    }
  } else {
    // POST/PUT/DELETE requests - handle with background sync
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleMutationRequest(request));
    }
  }
});

// Handle API requests (Network First)
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      
      // Only cache GET requests for cacheable routes
      if (CACHE_API_ROUTES.some(route => request.url.includes(route))) {
        cache.put(request, responseClone);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache for:', request.url);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder for failed static assets
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle navigation requests (Network First, Cache Fallback)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Handle mutation requests with background sync
async function handleMutationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Store failed requests for background sync
    await storeFailedRequest(request);
    
    // Return optimistic response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Request queued for when you\'re back online',
        queued: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    tag: data.tag,
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.notification.tag);
  event.notification.close();
  
  const data = event.notification.data;
  const action = event.action;
  
  event.waitUntil(
    handleNotificationClick(action, data)
  );
});

// Handle notification actions
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  // Define URL based on action and data
  let url = '/';
  
  switch (action) {
    case 'view-tickets':
      url = `/tickets?order=${data.orderNumber}`;
      break;
    case 'view-order':
      url = `/orders/${data.orderNumber}`;
      break;
    case 'show-tickets':
      url = `/tickets`;
      break;
    case 'get-directions':
      url = `/events/${data.eventId}`;
      break;
    case 'retry-payment':
      url = `/checkout?order=${data.orderNumber}`;
      break;
    default:
      if (data.type === 'order-confirmation') {
        url = `/orders/${data.orderNumber}`;
      } else if (data.type === 'event-reminder') {
        url = `/tickets`;
      }
  }
  
  // Focus existing window or open new one
  if (clients.length > 0) {
    const client = clients[0];
    await client.navigate(url);
    return client.focus();
  }
  
  return self.clients.openWindow(url);
}

// Store failed requests for background sync
async function storeFailedRequest(request) {
  const db = await openDB();
  const transaction = db.transaction(['failed-requests'], 'readwrite');
  const store = transaction.objectStore('failed-requests');
  
  const requestData = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: await request.text(),
    timestamp: Date.now()
  };
  
  await store.add(requestData);
}

// Sync failed requests when back online
async function syncFailedRequests() {
  const db = await openDB();
  const transaction = db.transaction(['failed-requests'], 'readwrite');
  const store = transaction.objectStore('failed-requests');
  const requests = await store.getAll();
  
  console.log(`SW: Syncing ${requests.length} failed requests`);
  
  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: new Headers(requestData.headers),
        body: requestData.body || undefined
      });
      
      if (response.ok) {
        // Request succeeded, remove from store
        await store.delete(requestData.id);
        console.log('SW: Successfully synced request:', requestData.url);
        
        // Notify app about successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            url: requestData.url
          });
        });
      }
    } catch (error) {
      console.log('SW: Failed to sync request:', requestData.url, error);
    }
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TiKoOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('failed-requests')) {
        const store = db.createObjectStore('failed-requests', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('offline-data')) {
        const store = db.createObjectStore('offline-data', { keyPath: 'key' });
        store.createIndex('type', 'type');
        store.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('user-preferences')) {
        db.createObjectStore('user-preferences', { keyPath: 'key' });
      }
    };
  });
}

// Message handling from main app
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_ROUTE':
      cacheRoute(data.url, data.cacheName || DYNAMIC_CACHE);
      break;
      
    case 'CLEAR_CACHE':
      clearSpecificCache(data.cacheName);
      break;
      
    case 'SYNC_NOW':
      self.registration.sync.register('background-sync');
      break;
  }
});

// Cache specific route
async function cacheRoute(url, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    await cache.add(url);
    console.log('SW: Cached route:', url);
  } catch (error) {
    console.log('SW: Failed to cache route:', url, error);
  }
}

// Clear specific cache
async function clearSpecificCache(cacheName) {
  try {
    await caches.delete(cacheName);
    console.log('SW: Cleared cache:', cacheName);
  } catch (error) {
    console.log('SW: Failed to clear cache:', cacheName, error);
  }
}
/**
 * Service Worker for Sunshine Restaurant
 * Provides offline caching, performance optimization, and push notifications
 */

const CACHE_NAME = 'sunshine-restaurant-v1';
const STATIC_CACHE_NAME = 'sunshine-static-v1';
const DYNAMIC_CACHE_NAME = 'sunshine-dynamic-v1';
const IMAGE_CACHE_NAME = 'sunshine-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/menu',
  '/cart',
  '/whatsapp',
  '/textures/wood-background.jpg',
  '/favicon.ico',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/api/',
  '/_next/static/chunks/',
];

// Cache-first resources (static assets)
const CACHE_FIRST = [
  '/_next/static/',
  '/textures/',
  '/images/',
  '/icons/',
];

// Stale-while-revalidate resources
const STALE_WHILE_REVALIDATE = [
  '/menu',
  '/',
];

self.addEventListener('install', (event) => {
  console.log('SW: Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME &&
                     cacheName !== DYNAMIC_CACHE_NAME &&
                     cacheName !== IMAGE_CACHE_NAME;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  // Skip Convex API requests (they have their own caching)
  if (url.hostname.includes('convex.cloud')) return;
  
  // Handle different caching strategies
  if (shouldUseNetworkFirst(url)) {
    event.respondWith(networkFirst(request));
  } else if (shouldUseCacheFirst(url)) {
    event.respondWith(cacheFirst(request));
  } else if (shouldUseStaleWhileRevalidate(url)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheImages(request));
  } else {
    event.respondWith(networkWithFallback(request));
  }
});

// Network first strategy (for API calls and dynamic content)
async function networkFirst(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Failed to fetch:', request.url);
    throw error;
  }
}

// Stale while revalidate (for pages that can be stale)
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE_NAME);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });
  
  return cachedResponse || networkResponsePromise;
}

// Image caching with compression
async function cacheImages(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      
      // Only cache successful responses
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Failed to fetch image:', request.url);
    // Return placeholder image for failed image requests
    return caches.match('/images/placeholder.jpg') || 
           new Response('', { status: 404 });
  }
}

// Network with cache fallback
async function networkWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline') || 
             new Response('App is offline', { 
               status: 503, 
               statusText: 'Service Unavailable' 
             });
    }
    
    throw error;
  }
}

// Helper functions
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.pathname.startsWith(pattern));
}

function shouldUseCacheFirst(url) {
  return CACHE_FIRST.some(pattern => url.pathname.startsWith(pattern));
}

function shouldUseStaleWhileRevalidate(url) {
  return STALE_WHILE_REVALIDATE.some(pattern => url.pathname === pattern);
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('SW: Handling background sync');
  // Handle offline cart additions, form submissions, etc.
  // This would integrate with your app's offline queue
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: data.url,
        actions: [
          {
            action: 'open',
            title: 'Open App'
          },
          {
            action: 'close',
            title: 'Close'
          }
        ]
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'menu-update') {
    event.waitUntil(updateMenuCache());
  }
});

async function updateMenuCache() {
  console.log('SW: Updating menu cache in background');
  try {
    const response = await fetch('/api/meals');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put('/api/meals', response);
    }
  } catch (error) {
    console.log('SW: Failed to update menu cache:', error);
  }
}

// Message handling for communication with the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(CACHE_NAME);
  }
});

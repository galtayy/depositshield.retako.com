// Custom Service Worker for DepositShield

// API URL'ler
const API_URL_PROD = 'https://api.depositshield.retako.com';
const API_URL_DEV = 'http://localhost:5050';

// Cache name definitions
const CACHE_NAME = 'depositshield-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/images/logo.png'
];

// Installation event handler
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing Service Worker...');
  self.skipWaiting();
  
  // Precache static assets
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activation event handler
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating Service Worker...');
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API isteklerini özel olarak işle
  if (url.pathname.startsWith('/api/')) {
    console.log('[ServiceWorker] API Request:', url.pathname);
    handleApiRequest(event);
    return;
  }
  
  // API istekleri dışındaki istekler için network-first stratejisi
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı yanıtı klonla ve cache'e kaydet
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Çevrimdışı durumda cache'den yanıt ver
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match('/offline.html');
        });
      })
  );
});

// API isteklerini işleyen fonksiyon
function handleApiRequest(event) {
  const url = new URL(event.request.url);
  
  // Hostname'e göre doğru API URL'sini belirle
  const isLocalhost = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
  const apiBaseUrl = isLocalhost ? API_URL_DEV : API_URL_PROD;
  
  // URL yolunu ayarla (baştaki /api/ kısmını kalıyor)
  const apiPath = url.pathname;
  const apiUrl = `${apiBaseUrl}${apiPath}`;
  
  // Orijinal isteğin başlıklarını ve method'unu kullanarak yeni bir istek oluştur
  const apiRequest = new Request(apiUrl, {
    method: event.request.method,
    headers: event.request.headers,
    body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.clone().body : undefined,
    mode: 'cors',
    credentials: 'include',
    redirect: 'follow'
  });
  
  console.log(`[ServiceWorker] Redirecting API request to: ${apiUrl}`);
  
  event.respondWith(
    fetch(apiRequest)
      .then(response => {
        // Başarılı yanıtı döndür
        console.log(`[ServiceWorker] API Response status:`, response.status);
        return response;
      })
      .catch(error => {
        console.error(`[ServiceWorker] API Fetch Error:`, error);
        
        // Çevrimdışı durumda API isteği için boş yanıt döndür
        return new Response(JSON.stringify({
          error: true, 
          message: 'You are offline. Please check your connection.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
}

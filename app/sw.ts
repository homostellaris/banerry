/// <reference lib="webworker" />

const CACHE_NAME = 'gestalt-v1'
const STATIC_ASSETS = [
	'/',
	'/learner/1',
	'/manifest.json',
	'/icon-192x192.png',
	'/icon-512x512.png',
]

declare const self: ServiceWorkerGlobalScope

// Install event
self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			return cache.addAll(STATIC_ASSETS)
		}),
	)
	self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName)
					}
				}),
			)
		}),
	)
	self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event: FetchEvent) => {
	// Only handle GET requests
	if (event.request.method !== 'GET') return

	event.respondWith(
		caches
			.match(event.request)
			.then(response => {
				// Return cached version or fetch from network
				return (
					response ||
					fetch(event.request).then(fetchResponse => {
						// Cache successful responses
						if (fetchResponse.status === 200) {
							const responseClone = fetchResponse.clone()
							caches.open(CACHE_NAME).then(cache => {
								cache.put(event.request, responseClone)
							})
						}
						return fetchResponse
					})
				)
			})
			.catch(() => {
				// Return offline page for navigation requests
				if (event.request.mode === 'navigate') {
					return caches.match('/')
				}
			}),
	)
})

// Service Worker custom pour gérer les mises à jour
// Ce fichier doit être placé dans public/ et enregistré avant le SW généré par Workbox

const CACHE_NAME = 'yamohub-v1'
const VERSION_URL = '/api/version' // À créer si nécessaire

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  self.skipWaiting() // Activate immédiatement
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  event.waitUntil(
    clients.claim() // Prendre le contrôle de tous les clients immédiatement
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting, activating new version')
    self.skipWaiting()
  }
})

// Vérifier les mises à jour en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates())
  }
})

async function checkForUpdates() {
  try {
    // Vérifier si une nouvelle version est disponible
    const response = await fetch('/api/version', { cache: 'no-store' })
    const data = await response.json()
    
    // Notifier les clients qu'une mise à jour est disponible
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: data.version,
      })
    })
  } catch (error) {
    console.error('[SW] Error checking for updates:', error)
  }
}

// Envoyer un signal de mise à jour disponible aux clients
async function notifyClients(message) {
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage(message)
  })
}

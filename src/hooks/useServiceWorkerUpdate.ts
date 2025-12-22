'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UpdateAvailableEvent extends ExtendableEvent {
  waitUntil(promise: Promise<void>): void
}

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [installing, setInstalling] = useState(false)
  const swRef = useRef<ServiceWorkerContainer | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    swRef.current = navigator.serviceWorker

    // Listener pour les mises à jour disponibles
    const handleControllerChange = () => {
      console.log('New service worker activated, page will reload')
      // Recharger la page pour appliquer les nouvelles modifications
      window.location.reload()
    }

    // Écouter quand un nouveau service worker est prêt à être activé
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_AVAILABLE') {
        console.log('Update available:', event.data)
        setUpdateAvailable(true)
      }
    }

    swRef.current.addEventListener('controllerchange', handleControllerChange)
    swRef.current.addEventListener('message', handleMessage)

    // Vérifier les mises à jour périodiquement (toutes les heures)
    const updateCheckInterval = setInterval(() => {
      if (swRef.current?.controller) {
        swRef.current.update().catch((err: any) => {
          console.error('Error checking for updates:', err)
        })
      }
    }, 60 * 60 * 1000) // 1 heure

    // Vérification initiale au montage
    if (swRef.current?.controller) {
      swRef.current.update().catch((err: any) => {
        console.error('Error during initial update check:', err)
      })
    }

    return () => {
      clearInterval(updateCheckInterval)
      swRef.current?.removeEventListener('controllerchange', handleControllerChange)
      swRef.current?.removeEventListener('message', handleMessage)
    }
  }, [])

  const skipWaiting = useCallback(() => {
    setInstalling(true)
    if (swRef.current?.controller) {
      // Envoyer un message au service worker pour qu'il sautez l'étape d'attente
      const pendingSW = swRef.current.controller
      pendingSW.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [])

  return {
    updateAvailable,
    installing,
    skipWaiting,
  }
}

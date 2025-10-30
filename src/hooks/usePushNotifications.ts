'use client'

import { useEffect, useState, useCallback } from 'react'
import apiClient from '@/lib/axios'

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface BrowserPushSubscription extends PushSubscription {
  toJSON(): PushSubscriptionData
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<BrowserPushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      // Register our dedicated push notification service worker
      const registration = await navigator.serviceWorker.register('/push-sw.js', {
        scope: '/push-notifications/' // Use a specific scope to avoid conflicts with PWA
      })
      
      // Wait for our specific service worker to be ready
      await registration.update() // Force check for updates
      
      // Check for existing subscription with our specific registration
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        setSubscription(existingSubscription as BrowserPushSubscription)
        setIsSubscribed(true)
      } else {
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('Push notification service worker registration failed:', error)
      setIsSubscribed(false)
    }
  }

  const subscribeToPush = async () => {
    try {
      console.log('usePushNotifications: Starting subscribeToPush...')
      console.log('usePushNotifications: Environment check - VAPID key exists:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      
      // Get our dedicated push notification service worker
      let registration = await navigator.serviceWorker.getRegistration('/push-notifications/')
      console.log('usePushNotifications: Initial registration check:', registration)
      
      if (!registration) {
        console.log('usePushNotifications: No push notification service worker found, registering...')
        await registerServiceWorker()
        registration = await navigator.serviceWorker.getRegistration('/push-notifications/')
        console.log('usePushNotifications: Registration after registerServiceWorker:', registration)
      }
      
      if (!registration) {
        throw new Error('Failed to register push notification service worker')
      }
      
      // Wait for service worker to be ready - use our specific registration
      console.log('usePushNotifications: Waiting for service worker to be ready...')
      console.log('usePushNotifications: Registration state:', {
        installing: registration.installing?.state,
        waiting: registration.waiting?.state,
        active: registration.active?.state,
        scope: registration.scope
      })
      
      // Check if push manager is available immediately
      if (registration.pushManager) {
        console.log('usePushNotifications: Push manager available immediately')
      } else {
        throw new Error('Push manager not available')
      }
      
      console.log('usePushNotifications: Service worker is ready, proceeding with subscription')
      
      console.log('usePushNotifications: Attempting to subscribe with VAPID key...')
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      })

      console.log('usePushNotifications: Push subscription successful:', subscription)
      setSubscription(subscription as BrowserPushSubscription)
      setIsSubscribed(true)

      // Send subscription to your backend
      console.log('usePushNotifications: Sending subscription to backend...')
      await sendSubscriptionToBackend(subscription)
      console.log('usePushNotifications: Subscription sent to backend successfully')
      
      // Refresh subscription status to ensure state is consistent
      console.log('usePushNotifications: Refreshing subscription status after successful subscription...')
      setTimeout(() => refreshSubscriptionStatus(), 100) // Small delay to ensure state is updated
      
      return subscription
    } catch (error) {
      console.error('usePushNotifications: Failed to subscribe to push notifications:', error)
      console.error('usePushNotifications: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        vapidKeyExists: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        isHttps: location.protocol === 'https:',
        userAgent: navigator.userAgent
      })
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe()
        setSubscription(null)
        setIsSubscribed(false)
        
        // Remove subscription from backend
        await removeSubscriptionFromBackend(subscription)
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      throw error
    }
  }

  const sendSubscriptionToBackend = async (subscription: PushSubscription) => {
    try {
      console.log('usePushNotifications: Starting sendSubscriptionToBackend...')
      // Convert subscription to JSON format to access keys
      const subscriptionJson = subscription.toJSON()
      
      console.log('usePushNotifications: Subscription JSON:', subscriptionJson)
      
      // Validate that we have the required keys
      if (!subscriptionJson.keys?.p256dh || !subscriptionJson.keys?.auth) {
        throw new Error('Invalid subscription: missing keys')
      }
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth,
        },
        userAgent: navigator.userAgent,
      }
      
      console.log('usePushNotifications: Sending subscription data to backend...', subscriptionData)
      
      const response = await apiClient.post('/notifications/subscribe', subscriptionData)
      
      console.log('usePushNotifications: Backend response:', response.data)
      return response.data
    } catch (error) {
      console.error('usePushNotifications: Failed to send subscription to backend:', error)
      console.error('usePushNotifications: Backend error details:', {
        message: error instanceof Error ? error.message : String(error),
        status: error && typeof error === 'object' && 'response' in error ? 
          (error.response as { status?: number })?.status : undefined,
        statusText: error && typeof error === 'object' && 'response' in error ? 
          (error.response as { statusText?: string })?.statusText : undefined,
        data: error && typeof error === 'object' && 'response' in error ? 
          (error.response as { data?: unknown })?.data : undefined
      })
      throw error
    }
  }

  const removeSubscriptionFromBackend = async (subscription: BrowserPushSubscription) => {
    try {
      const response = await apiClient.post('/notifications/unsubscribe', {
        endpoint: subscription.endpoint,
      })

      return response.data
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error)
      throw error
    }
  }

  // Function to refresh subscription status
  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      // Get the current registration
      const registration = await navigator.serviceWorker.getRegistration('/push-notifications/')
      if (!registration) {
        setIsSubscribed(false)
        setSubscription(null)
        return
      }

      // Check current subscription
      const currentSubscription = await registration.pushManager.getSubscription()
      
      if (currentSubscription) {
        setSubscription(currentSubscription as BrowserPushSubscription)
        setIsSubscribed(true)
      } else {
        setSubscription(null)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('usePushNotifications: Error refreshing subscription status:', error)
      setIsSubscribed(false)
      setSubscription(null)
    }
  }, [])

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    refreshSubscriptionStatus
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

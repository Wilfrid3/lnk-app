'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePushNotifications } from './usePushNotifications'
import notificationApi, { type NotificationSubscription } from '@/services/notificationApi'

export const useNotificationSubscriptions = () => {
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications()
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([])
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's subscriptions
  const loadSubscriptions = useCallback(async () => {
    if (!isSupported) return

    setIsLoading(true)
    setError(null)

    try {
      const userSubscriptions = await notificationApi.getUserSubscriptions()
      setSubscriptions(userSubscriptions)
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
      setError('Impossible de charger les abonnements')
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Load subscription count
  const loadSubscriptionCount = useCallback(async () => {
    try {
      const result = await notificationApi.getSubscriptionCount()
      setSubscriptionCount(result.count)
    } catch (err) {
      console.error('Failed to load subscription count:', err)
    }
  }, [])

  // Subscribe with error handling
  const subscribe = async () => {
    setError(null)
    
    try {
      await subscribeToPush()
      await loadSubscriptions() // Refresh subscriptions
      return true
    } catch (err) {
      console.error('Subscribe error:', err)
      setError('Impossible de s\'abonner aux notifications')
      return false
    }
  }

  // Unsubscribe with error handling
  const unsubscribe = async () => {
    setError(null)
    
    try {
      await unsubscribeFromPush()
      await loadSubscriptions() // Refresh subscriptions
      return true
    } catch (err) {
      console.error('Unsubscribe error:', err)
      setError('Impossible de se désabonner')
      return false
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    setError(null)
    
    try {
      await notificationApi.sendTestWelcomeNotification()
      return true
    } catch (err) {
      console.error('Test notification error:', err)
      setError('Impossible d\'envoyer la notification de test')
      return false
    }
  }

  // Load data on mount
  useEffect(() => {
    if (isSupported && isSubscribed) {
      loadSubscriptions()
      loadSubscriptionCount()
    }
  }, [isSupported, isSubscribed, loadSubscriptions, loadSubscriptionCount])

  return {
    // State
    isSupported,
    isSubscribed,
    subscriptions,
    subscriptionCount,
    isLoading,
    error,
    
    // Actions
    subscribe,
    unsubscribe,
    sendTestNotification,
    loadSubscriptions,
    loadSubscriptionCount,
    
    // Clear error
    clearError: () => setError(null)
  }
}

export default useNotificationSubscriptions

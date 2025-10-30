'use client'

import React, { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
// import useNotificationSubscriptions from '@/hooks/useNotificationSubscriptions'

interface NotificationSettingsProps {
  className?: string
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush, refreshSubscriptionStatus } = usePushNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  // Refresh subscription status when component mounts (only once)
  useEffect(() => {
    if (isSupported && refreshSubscriptionStatus && !hasRefreshed) {
      refreshSubscriptionStatus()
      setHasRefreshed(true)
    }
  }, [isSupported, refreshSubscriptionStatus, hasRefreshed])

  const handleToggleNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
      } else {
        await subscribeToPush()
      }
      
      // Refresh subscription status after toggle
      await refreshSubscriptionStatus()
      
    } catch (error) {
      console.error('Error toggling notifications:', error)
      setError('Erreur lors de la gestion des notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="material-icons text-yellow-600 dark:text-yellow-400">warning</span>
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Notifications non supportées
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Votre navigateur ne supporte pas les notifications push.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-icons text-primary-500">notifications</span>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Notifications Push
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSubscribed 
                ? 'Recevez des notifications pour rester informé' 
                : 'Activez les notifications pour ne rien manquer'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
          
          <button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
              isSubscribed 
                ? 'bg-primary-500' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isSubscribed ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {isSubscribed && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-icons text-green-600 dark:text-green-400 text-sm">check_circle</span>
            <p className="text-sm text-green-700 dark:text-green-300">
              Notifications activées ! Vous recevrez des alertes même quand l&apos;app est fermée.
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-3 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isSubscribed ? 'Désactivation...' : 'Activation...'}
          </span>
        </div>
      )}
    </div>
  )
}

export default NotificationSettings

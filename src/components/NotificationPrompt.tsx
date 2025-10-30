'use client'

import { useState } from 'react'
import { useNotificationPrompt } from '@/hooks/useNotificationPrompt'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useAuth } from '@/contexts/AuthContext'
import '@/utils/notificationPromptUtils' // Load debugging utilities

export default function NotificationPrompt() {
  const { user, loading } = useAuth()
  const { shouldShowPrompt, acceptPrompt, dismissPrompt, snoozePrompt } = useNotificationPrompt()
  const { subscribeToPush, refreshSubscriptionStatus } = usePushNotifications()
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Don't show prompt if user is not authenticated or still loading
  if (loading || !user || !shouldShowPrompt) {
    return null
  }

  const handleAccept = async () => {
    console.log('NotificationPrompt: Button clicked - handleAccept starting');
    console.log('NotificationPrompt: Environment check:', {
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      timestamp: new Date().toISOString()
    });
    
    setIsSubscribing(true)
    console.log('NotificationPrompt: Starting subscription process...')
    try {
      console.log('NotificationPrompt: Calling subscribeToPush...')
      await subscribeToPush()
      console.log('NotificationPrompt: Subscription successful, accepting prompt...')
      
      // Refresh subscription status to ensure UI updates
      console.log('NotificationPrompt: Refreshing subscription status after successful subscription...')
      await refreshSubscriptionStatus()
      
      acceptPrompt()
      // Clear session storage to allow prompt to show again on next sign-in
      sessionStorage.removeItem('notification-prompt-shown-this-session')
    } catch (error) {
      console.error('NotificationPrompt: Failed to subscribe to notifications:', error)
      console.error('NotificationPrompt: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
      // If subscription fails, treat it as a snooze
      snoozePrompt()
    } finally {
      setIsSubscribing(false)
      console.log('NotificationPrompt: Subscription process completed')
    }
  }

  const handleDismiss = () => {
    dismissPrompt()
  }

  const handleSnooze = () => {
    snoozePrompt()
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm0 10v-5a2 2 0 012-2h5m-7 7a2 2 0 002 2h5M9 7a2 2 0 012-2h5a2 2 0 012 2v10a2 2 0 01-2 2H9" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Restez informé ! 🔔
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Activez les notifications pour être alerté des nouveaux messages, likes et commentaires.
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleAccept}
                disabled={isSubscribing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
              >
                {isSubscribing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Activation...
                  </span>
                ) : (
                  'Activer'
                )}
              </button>
              <button
                onClick={handleSnooze}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
              >
                Plus tard
              </button>
            </div>
            <button
              onClick={handleDismiss}
              className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Ne plus me demander
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

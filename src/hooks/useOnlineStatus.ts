import { useEffect } from 'react'
import { useMessagingStore } from '@/store/useMessagingStore'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to manage user online status when they are in the app
 * This should be used in the main layout or app component
 */
export const useOnlineStatus = () => {
  const { user } = useAuth()
  const { 
    socket, 
    initializeSocket, 
    updateUserOnlineStatus, 
    getCurrentConversation 
  } = useMessagingStore()

  useEffect(() => {
    if (!user) return

    // Initialize socket connection when user is authenticated
    if (!socket) {
      initializeSocket()
    }

    // Function to handle visibility change
    const handleVisibilityChange = () => {
      const currentConversationId = getCurrentConversation()
      
      if (document.visibilityState === 'visible') {
        // User came back to the tab/app
        if (!currentConversationId) {
          // Only send online status if not in a specific conversation
          updateUserOnlineStatus(true)
          console.log('🟢 User returned to app - sent online status')
        }
      } else {
        // User left the tab/app
        updateUserOnlineStatus(false)
        console.log('🔴 User left app - sent offline status')
      }
    }

    // Function to handle before unload (user closing tab/browser)
    const handleBeforeUnload = () => {
      updateUserOnlineStatus(false)
      console.log('🔴 User closing app - sent offline status')
    }

    // Function to handle focus (user focused on tab/app)
    const handleFocus = () => {
      const currentConversationId = getCurrentConversation()
      if (!currentConversationId) {
        updateUserOnlineStatus(true)
        console.log('🟢 User focused on app - sent online status')
      }
    }

    // Function to handle blur (user unfocused from tab/app)
    const handleBlur = () => {
      updateUserOnlineStatus(false)
      console.log('🔴 User unfocused from app - sent offline status')
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Send initial online status when hook mounts (user is in app)
    const initialStatusTimer = setTimeout(() => {
      if (socket && !getCurrentConversation()) {
        updateUserOnlineStatus(true)
        console.log('🟢 Initial app load - sent online status')
      }
    }, 2000) // Wait a bit for socket to be fully ready

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      clearTimeout(initialStatusTimer)
    }
  }, [user, socket, initializeSocket, updateUserOnlineStatus, getCurrentConversation])

  // Return online status functions for manual control if needed
  return {
    sendOnlineStatus: () => updateUserOnlineStatus(true),
    sendOfflineStatus: () => updateUserOnlineStatus(false)
  }
}

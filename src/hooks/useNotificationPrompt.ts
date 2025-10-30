'use client'

import { useEffect, useState } from 'react'
import { usePushNotifications } from './usePushNotifications'
import { useAuth } from '@/contexts/AuthContext'

interface PromptState {
  shouldShow: boolean
  lastPromptTime: number
  dismissCount: number
  lastUserId?: string // Track which user this state belongs to
}

const STORAGE_KEY = 'notification-prompt-state'
const SESSION_STORAGE_KEY = 'notification-prompt-shown-this-session'
const PROMPT_INTERVAL = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
const MAX_DISMISSALS = 4 // Stop prompting after 4 dismissals

export const useNotificationPrompt = () => {
  const { user, loading } = useAuth()
  const { isSupported, isSubscribed } = usePushNotifications()
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)

  useEffect(() => {
    // Don't show prompt if user is not authenticated, notifications aren't supported, or user is already subscribed
    if (loading || !user || !isSupported || isSubscribed) {
      setShouldShowPrompt(false)
      return
    }

    const checkPromptState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY)
        const state: PromptState = stored 
          ? JSON.parse(stored) 
          : { shouldShow: true, lastPromptTime: 0, dismissCount: 0, lastUserId: user._id }

        const now = Date.now()
        const timeSinceLastPrompt = now - state.lastPromptTime
        
        // Check if this is a different user than the one in storage
        const isDifferentUser = state.lastUserId && state.lastUserId !== user._id
        
        // Check if prompt was already shown in this session for this user
        const shownThisSession = sessionShown === user._id

        // Show prompt immediately if:
        // 1. Different user signed in (account switching)
        // 2. User has never been prompted before
        // 3. Not already shown in this session
        // 4. User hasn't dismissed it too many times
        // 5. OR enough time has passed since last prompt
        const shouldShow = 
          !shownThisSession &&
          state.dismissCount < MAX_DISMISSALS && 
          (isDifferentUser || 
           state.lastPromptTime === 0 || 
           timeSinceLastPrompt >= PROMPT_INTERVAL)

        if (shouldShow) {
          setShouldShowPrompt(true)
          // Mark as shown in this session
          sessionStorage.setItem(SESSION_STORAGE_KEY, user._id)
        }
      } catch (error) {
        console.error('Error reading notification prompt state:', error)
        // If there's an error, show the prompt (default behavior)
        setShouldShowPrompt(true)
        sessionStorage.setItem(SESSION_STORAGE_KEY, user._id)
      }
    }

    // Check immediately when user changes
    checkPromptState()

    // Set up interval to check every hour
    const interval = setInterval(checkPromptState, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(interval)
  }, [isSupported, isSubscribed, user, loading])

  const acceptPrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record that user accepted
    updatePromptState({ accepted: true })
  }

  const dismissPrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record dismissal
    updatePromptState({ dismissed: true })
  }

  const snoozePrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record snooze (will show again in 12 hours)
    updatePromptState({ snoozed: true })
  }

  const updatePromptState = (action: { accepted?: boolean; dismissed?: boolean; snoozed?: boolean }) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const state: PromptState = stored 
        ? JSON.parse(stored) 
        : { shouldShow: true, lastPromptTime: 0, dismissCount: 0, lastUserId: user?._id }

      const now = Date.now()

      if (action.accepted) {
        // User subscribed, no need to prompt again for this user
        const newState: PromptState = {
          shouldShow: false,
          lastPromptTime: now,
          dismissCount: 0,
          lastUserId: user?._id
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } else if (action.dismissed) {
        // User dismissed, increment dismiss count for this user
        const newState: PromptState = {
          shouldShow: false,
          lastPromptTime: now,
          dismissCount: state.lastUserId === user?._id ? state.dismissCount + 1 : 1,
          lastUserId: user?._id
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } else if (action.snoozed) {
        // User snoozed, update last prompt time but don't increment dismiss count
        const newState: PromptState = {
          shouldShow: false,
          lastPromptTime: now,
          dismissCount: state.lastUserId === user?._id ? state.dismissCount : 0,
          lastUserId: user?._id
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      }
    } catch (error) {
      console.error('Error updating notification prompt state:', error)
    }
  }

  const resetPromptState = () => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setShouldShowPrompt(false)
  }

  return {
    shouldShowPrompt,
    acceptPrompt,
    dismissPrompt,
    snoozePrompt,
    resetPromptState
  }
}

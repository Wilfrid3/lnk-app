'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SignInPromptState {
  shouldShow: boolean
  lastPromptTime: number
  dismissCount: number
  dailyPromptCount: number
  lastPromptDate: string
}

const STORAGE_KEY = 'signin-prompt-state'
const PROMPT_INTERVAL = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
const MAX_DAILY_PROMPTS = 2 // Show maximum 2 times per day
const MAX_TOTAL_DISMISSALS = 5 // Stop prompting after 5 total dismissals

export const useSignInPrompt = () => {
  const { user, loading } = useAuth()
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)

  useEffect(() => {
    // Only show prompt for non-authenticated users (guests)
    if (loading || user) {
      setShouldShowPrompt(false)
      return
    }

    const checkPromptState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const state: SignInPromptState = stored 
          ? JSON.parse(stored) 
          : { 
              shouldShow: true, 
              lastPromptTime: 0, 
              dismissCount: 0,
              dailyPromptCount: 0,
              lastPromptDate: ''
            }

        const now = Date.now()
        const today = new Date().toDateString()
        const timeSinceLastPrompt = now - state.lastPromptTime
        
        // Reset daily count if it's a new day
        if (state.lastPromptDate !== today) {
          state.dailyPromptCount = 0
          state.lastPromptDate = today
        }
        
        // Show prompt if:
        // 1. Never shown before (lastPromptTime is 0)
        // 2. More than 2 hours have passed since last prompt
        // 3. Haven't reached daily limit (2 prompts per day)
        // 4. User hasn't dismissed it more than 5 times total
        const shouldShow = 
          state.dismissCount < MAX_TOTAL_DISMISSALS && 
          state.dailyPromptCount < MAX_DAILY_PROMPTS &&
          (state.lastPromptTime === 0 || timeSinceLastPrompt >= PROMPT_INTERVAL)

        if (shouldShow) {
          setShouldShowPrompt(true)
        }
      } catch (error) {
        console.error('Error reading sign-in prompt state:', error)
        // If there's an error, show the prompt (default behavior)
        setShouldShowPrompt(true)
      }
    }

    // Check immediately
    checkPromptState()

    // Set up interval to check every 30 minutes
    const interval = setInterval(checkPromptState, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, loading])

  const acceptPrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record that user accepted (signed in)
    updatePromptState({ accepted: true })
  }

  const dismissPrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record dismissal
    updatePromptState({ dismissed: true })
  }

  const snoozePrompt = () => {
    setShouldShowPrompt(false)
    // Update storage to record snooze (will show again in 2 hours)
    updatePromptState({ snoozed: true })
  }

  const updatePromptState = (action: { accepted?: boolean; dismissed?: boolean; snoozed?: boolean }) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const state: SignInPromptState = stored 
        ? JSON.parse(stored) 
        : { 
            shouldShow: true, 
            lastPromptTime: 0, 
            dismissCount: 0,
            dailyPromptCount: 0,
            lastPromptDate: ''
          }

      const now = Date.now()
      const today = new Date().toDateString()

      // Reset daily count if it's a new day
      if (state.lastPromptDate !== today) {
        state.dailyPromptCount = 0
        state.lastPromptDate = today
      }

      if (action.accepted) {
        // User signed in, no need to prompt again
        localStorage.removeItem(STORAGE_KEY)
      } else if (action.dismissed) {
        // User dismissed, increment dismiss count and daily count
        const newState: SignInPromptState = {
          shouldShow: false,
          lastPromptTime: now,
          dismissCount: state.dismissCount + 1,
          dailyPromptCount: state.dailyPromptCount + 1,
          lastPromptDate: today
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      } else if (action.snoozed) {
        // User snoozed, update last prompt time and daily count but don't increment dismiss count
        const newState: SignInPromptState = {
          shouldShow: false,
          lastPromptTime: now,
          dismissCount: state.dismissCount,
          dailyPromptCount: state.dailyPromptCount + 1,
          lastPromptDate: today
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      }
    } catch (error) {
      console.error('Error updating sign-in prompt state:', error)
    }
  }

  const resetPromptState = () => {
    localStorage.removeItem(STORAGE_KEY)
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

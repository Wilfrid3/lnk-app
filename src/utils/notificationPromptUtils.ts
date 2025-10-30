// Utility functions for managing notification prompts
// These can be used for testing or admin purposes

export const NotificationPromptUtils = {
  // Reset the prompt state (useful for testing)
  resetPromptState: () => {
    localStorage.removeItem('notification-prompt-state')
    console.log('Notification prompt state reset')
  },

  // Force show the prompt (useful for testing)
  forceShowPrompt: () => {
    localStorage.removeItem('notification-prompt-state')
    window.location.reload()
  },

  // Get current prompt state (useful for debugging)
  getPromptState: () => {
    const stored = localStorage.getItem('notification-prompt-state')
    return stored ? JSON.parse(stored) : null
  },

  // Set prompt to show after specific time (useful for testing)
  schedulePrompt: (delayMinutes: number = 1) => {
    const state = {
      shouldShow: false,
      lastPromptTime: Date.now() - (3 * 60 * 60 * 1000) + (delayMinutes * 60 * 1000),
      dismissCount: 0
    }
    localStorage.setItem('notification-prompt-state', JSON.stringify(state))
    console.log(`Notification prompt scheduled to show in ${delayMinutes} minute(s)`)
  }
}

// Utility functions for managing sign-in prompts
export const SignInPromptUtils = {
  // Reset the prompt state (useful for testing)
  resetPromptState: () => {
    localStorage.removeItem('signin-prompt-state')
    console.log('Sign-in prompt state reset')
  },

  // Force show the prompt (useful for testing)
  forceShowPrompt: () => {
    localStorage.removeItem('signin-prompt-state')
    window.location.reload()
  },

  // Get current prompt state (useful for debugging)
  getPromptState: () => {
    const stored = localStorage.getItem('signin-prompt-state')
    return stored ? JSON.parse(stored) : null
  },

  // Set prompt to show after specific time (useful for testing)
  schedulePrompt: (delayMinutes: number = 1) => {
    const today = new Date().toDateString()
    const state = {
      shouldShow: false,
      lastPromptTime: Date.now() - (2 * 60 * 60 * 1000) + (delayMinutes * 60 * 1000),
      dismissCount: 0,
      dailyPromptCount: 0,
      lastPromptDate: today
    }
    localStorage.setItem('signin-prompt-state', JSON.stringify(state))
    console.log(`Sign-in prompt scheduled to show in ${delayMinutes} minute(s)`)
  }
}

// Make utilities available globally for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as typeof window & { 
    NotificationPromptUtils: typeof NotificationPromptUtils,
    SignInPromptUtils: typeof SignInPromptUtils 
  }).NotificationPromptUtils = NotificationPromptUtils
  ;(window as typeof window & { 
    NotificationPromptUtils: typeof NotificationPromptUtils,
    SignInPromptUtils: typeof SignInPromptUtils 
  }).SignInPromptUtils = SignInPromptUtils
}

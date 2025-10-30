'use client'

import { useState } from 'react'
import { useSignInPrompt } from '@/hooks/useSignInPrompt'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import '@/utils/notificationPromptUtils' // Load debugging utilities

export default function SignInPrompt() {
  const { shouldShowPrompt, acceptPrompt, dismissPrompt, snoozePrompt } = useSignInPrompt()
  const { googleSignIn } = useAuth()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)

  if (!shouldShowPrompt) {
    return null
  }

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await googleSignIn()
      console.log('Google sign-in successful from SignInPrompt')
      acceptPrompt()
      // No need to redirect here as user might want to stay on current page
    } catch (error) {
      console.error('Failed to sign in with Google:', error)
      // If sign-in fails, treat it as a snooze
      snoozePrompt()
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleNavigateToAuth = () => {
    acceptPrompt()
    router.push('/auth/signin')
  }

  const handleDismiss = () => {
    dismissPrompt()
  }

  const handleSnooze = () => {
    snoozePrompt()
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-br from-primary-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900/80 shadow-lg rounded-lg border border-primary-200 dark:border-blue-700 z-40 animate-in slide-in-from-bottom-2 duration-300">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-pink-100 dark:bg-gradient-to-br dark:from-blue-800 dark:to-primary-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Débloquez toutes les fonctionnalités ! ✨
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Créez un compte pour accéder aux discussions, favoris, notifications et bien plus.
            </p>
            
            {/* Benefits list */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Messages privés et discussions
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sauvegarde de favoris
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Notifications en temps réel
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {isSigningIn ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuer avec Google
                  </span>
                )}
              </button>
              
              {/* Other options */}
              <div className="flex space-x-2">
                <button
                  onClick={handleNavigateToAuth}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
                >
                  Autres options
                </button>
                <button
                  onClick={handleSnooze}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
                >
                  Plus tard
                </button>
              </div>
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

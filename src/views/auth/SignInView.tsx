'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/layouts/AuthLayout'
import apiClient from '@/lib/axios'
import { useAuth } from '@/contexts/AuthContext'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import type { User } from '@/types/User'

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Country codes with flags for phone number input
const countryCodes = [
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin' },
  { code: '+235', country: 'TD', flag: '🇹🇩', name: 'Tchad' },
]

export default function SignInView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setTokens, user } = useAuth()
  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('email')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    countryCode: '+237', // Default to Cameroon
    email: '',
    password: '',
    phonePassword: '' // Added password for phone login
  })
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] = useState(false)

  // Handle redirect after successful authentication
  useEffect(() => {
    if (user && isGoogleSignInInProgress) {
      // User is authenticated and Google sign-in was in progress
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
      
      console.log('User authenticated after Google sign-in, redirecting...')
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        router.push(callbackUrl || '/')
      }, 100)
      
      setIsGoogleSignInInProgress(false)
    }
  }, [user, isGoogleSignInInProgress, router])

  // Handle success messages from URL parameters
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-reset-success') {
      setSuccessMessage('Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.')
      // Clear the message parameter from URL
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('message')
      router.replace(`/auth/signin?${newSearchParams.toString()}`, { scroll: false })
    }
  }, [searchParams, router])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
    // Reset errors when switching sign-in methods
  const handleSignInMethodChange = (method: 'phone' | 'email') => {
    setSignInMethod(method)
    setErrors({})
  }
  
  // Handle country code selection
  const handleCountryCodeChange = (code: string) => {
    setFormData({
      ...formData,
      countryCode: code
    })
    setShowCountryDropdown(false)
  }
    const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (signInMethod === 'phone') {
      // Validate phone number
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Le numéro de téléphone est requis'
      } else if (!/^\d{9,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Numéro de téléphone invalide'
      }
      
      // Validate password for phone sign-in
      if (!formData.phonePassword.trim()) {
        newErrors.phonePassword = 'Le mot de passe est requis'
      }
    } else {
      // Validate email
      if (!formData.email.trim()) {
        newErrors.email = "L'email est requis"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalide'
      }
      
      // Validate password
      if (!formData.password.trim()) {
        newErrors.password = 'Le mot de passe est requis'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      let loginData;
        if (signInMethod === 'phone') {
        // Prepare phone login data
        loginData = {
          phoneNumber: formData.countryCode + formData.phoneNumber,
          countryCode: formData.countryCode,
          password: formData.phonePassword,
          // type: 'phone'
        }
        // console.log('Phone login data:', loginData);
      }else {
        // Prepare email login data
        loginData = {
          email: formData.email,
          password: formData.password,
          // type: 'email'
        }
      }
        // Call the login API endpoint
      const response = await apiClient.post<LoginResponse>('/auth/login', loginData)
      
      // console.log('Login successful:', response.data)
      
      // Extract user data and tokens from response
      const { user, accessToken, refreshToken } = response.data
        // Store tokens
      setTokens({ accessToken, refreshToken })
      
      // Update user in context
      setUser(user)
      
      // Small delay to ensure cookies are set before navigation
      setTimeout(() => {
        // Check for callback URL in query params
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
        
        // Redirect to callback URL if exists, otherwise go to home page
        router.push(callbackUrl || '/')
      }, 300)
      
    } catch (error) {
      console.error('Error signing in:', error)
      const apiError = error as { response?: { data?: { message?: string } } }
      
      if (signInMethod === 'phone') {
        setErrors({
          phonePassword: apiError.response?.data?.message || 'Numéro ou mot de passe incorrect'
        })
      } else {
        setErrors({
          password: apiError.response?.data?.message || 'Email ou mot de passe incorrect'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle successful sign in
  const handleSignInSuccess = () => {
      console.log('Google sign-in success callback triggered')
      setIsGoogleSignInInProgress(true)
      // The redirect will be handled by the useEffect that watches for user state
  }

  // Handle sign in errors
  const handleSignInError = (error: unknown) => {
      console.error('Sign in error:', error)
      // Add any error handling logic here
  }
  
  return (
    <AuthLayout 
      title="Connexion" 
      subtitle="Accédez à votre compte"
      showBackButton={true}
    >
      <GoogleSignInButton
                onSuccess={handleSignInSuccess}
                onError={handleSignInError}
                className="mb-6"
            />

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
            </div>
      {/* Sign In Method Toggle */}
      <div className="mb-6 flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleSignInMethodChange('phone')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            signInMethod === 'phone'
              ? 'bg-white dark:bg-gray-700 text-primary-500 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="material-icons text-sm mr-1">phone</span>
            Téléphone
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => handleSignInMethodChange('email')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            signInMethod === 'email'
              ? 'bg-white dark:bg-gray-700 text-primary-500 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="material-icons text-sm mr-1">email</span>
            Email
          </div>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="material-icons text-green-500 mr-2">check_circle</span>
            <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">        {signInMethod === 'phone' ? (
          <>            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <div className="flex">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center h-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-l-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <span className="mr-1">
                      {countryCodes.find(c => c.code === formData.countryCode)?.flag}
                    </span>
                    <span>{formData.countryCode}</span>
                    <span className="ml-1">▼</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 max-h-60 overflow-y-auto">
                      <ul className="py-1">
                        {countryCodes.map((country) => (
                          <li 
                            key={country.code}
                            onClick={() => handleCountryCodeChange(country.code)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <span className="mr-2">{country.flag}</span>
                            <span className="mr-2">{country.code}</span>
                            <span>{country.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Phone Input */}
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 rounded-r-lg border border-gray-300 dark:border-gray-700 border-l-0 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Entrez votre numéro"
                />
              </div>
              {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="phonePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <input
                id="phonePassword"
                name="phonePassword"
                type="password"
                value={formData.phonePassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Entrez votre mot de passe"
              />
              {errors.phonePassword && <p className="text-sm text-red-600 mt-1">{errors.phonePassword}</p>}
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Entrez votre email"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Entrez votre mot de passe"
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>
          </>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                <span>Connexion...</span>
              </div>
            ) : "Se connecter"}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Pas encore de compte? <Link href="/auth/signup" className="text-primary-500 hover:underline">S&apos;inscrire</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

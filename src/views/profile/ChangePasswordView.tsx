'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import apiClient from '@/lib/axios'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export default function ChangePasswordView() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate current password
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis'
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le nouveau mot de passe doit contenir au moins 6 caractères'
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Veuillez confirmer le nouveau mot de passe'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    // Check if new password is different from current
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      setSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Redirect to profile after a short delay
      setTimeout(() => {
        router.push('/profile')
      }, 2000)

    } catch (error: unknown) {
      console.error('Error changing password:', error)
      
      const apiError = error as { response?: { status?: number, data?: { errors?: Record<string, string>, message?: string } } }
      
      if (apiError.response?.status === 400) {
        setErrors({
          currentPassword: 'Mot de passe actuel incorrect'
        })
      } else if (apiError.response?.status === 422) {
        // Handle validation errors from server
        const serverErrors = apiError.response.data?.message ?? (apiError.response.data?.errors || {})
        if (typeof serverErrors === 'string') {
          setErrors({ general: serverErrors })
        } else {
          setErrors(serverErrors)
        }
      } else {
        setErrors({
          general: 'Une erreur est survenue. Veuillez réessayer.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (success) {
    return (
      <DefaultLayout>
        <div className="px-4 sm:px-6 md:px-8 max-w-2xl mx-auto pb-32">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className="mb-4">
              <span className="material-icons text-green-500 text-5xl">check_circle</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mot de passe modifié
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers votre profil.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-2xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Changer le mot de passe
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-icons text-sm">
                    {showPasswords.current ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-icons text-sm">
                    {showPasswords.new ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-icons text-sm">
                    {showPasswords.confirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  'Changer le mot de passe'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="flex items-center text-blue-800 dark:text-blue-200 font-medium mb-2">
            <span className="material-icons mr-2 text-sm">security</span>
            {' '}
            Conseils de sécurité
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <li>• Utilisez un mot de passe unique pour votre compte</li>
            <li>• Mélangez lettres, chiffres et caractères spéciaux</li>
            <li>• Évitez d&apos;utiliser des informations personnelles</li>
            <li>• Ne partagez jamais votre mot de passe</li>
          </ul>
        </div>
      </div>
    </DefaultLayout>
  )
}

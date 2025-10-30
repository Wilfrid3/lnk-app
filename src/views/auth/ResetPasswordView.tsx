'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/layouts/AuthLayout'
import apiClient from '@/lib/axios'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  newPassword?: string
  confirmPassword?: string
  general?: string
}

export default function ResetPasswordView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setErrors({
        general: 'Token de réinitialisation manquant ou invalide'
      })
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

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

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Veuillez confirmer le mot de passe'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !token) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      })

      setSuccess(true)
      
      // Redirect to signin after a short delay
      setTimeout(() => {
        router.push('/auth/signin?message=password-reset-success')
      }, 3000)

    } catch (error: unknown) {
      console.error('Error resetting password:', error)
      
      const apiError = error as { response?: { status?: number, data?: { message?: string } } }
      
      if (apiError.response?.status === 400) {
        setErrors({
          general: 'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.'
        })
      } else if (apiError.response?.status === 422) {
        setErrors({
          newPassword: 'Le mot de passe ne respecte pas les critères de sécurité'
        })
      } else {
        setErrors({
          general: 'Une erreur est survenue. Veuillez réessayer.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // If no token, show error state
  if (!token && !loading) {
    return (
      <AuthLayout 
        title="Lien invalide" 
        subtitle="Le lien de réinitialisation est invalide ou a expiré"
        showBackButton={true}
        backUrl="/auth/signin"
      >
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-5xl text-red-500">error</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Lien invalide</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le lien de réinitialisation est invalide ou a expiré. 
            Veuillez demander un nouveau lien.
          </p>
          <div className="space-y-3">
            <Link 
              href="/auth/forgot-password" 
              className="inline-block bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Demander un nouveau lien
            </Link>
            <div>
              <Link 
                href="/auth/signin" 
                className="text-primary-500 hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Success state
  if (success) {
    return (
      <AuthLayout 
        title="Mot de passe réinitialisé" 
        subtitle="Votre mot de passe a été modifié avec succès"
        showBackButton={false}
      >
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-5xl text-green-500">check_circle</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Mot de passe réinitialisé
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre mot de passe a été modifié avec succès. 
            Vous allez être redirigé vers la page de connexion.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </AuthLayout>
    )
  }

  // Reset password form
  return (
    <AuthLayout 
      title="Nouveau mot de passe" 
      subtitle="Choisissez un nouveau mot de passe sécurisé"
      showBackButton={true}
      backUrl="/auth/signin"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

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
              className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
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
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
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
        <div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Réinitialisation...</span>
              </div>
            ) : "Réinitialiser le mot de passe"}
          </button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            <Link href="/auth/signin" className="text-primary-500 hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="flex items-center text-blue-800 dark:text-blue-200 font-medium mb-2 text-sm">
          <span className="material-icons mr-2 text-sm">security</span>
          {' '}
          Conseils de sécurité
        </h3>
        <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1">
          <li>• Utilisez un mot de passe unique</li>
          <li>• Mélangez lettres, chiffres et caractères spéciaux</li>
          <li>• Évitez les informations personnelles</li>
        </ul>
      </div>
    </AuthLayout>
  )
}

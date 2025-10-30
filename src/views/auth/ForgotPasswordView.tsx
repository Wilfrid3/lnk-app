'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthLayout from '@/components/layouts/AuthLayout'
import apiClient from '@/lib/axios'

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError('')
  }
  
  const validateForm = () => {
    if (!email.trim()) {
      setError("L'email est requis")
      return false
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide')
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email.trim()
      })
      
      // Show success message regardless of whether email exists (security)
      setSuccess(true)
    } catch (error: unknown) {
      console.error('Error sending password reset:', error)
      const apiError = error as { response?: { status?: number, data?: { message?: string } } }
      
      if (apiError.response?.status === 429) {
        setError('Trop de tentatives. Veuillez réessayer plus tard.')
      } else {
        setError('Erreur lors de l\'envoi du lien de réinitialisation. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <AuthLayout 
      title="Mot de passe oublié" 
      subtitle="Réinitialisez votre mot de passe"
      showBackButton={true}
      backUrl="/auth/signin"
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Entrez votre email"
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                  <span>Envoi en cours...</span>
                </div>
              ) : "Envoyer le lien de réinitialisation"}
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
      ) : (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <span className="material-icons text-5xl text-green-500">check_circle</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Email envoyé!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nous avons envoyé un lien de réinitialisation à <span className="font-medium">{email}</span>.
            Veuillez vérifier votre boîte de réception et suivre les instructions.
          </p>
          <Link 
            href="/auth/signin" 
            className="text-primary-500 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}

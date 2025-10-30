'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'

interface ComingSoonViewProps {
  title?: string
  description?: string
  icon?: string
}

export default function ComingSoonView({ 
  title = "Bientôt disponible", 
  description = "Cette fonctionnalité sera disponible très prochainement.",
  icon = "construction"
}: ComingSoonViewProps) {
  const router = useRouter()

  return (
    <DefaultLayout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="mb-6">
            <span className="material-icons text-6xl text-primary-500 mb-4 block">
              {icon}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Retour
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Accueil
            </button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center mb-2">
              <span className="material-icons text-blue-500 mr-2">info</span>
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Restez connecté
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nous travaillons activement sur cette fonctionnalité. 
              Revenez bientôt pour découvrir les nouveautés !
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

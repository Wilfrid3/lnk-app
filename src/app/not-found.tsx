'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'

function NotFoundContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="text-3xl sm:text-5xl font-semibold flex items-center text-gray-900 dark:text-white">
            Yamo
            <span className="bg-primary-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 mx-1">
              Hub
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-primary-500 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Page introuvable</h2>
          
          <div className="mb-6 flex justify-center">
            <span className="material-icons text-7xl text-gray-400 dark:text-gray-600">
              search_off
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <Link 
              href="/"
              className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="material-icons mr-2">home</span>
              Retour à l&apos;accueil
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-6 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="material-icons mr-2">arrow_back</span>
              Page précédente
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} YamoHub. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}
'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
// import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const router = useRouter()
  // const { user } = useAuth() // Uncomment when needed

  const settingsItems = [
    {
      icon: 'notifications',
      title: 'Notifications',
      description: 'Gérez vos préférences de notifications',
      href: '/settings/notifications',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: 'person',
      title: 'Profil',
      description: 'Modifiez vos informations personnelles',
      href: '/profile/edit',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: 'security',
      title: 'Confidentialité',
      description: 'Contrôlez qui peut voir votre profil',
      href: '/settings/privacy',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: 'block',
      title: 'Utilisateurs bloqués',
      description: 'Gérez votre liste d\'utilisateurs bloqués',
      href: '/settings/blocked',
      color: 'text-red-600 dark:text-red-400'
    },
    {
      icon: 'palette',
      title: 'Apparence',
      description: 'Personnalisez l\'interface de l\'app',
      href: '/settings/appearance',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: 'help',
      title: 'Aide & Support',
      description: 'Obtenez de l\'aide ou contactez le support',
      href: '/settings/help',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ]

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Paramètres
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configurez vos préférences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {settingsItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${item.color}`}>
                <span className="material-icons text-xl">{item.icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>

              <span className="material-icons text-gray-400 dark:text-gray-500 group-hover:text-primary-500">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* Account Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Compte
          </h2>
          
          <div className="space-y-1">
            <Link
              href="/auth/logout"
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="material-icons text-xl">logout</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-red-600 dark:text-red-400">
                  Se déconnecter
                </h3>
                <p className="text-sm text-red-500 dark:text-red-400">
                  Déconnectez-vous de votre compte
                </p>
              </div>

              <span className="material-icons text-red-400 dark:text-red-500">
                chevron_right
              </span>
            </Link>

            <Link
              href="/settings/delete-account"
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="material-icons text-xl">delete_forever</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-red-600 dark:text-red-400">
                  Supprimer le compte
                </h3>
                <p className="text-sm text-red-500 dark:text-red-400">
                  Supprimez définitivement votre compte
                </p>
              </div>

              <span className="material-icons text-red-400 dark:text-red-500">
                chevron_right
              </span>
            </Link>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>YamoZone v1.0.0</p>
            <p className="mt-1">© 2024 YamoZone. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

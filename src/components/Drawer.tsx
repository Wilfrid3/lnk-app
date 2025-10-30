'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { trackApp } from '@/utils/analytics'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { getFullImageUrl } from '@/utils/imageUtils'
import Image from 'next/image'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { signOut, user, spoofingState, stopSpoofing } = useAuth()

  // Handle navigation with tracking
  const handleNavigation = (section: string) => {
    // Track menu navigation
    trackApp.featureUse(`menu_navigate_${section}`)
    onClose()
  }

  // Handle theme toggle with tracking
  const toggleTheme = () => {
    // Toggle between light/dark, or use system if current is system
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await apiClient.post('/auth/logout')
      
      // Use the AuthContext's signOut method to clear local state/storage
      await signOut()
      
      // Close the drawer
      onClose()
      
      // Redirect to login page
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if the API call fails, we should still clear local state
      await signOut()
      onClose()
      router.push('/auth/signin')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">Menu</div>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <span className="material-icons">close</span>
            </button>
          </div>
          {/* User Info */}
          {user && (
            <Link href={`/profile`}>
              <div className="flex items-center gap-3 mt-2 mb-1">
              {user.avatar ? (
                <Image
                  src={getFullImageUrl(user.avatar) ?? '/images/avatars/default_tous.png'}
                  alt={user.name ?? 'User'}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  priority
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold border border-gray-200 dark:border-gray-700">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-lg">{user.name ?? 'Utilisateur'}</div>
                {user.email && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                )}
              </div>
            </div>
            </Link>
          )}
          
          {/* Spoofing Status */}
          {spoofingState.isSpoofing && spoofingState.targetUser && (
            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎭</span>
                  <div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Mode Imitation
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">
                      {spoofingState.targetUser.name || 'Utilisateur sans nom'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await stopSpoofing()
                      onClose()
                    } catch (error) {
                      console.error('Error stopping spoofing:', error)
                    }
                  }}
                  className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Quitter
                </button>
              </div>
            </div>
          )}
        </div>
        
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link 
                href="/" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('home')}
              >
                <span className="material-icons mr-3 text-primary-500">home</span>
                <span className="text-lg">Accueil</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/search" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('search')}
              >
                <span className="material-icons mr-3 text-primary-500">search</span>
                <span className="text-lg">Rechercher</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/videos" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('videos')}
              >
                <span className="material-icons mr-3 text-primary-500">play_circle</span>
                <span className="text-lg">Vidéos</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/trending" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('trending')}
              >
                <span className="material-icons mr-3 text-primary-500">trending_up</span>
                <span className="text-lg">Tendances</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/categories" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('categories')}
              >
                <span className="material-icons mr-3 text-primary-500">category</span>
                <span className="text-lg">Catégories</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/favoris" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('favoris')}
              >
                <span className="material-icons mr-3 text-primary-500">favorite</span>
                <span className="text-lg">Favoris</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/messages" 
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
                onClick={() => handleNavigation('messages')}
              >
                <span className="material-icons mr-3 text-primary-500">chat</span>
                <span className="text-lg">Messages</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <span className="material-icons mr-3 text-primary-500">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
                <span className="text-lg">
                  {theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
                </span>
              </button>
            </li>
          </ul>
        </nav>        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Link 
              href="/settings" 
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => handleNavigation('settings')}
            >
              <span className="material-icons mr-3 text-gray-600 dark:text-gray-400">settings</span>
              <span className="text-lg text-gray-900 dark:text-white">Paramètres</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left w-full"
            >
              <span className="material-icons mr-3 text-gray-600 dark:text-gray-400">logout</span>
              <span className="text-lg text-gray-900 dark:text-white">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Drawer

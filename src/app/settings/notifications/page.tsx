'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import NotificationSettings from '@/components/NotificationSettings'
import { useAuth } from '@/contexts/AuthContext'
import notificationApi from '@/services/notificationApi'
import apiClient from '@/lib/axios'
import { User } from '@/services/usersService'

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Demo notification data
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    url: '',
    targetAudience: 'all' as 'all' | 'inactive' | 'new' | 'selected'
  })

  // User search and selection state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [hasMoreUsers, setHasMoreUsers] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // User search function
  const searchUsers = useCallback(async (query: string, page: number = 1, isLoadMore: boolean = false) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await apiClient.get('/users/search', {
        params: {
          search: query.trim(),
          page,
          limit: 20
        }
      })

      const userData = response.data as {
        users: User[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      }
      const newUsers = userData.users || []

      if (isLoadMore) {
        setSearchResults(prev => [...prev, ...newUsers])
      } else {
        setSearchResults(newUsers)
      }

      setHasMoreUsers(
        userData.pagination?.page !== undefined &&
        userData.pagination?.totalPages !== undefined &&
        userData.pagination.page < userData.pagination.totalPages
      )
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query)
    setSearchPage(1)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchUsers(query, 1, false)
    }, 300)
  }, [searchUsers])

  // Load more users
  const loadMoreUsers = useCallback(() => {
    if (hasMoreUsers && !isSearching) {
      const nextPage = searchPage + 1
      setSearchPage(nextPage)
      searchUsers(searchQuery, nextPage, true)
    }
  }, [hasMoreUsers, isSearching, searchPage, searchQuery, searchUsers])

  // Toggle user selection
  const toggleUserSelection = useCallback((user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id)
      if (isSelected) {
        return prev.filter(u => u._id !== user._id)
      } else {
        return [...prev, user]
      }
    })
  }, [])

  // Remove selected user
  const removeSelectedUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId))
  }, [])

  // Clear selected users
  const clearSelectedUsers = useCallback(() => {
    setSelectedUsers([])
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSendTestNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      setMessage({ type: 'error', text: 'Titre et message requis' })
      return
    }

    if (notificationForm.targetAudience === 'selected' && selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins un utilisateur' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await notificationApi.sendNotification({
        title: notificationForm.title,
        body: notificationForm.body,
        url: notificationForm.url || '/',
        userIds: notificationForm.targetAudience === 'selected' 
          ? selectedUsers.map(user => user._id)
          : notificationForm.targetAudience === 'all' ? undefined : ['demo-user-id']
      })

      setMessage({ 
        type: 'success', 
        text: `Notification envoyée avec succès ! (${result.successful}/${result.total} utilisateurs)` 
      })
      setNotificationForm({ title: '', body: '', url: '', targetAudience: 'all' })
      
      // Clear selected users if they were used
      if (notificationForm.targetAudience === 'selected') {
        setSelectedUsers([])
      }
    } catch (error) {
      console.error('Notification send error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de la notification' })
    } finally {
      setIsLoading(false)
    }
  }

  const sendPredefinedNotification = async (title: string, body: string, url: string = '/') => {
    try {
      const result = await notificationApi.sendNotification({
        title,
        body,
        url
      })
      
      setMessage({ 
        type: 'success', 
        text: `Notification envoyée ! (${result.successful}/${result.total} utilisateurs)`
      })
    } catch (error) {
      console.error('Predefined notification error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' })
    }
  }

  const sendTestWelcome = async () => {
    try {
      await notificationApi.sendTestWelcomeNotification()
      setMessage({ type: 'success', text: 'Notification de test envoyée !' })
    } catch (error) {
      console.error('Test welcome error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi du test' })
    }
  }

  const predefinedNotifications = [
    {
      title: 'Test de bienvenue 🎉',
      body: 'Test de notification de bienvenue',
      action: sendTestWelcome
    },
    {
      title: 'Nouveaux profils disponibles ! ✨',
      body: 'Découvrez qui s\'est inscrit récemment près de chez vous',
      action: () => sendPredefinedNotification('Nouveaux profils disponibles ! ✨', 'Découvrez qui s\'est inscrit récemment près de chez vous', '/trending')
    },
    {
      title: 'Vos matchs vous attendent ! 💕',
      body: 'Quelqu\'un attend peut-être votre message',
      action: () => sendPredefinedNotification('Vos matchs vous attendent ! 💕', 'Quelqu\'un attend peut-être votre message', '/messages')
    },
    {
      title: 'Offre spéciale weekend ! 🎉',
      body: 'Profitez de fonctionnalités premium gratuites ce weekend',
      action: () => sendPredefinedNotification('Offre spéciale weekend ! 🎉', 'Profitez de fonctionnalités premium gratuites ce weekend', '/premium')
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
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos préférences de notifications
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Notification Settings */}
          <NotificationSettings />

          {/* Admin/Demo Section */}
          {user?.isAdmin && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Administration des Notifications
              </h2>

              {/* Custom Notification Form */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Envoyer une notification personnalisée
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Titre de la notification"
                    />
                  </div>

                  <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="body"
                      value={notificationForm.body}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      placeholder="Contenu de la notification"
                    />
                  </div>

                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de destination (optionnel)
                    </label>
                    <input
                      type="text"
                      id="url"
                      value={notificationForm.url}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="/page-destination"
                    />
                  </div>

                  <div>
                    <label htmlFor="audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Audience cible
                    </label>
                    <select
                      id="audience"
                      value={notificationForm.targetAudience}
                      onChange={(e) => {
                        const value = e.target.value as 'all' | 'inactive' | 'new' | 'selected'
                        setNotificationForm(prev => ({ ...prev, targetAudience: value }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">Tous les utilisateurs</option>
                      <option value="inactive">Utilisateurs inactifs</option>
                      <option value="new">Nouveaux utilisateurs</option>
                      <option value="selected">Utilisateurs sélectionnés</option>
                    </select>
                  </div>

                  {/* User Search and Selection */}
                  {notificationForm.targetAudience === 'selected' && (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Sélectionner les utilisateurs ({selectedUsers.length} sélectionné{selectedUsers.length > 1 ? 's' : ''})
                        </h4>
                        {selectedUsers.length > 0 && (
                          <button
                            onClick={clearSelectedUsers}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Tout effacer
                          </button>
                        )}
                      </div>

                      {/* Selected Users Display */}
                      {selectedUsers.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                              <div
                                key={user._id}
                                className="flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm"
                              >
                                <Image
                                  src={user.avatar || '/images/avatars/default_tous.png'}
                                  alt={user.name}
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 rounded-full mr-2"
                                />
                                <span>{user.name}</span>
                                <button
                                  onClick={() => removeSelectedUser(user._id)}
                                  className="ml-2 text-primary-600 hover:text-primary-800"
                                >
                                  <span className="material-icons text-sm">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Search Input */}
                      <div className="relative mb-3">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="material-icons text-gray-400 text-sm">search</span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchQueryChange(e.target.value)}
                          placeholder="Rechercher des utilisateurs..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                          {searchResults.map(user => (
                            <div
                              key={user._id}
                              className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center">
                                <Image
                                  src={user.avatar || '/images/avatars/default_tous.png'}
                                  alt={user.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.city && `${user.city} • `}{user.userType}
                                    {user.isVerified && (
                                      <span className="ml-1 text-blue-500">
                                        <span className="material-icons text-xs">verified</span>
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleUserSelection(user)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  selectedUsers.some(u => u._id === user._id)
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                }`}
                              >
                                {selectedUsers.some(u => u._id === user._id) ? 'Sélectionné' : 'Sélectionner'}
                              </button>
                            </div>
                          ))}
                          
                          {/* Load More Button */}
                          {hasMoreUsers && (
                            <div className="p-3 text-center border-t border-gray-200 dark:border-gray-600">
                              <button
                                onClick={loadMoreUsers}
                                disabled={isSearching}
                                className="text-primary-500 hover:text-primary-600 text-sm disabled:opacity-50"
                              >
                                {isSearching ? 'Chargement...' : 'Charger plus'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* No Results */}
                      {searchQuery && !isSearching && searchResults.length === 0 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                          Aucun utilisateur trouvé pour &quot;{searchQuery}&quot;
                        </div>
                      )}

                      {/* Search Loading */}
                      {isSearching && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin mr-2">
                            <span className="material-icons text-primary-500 text-sm">refresh</span>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Recherche...</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleSendTestNotification}
                    disabled={isLoading || !notificationForm.title || !notificationForm.body}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Envoi...' : 'Envoyer la notification'}
                  </button>
                </div>

                {message && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  }`}>
                    {message.text}
                  </div>
                )}
              </div>

              {/* Predefined Notifications */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notifications prédéfinies
                </h3>

                <div className="space-y-3">
                  {predefinedNotifications.map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {notification.body}
                        </p>
                      </div>
                      <button
                        onClick={notification.action}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Envoyer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="material-icons text-blue-600 dark:text-blue-400 mt-0.5">info</span>
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  À propos des notifications
                </h3>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>• Les notifications push fonctionnent même quand l&apos;app est fermée</p>
                  <p>• Vous pouvez les désactiver à tout moment</p>
                  <p>• Les notifications sont envoyées pour les messages, likes, commentaires, etc.</p>
                  <p>• Idéal pour rester connecté avec la communauté yamohub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

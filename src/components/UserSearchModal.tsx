'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import apiClient from '@/lib/axios'
import { User } from '@/types/User'
import { getFullImageUrl } from '@/utils/imageUtils'

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => void
  loading?: boolean
}

interface SearchResult {
  users: User[]
  meta: {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounced search function
  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([])
      setTotalPages(1)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await apiClient.get('/users/search', {
        params: {
          q: query,
          page,
          limit: 10
        }
      })

      const data = response.data as SearchResult
      setSearchResults(data.users || [])
      setTotalPages(data.meta?.totalPages || 1)
      setCurrentPage(data.meta?.currentPage || 1)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchError('Erreur lors de la recherche des utilisateurs')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setSearchError(null)
      setCurrentPage(1)
      setTotalPages(1)
    }
  }, [isOpen])

  const handleUserSelect = (userId: string) => {
    onSelectUser(userId)
    onClose()
  }

  const handlePageChange = (page: number) => {
    performSearch(searchQuery, page)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              🎭 Sélectionner un utilisateur à imiter
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              disabled={loading}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou ID..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={loading}
            />
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-6">
          {searchError && (
            <div className="text-center py-8">
              <div className="text-red-500 dark:text-red-400">
                <span className="material-icons text-4xl mb-2">error</span>
                <p>{searchError}</p>
              </div>
            </div>
          )}

          {!searchQuery.trim() && !searchError && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="material-icons text-4xl mb-2">search</span>
              <p>Commencez à taper pour rechercher des utilisateurs</p>
            </div>
          )}

          {searchQuery.trim() && searchResults.length === 0 && !isSearching && !searchError && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="material-icons text-4xl mb-2">person_off</span>
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <Image
                        src={getFullImageUrl(user.avatar) ?? '/images/avatars/default_tous.png'}
                        alt={user.name ?? 'User'}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name || 'Nom non défini'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email || user.phoneNumber || 'Contact non défini'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        ID: {user._id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.isAdmin && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
                        Admin
                      </span>
                    )}
                    {user.isVip && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded">
                        VIP
                      </span>
                    )}
                    {user.isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isSearching}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Précédent
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isSearching}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSearchModal

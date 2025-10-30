'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import UserVideosList from '@/components/UserVideosList'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import apiClient from '@/lib/axios'
import { getFullImageUrl } from '@/utils/imageUtils'

interface User {
  _id: string
  id: string
  name: string
  avatar?: string
  isVerified?: boolean
  isOnline?: boolean
}

export default function UserVideosPage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser } = useAuth()
  const userId = Array.isArray(params.id) ? params.id[0] : params.id
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const defaultAvatarSrc = '/images/avatars/default_tous.png'

  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return

      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch user profile
        let userResponse;
        if (currentUser) {
          userResponse = await apiClient.get(`/users/${userId}`)
        } else {
          userResponse = await apiClient.get(`/users/${userId}/guest`)
        }
        setUser(userResponse.data as User)
        
      } catch (error) {
        console.error('Error fetching user:', error)
        setError('Erreur lors du chargement du profil utilisateur')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, currentUser])

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DefaultLayout>
    )
  }

  if (error || !user) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <span className="material-icons text-6xl text-gray-400 mb-4">person_off</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Utilisateur introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ?? 'Cet utilisateur n\'existe pas ou a été supprimé.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retour
          </button>
        </div>
      </DefaultLayout>
    )
  }

  const isOwnProfile = currentUser?._id === userId

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
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={getFullImageUrl(user.avatar) ?? defaultAvatarSrc}
                    alt={user.name ?? 'User'}
                    width={48}
                    height={48}
                    className="object-cover rounded-full"
                  />
                </div>
                
                {/* Online indicator */}
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isOwnProfile ? 'Mes vidéos' : `Vidéos de ${user.name}`}
                  </h1>
                  {user.isVerified && (
                    <span className="material-icons text-blue-500 text-lg" title="Compte vérifié">
                      verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isOwnProfile ? 'Gérez vos vidéos' : 'Découvrez les vidéos publiées'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action button */}
          {isOwnProfile && (
            <button
              onClick={() => router.push('/publish/video')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="material-icons">add</span>
              <span className="hidden sm:inline">Publier</span>
            </button>
          )}
        </div>

        {/* Videos List */}
        {userId && (
          <UserVideosList
            userId={userId}
            currentUserId={currentUser?._id}
            showActions={isOwnProfile}
            onEdit={(id) => router.push(`/videos/edit/${id}`)}
          />
        )}
      </div>
    </DefaultLayout>
  )
}

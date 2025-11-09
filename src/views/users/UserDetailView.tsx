'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import apiClient from '@/lib/axios'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import BottomActionBar from '@/components/BottomActionBar'
import InfinitePostList from '@/components/InfinitePostList'
import PackageCard from '@/components/profile/PackageCard'
import { getFullImageUrl } from '@/utils/imageUtils'
import { useServicesStore } from '@/store/useServicesStore'
import { User } from '@/types/User'
import { useAuth } from '@/contexts/AuthContext'
import { offeringOptions } from '@/utils/constants'
import { useChatHandler } from '@/utils/chatUtils'

interface UserDetailProps {
  userId: string
}

interface UserStats {
  posts: number
  views: number
  likes: number
  followers: number
  rank: number
  rankHistory: {
    week: number
    month: number
    year: number
  }
}

interface UserRating {
  id: string
  rating: number
  comment?: string
  raterUserId: {
    id: string
    name: string
    avatar?: string
  },
  ratedUserId: string,
  updatedAt: string
  createdAt: string
}

interface UserFollower {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  followedAt: string
}

// Helper function to get user type icon
const getUserTypeIcon = (userType?: string): string => {
  switch (userType) {
    case 'couple':
      return 'favorite'
    case 'femme':
      return 'female'
    case 'homme':
      return 'male'
    default:
      return 'person'
  }
}

const UserDetailView: React.FC<UserDetailProps> = ({ userId }) => {
  const router = useRouter()
  
  // Services from Zustand store
  const { loadServices, getServiceById } = useServicesStore()
  const { user: currentUser, startSpoofing } = useAuth()
  
  // Chat handler
  const { handleChat } = useChatHandler(router, currentUser)
  
  const [user, setUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    posts: 0,
    views: 0,
    likes: 0,
    followers: 0,
    rank: 0,
    rankHistory: { week: 0, month: 0, year: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'description' | 'posts' | 'rates' | 'stats' | 'services' | 'followers' | 'following' | 'ratings'>('info')
  const [isFollowing, setIsFollowing] = useState(false)
  const [hasAlreadyRated, setHasAlreadyRated] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [followers, setFollowers] = useState<UserFollower[]>([])
  const [following, setFollowing] = useState<UserFollower[]>([])
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [loadingEngagement, setLoadingEngagement] = useState(false)
  const [postCount, setPostCount] = useState(0)
  const [isSpoofing, setIsSpoofing] = useState(false)

  const defaultAvatarSrc = '/images/avatars/default_tous.png'
  const defaultCoverSrc = '/images/featured/vedette_bg.png'

  useEffect(() => {
    // Load services when component mounts
    loadServices()
    
    const fetchUserDetail = async () => {
      try {
        setIsLoading(true)
        
        // Fetch user profile
        let userResponse;
        if (currentUser) {
          userResponse = await apiClient.get(`/users/${userId}`)
        } else {
          userResponse = await apiClient.get(`/users/${userId}/guest`)
        }
        setUser(userResponse.data as User)

        // Track profile view
        try {
          await apiClient.post(`/users/${userId}/view`)
        } catch (viewError) {
          console.warn('Error tracking profile view:', viewError)
        }

        // Fetch user stats
        const statsResponse = await apiClient.get(`/users/${userId}/stats`)
        setUserStats(statsResponse.data as UserStats)

        // Get post count for tab label (we'll fetch posts with infinite scroll in the Posts tab)
        try {
          const postsResponse = await apiClient.get(`/users/${userId}/posts`, {
            params: { page: 1, limit: 1 }
          })
          const postsData = postsResponse.data as { meta?: { totalItems?: number } }
          setPostCount(postsData.meta?.totalItems ?? 0)
        } catch (postError) {
          console.warn('Error getting post count:', postError)
        }

        // Check if current user is following this user
        if (currentUser){
            try {
            const followResponse = await apiClient.get(`/users/${userId}/follow-status`)
            const followData = followResponse.data as { isFollowing?: boolean }
            setIsFollowing(followData.isFollowing ?? false)
            } catch (followError) {
            console.warn('Error checking follow status:', followError)
            }
        }

        // Fetch current user's rating for this profile
        if (currentUser) {
          try {
            const myRatingResponse = await apiClient.get(`/users/${userId}/my-rating`)
            const myRatingData = myRatingResponse.data as UserRating | null
            if (myRatingData && typeof myRatingData.rating === 'number') {
              setUserRating(myRatingData.rating)
              setRatingComment(myRatingData.comment || '')
              setHasAlreadyRated(true)
            } else {
              setUserRating(0)
              setRatingComment('')
            }
          } catch {
            setUserRating(0)
            setRatingComment('')
          }
        } else {
          setUserRating(0)
          setRatingComment('')
        }
        
      } catch (error) {
        console.error('Error fetching user details:', error)
        // setError('Erreur lors du chargement du profil')
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUserDetail()
    }
  }, [userId, loadServices, currentUser])

  // Helper functions for service data
  const getServiceLabel = (serviceId: string) => {
    const service = getServiceById(serviceId)
    return service?.label ?? serviceId
  }

  const getServiceIcon = (serviceId: string) => {
    const service = getServiceById(serviceId)
    return service?.icon ?? 'star'
  }

  const redirectUnauthenticated = () => {
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
  }

  const handleCall = () => {
    if (!user) {
      redirectUnauthenticated()
      return
    }
    if (user?.phoneNumber) {
      window.location.href = `tel:${user.phoneNumber}`
    }
  }

  const handleWhatsapp = () => {
    if (!user) {
      redirectUnauthenticated()
      return
    }
    const phoneNumber = user?.phoneNumber
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`
      const message = `Bonjour ${user.name}, je viens de voir votre profil sur yamohub`
      window.open(`${whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const handleChatWithUser = () => {
    if (!user) {
      return
    }
    handleChat(userId)
  }

  const handleEmail = () => {
    if (!user) {
      redirectUnauthenticated()
      return
    }
    if (user?.email) {
      const subject = encodeURIComponent(`Contact depuis yamohub`)
      const body = encodeURIComponent(`Bonjour ${user.name},\n\nJ'ai vu votre profil sur yamohub et j'aimerais vous contacter.\n\nCordialement.`)
      window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`
    }
  }

  const handleFollow = async () => {
    if (!user) {
      redirectUnauthenticated()
      return
    }
    try {
      setLoadingEngagement(true)
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/follow`)
        setUserStats(prev => ({ ...prev, followers: prev.followers - 1 }))
      } else {
        await apiClient.post(`/users/${userId}/follow`)
        setUserStats(prev => ({ ...prev, followers: prev.followers + 1 }))
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error following/unfollowing user:', error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  const handleRate = async (rating: number, comment?: string) => {
    if (!user) {
      redirectUnauthenticated()
      return
    }
    try {
      setLoadingEngagement(true)
      await apiClient.post(`/users/${userId}/rate`, { rating, comment })
      setUserRating(rating)
      setRatingComment('')
      setShowRatingModal(false)
      setHasAlreadyRated(true)
      // Refresh ratings list if it's currently loaded
      if (activeTab === 'ratings') {
        loadRatings()
      }
    } catch (error) {
      console.error('Error rating user:', error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  const handleSpoofUser = async () => {
    if (!currentUser?.isAdmin) {
      console.error('Unauthorized: Admin access required')
      return
    }
    
    if (!user?._id) {
      console.error('No user to spoof')
      return
    }
    
    try {
      setIsSpoofing(true)
      await startSpoofing(user._id)
      // Optional: Show success message or redirect to home after spoofing starts
    } catch (error) {
      console.error('Error starting spoofing:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsSpoofing(false)
    }
  }

  const loadFollowers = async () => {
    try {
      setLoadingEngagement(true)
      const response = await apiClient.get(`/users/${userId}/followers`)
      const followersData = response.data as { followers?: UserFollower[] }
      setFollowers(followersData.followers ?? [])
    } catch (error) {
      console.error('Error loading followers:', error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  const loadFollowing = async () => {
    try {
      setLoadingEngagement(true)
      const response = await apiClient.get(`/users/${userId}/following`)
      const followingData = response.data as { following?: UserFollower[] }
      setFollowing(followingData.following ?? [])
    } catch (error) {
      console.error('Error loading following:', error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  const loadRatings = async () => {
    try {
      setLoadingEngagement(true)
      const response = await apiClient.get(`/users/${userId}/ratings`)
      const ratingsData = response.data as { ratings?: UserRating[] }
      setRatings(ratingsData.ratings ?? [])
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoadingEngagement(false)
    }
  }

  // Load engagement data when switching tabs
  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab)
    
    switch (tab) {
      case 'followers':
        if (followers.length === 0) {
          await loadFollowers()
        }
        break
      case 'following':
        if (following.length === 0) {
          await loadFollowing()
        }
        break
      case 'ratings':
        if (ratings.length === 0) {
          await loadRatings()
        }
        break
    }
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}m`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(0)}k`
    }
    return views.toString()
  }

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
            Profil introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ?? 'Ce profil n\'existe pas ou a été supprimé.'}
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

  return (
    <DefaultLayout hideFooter={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <Image
              src={getFullImageUrl(user.coverImage) ?? defaultCoverSrc}
              alt="Cover"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white z-10"
            >
              <span className="material-icons">arrow_back</span>
            </button>

            {/* Videos Button */}
            <button
              onClick={() => router.push(`/users/${userId}/videos`)}
              className="absolute top-4 right-4 bg-black/50 rounded-full flex items-center gap-2 px-4 py-2 text-white text-sm z-10 hover:bg-black/70 transition-colors"
            >
              <span className="material-icons">videocam</span>
              <span>Vidéos</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-1 bg-white dark:bg-gray-800">
            {/* Avatar */}
            <div className="absolute -top-16 left-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={getFullImageUrl(user.avatar) ?? defaultAvatarSrc}
                    alt={user.name ?? 'User'}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                
                {/* Online Status */}
                {user.isOnline && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="pt-12">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.name ?? 'Utilisateur'}
                    </h1>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-1">
                      {user.isVerified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="material-icons text-white text-xs">verified</span>
                        </div>
                      )}
                      
                      {user.isVip && (
                        <div className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                          VIP
                        </div>
                      )}
                    </div>
                    
                    <span className="text-sm text-gray-500">(certifié)</span>
                    <span className="text-sm text-pink-500">(Rang: {userStats.rank})</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Note ({user.averageRating?.toFixed(1) ?? '0.0'})
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          className={`material-icons text-sm ${
                            star <= Math.round(user.averageRating ?? 0) ? 'text-pink-500' : 'text-gray-300'
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    {user.ratingCount && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({user.ratingCount})
                      </span>
                    )}
                  </div>
                </div>

                {/* Subscribe and Message Buttons */}
                {(!currentUser || (currentUser && currentUser._id != userId)) && (<div className="ml-4 flex flex-col gap-2">
                  <button 
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    <span className="material-icons text-sm">notifications</span>
                    <span>
                      {isFollowing ? 'Abonné' : "S'abonner"}
                    </span>
                  </button>
                  
                  <button 
                    onClick={handleChatWithUser}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    Message
                  </button>

                  {/* Admin Spoofing Button */}
                  {currentUser?.isAdmin && (
                    <button 
                      onClick={handleSpoofUser}
                      disabled={isSpoofing}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSpoofing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Imitation...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🎭</span>
                          <span>Imiter</span>
                        </>
                      )}
                    </button>
                  )}
                </div>)}
              </div>

              {/* Rating Section */}
              {!(currentUser && currentUser._id === userId) &&
              (<div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Me noter:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => !hasAlreadyRated?setShowRatingModal(true):null}
                      className={`material-icons text-lg transition-colors ${
                        star <= userRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      {star <= userRating ? 'star' : 'star_border'}
                    </button>
                  ))}
                </div>
                {!hasAlreadyRated && (<button 
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  disabled={loadingEngagement}
                >
                  {loadingEngagement ? 'Envoi...' : 'Noter'}
                </button>)}
              </div>)
              }
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar">
              {[
                { key: 'info', label: 'Informations' },
                { key: 'description', label: 'Description' },
                { key: 'posts', label: `Annonces (${postCount})` },
                { key: 'rates', label: 'Mes Tarifs' },
                { key: 'stats', label: 'Statistiques' },
                { key: 'followers', label: `Abonnés (${userStats.followers})` },
                { key: 'following', label: 'Abonnements' },
                { key: 'ratings', label: 'Évaluations' },
                { key: 'services', label: 'Mes services' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as typeof activeTab)}
                  className={`flex-shrink-0 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-pink-500 border-b-2 border-pink-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto p-4">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {user.bio || 'Aucune description fournie.'}
              </p>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <InfinitePostList userId={userId} />
          )}

          {/* Rates Tab */}
          {activeTab === 'rates' && (
            <div className="space-y-4">
              {user.servicePackages && user.servicePackages.length > 0 ? (
                user.servicePackages.filter(pkg => pkg.isActive).map((pkg) => (
                  <PackageCard
                    key={pkg._id ?? pkg.id}
                    pkg={pkg}
                    onEdit={() => {}} // Empty function since editing isn't allowed in user view
                    onDelete={() => {}} // Empty function since deletion isn't allowed in user view
                    getServiceLabel={getServiceLabel}
                    getServiceIcon={getServiceIcon}
                    viewOnly={true}
                    actionButton={
                      <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm">
                        <span className="material-icons text-sm">event</span>
                        <span>Réserver</span>
                      </button>
                    }
                  />
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400">Aucun tarif disponible.</p>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Subscribers card */}
              <div className="bg-blue-500 text-white rounded-lg p-6">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-1">Abonnés</div>
                  <div className="text-3xl font-bold">{userStats.followers.toLocaleString()}</div>
                </div>
              </div>

              {/* Rank section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Semaine</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Mois</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Année</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{userStats.rank}º Rang</span>
                    <span className="text-green-500 text-sm">{userStats.rankHistory.week} ▲</span>
                    <span className={`text-sm ${userStats.rankHistory.month > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(userStats.rankHistory.month)} {userStats.rankHistory.month > 0 ? '▲' : '▼'}
                    </span>
                    <span className={`text-sm ${userStats.rankHistory.year > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(userStats.rankHistory.year)} {userStats.rankHistory.year > 0 ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons text-gray-400">description</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nbre Annonces</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{userStats.posts}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons text-gray-400">people</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Abonnés</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{userStats.followers}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons text-gray-400">visibility</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nbre de vues</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{formatViews(userStats.views)}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons text-gray-400">favorite</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">J&apos;aime</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{formatViews(userStats.likes)}</div>
                </div>
              </div>

              {/* Profile visits chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons text-gray-400">visibility</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Visites du profil</span>
                </div>
                
                <div className="text-right mb-4">
                  <div className="text-2xl font-bold text-blue-500">{userStats.views.toLocaleString()}</div>
                </div>
                
                {/* Simple chart representation */}
                <div className="h-32 flex items-end justify-between">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                    <div key={month} className="flex flex-col items-center">
                      <div 
                        className="w-2 bg-blue-500 rounded-t mb-1"
                        style={{ height: `${Math.random() * 100 + 20}%` }}
                      ></div>
                      <span className="text-xs text-gray-400">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div className="space-y-4">
              {loadingEngagement ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : followers.length > 0 ? (
                followers.map((follower) => (
                  <div key={follower.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={getFullImageUrl(follower.avatar) ?? defaultAvatarSrc}
                            alt={follower.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {follower.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {follower.name}
                        </h3>
                      </div>
                      
                      <button 
                        onClick={() => router.push(`/users/${follower.id}`)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Voir profil
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-4xl text-gray-400 mb-4">people</span>
                  <p className="text-gray-500 dark:text-gray-400">Aucun abonné pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div className="space-y-4">
              {loadingEngagement ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : following.length > 0 ? (
                following.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <Image
                            src={getFullImageUrl(user.avatar) ?? defaultAvatarSrc}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                      </div>
                      
                      <button 
                        onClick={() => router.push(`/users/${user.id}`)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Voir profil
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-4xl text-gray-400 mb-4">people_outline</span>
                  <p className="text-gray-500 dark:text-gray-400">Aucun abonnement pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="space-y-4">
              {loadingEngagement ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : ratings.length > 0 ? (
                ratings.map((rating) => (
                  <div key={rating.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={getFullImageUrl(rating.raterUserId.avatar) ?? defaultAvatarSrc}
                          alt={rating.raterUserId.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {rating.raterUserId.name}
                          </h3>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                  key={star}
                                  className={`material-icons text-sm ${
                                    star <= rating.rating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(rating.updatedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          {rating.comment && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-4xl text-gray-400 mb-4">star_border</span>
                  <p className="text-gray-500 dark:text-gray-400">Aucune évaluation pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* Personal Information Section */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-blue-500">person</span>{' '}
                  Informations personnelles
                </h3>
                <div className="space-y-4">
                  {user.age && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="material-icons text-blue-500 text-sm">cake</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Âge</span>
                        <p className="font-medium text-gray-900 dark:text-white">{user.age} ans</p>
                      </div>
                    </div>
                  )}
                  
                  {user.userType && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                        <span className="material-icons text-pink-500 text-sm">
                          {getUserTypeIcon(user.userType)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Type de profil</span>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{user.userType}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <span className="material-icons text-green-500 text-sm">email</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                        <p className="font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm text-green-500">verified</span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {user.isEmailVerified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <span className="material-icons text-orange-500 text-sm">phone</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Téléphone</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.phoneNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm text-green-500">verified</span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          {user.isPhoneVerified ? 'Vérifié' : 'Non vérifié'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Status Section */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-icons text-purple-500">verified_user</span>{' '}
                  Statut du profil
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="material-icons text-blue-500 text-sm">account_circle</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Compte actif</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.isActive ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <span className="material-icons text-yellow-500 text-sm">star</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Membre VIP</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.isVip ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    {user.isVip && (
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                        VIP
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <span className="material-icons text-green-500 text-sm">check_circle</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Profil vérifié</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.isVerified ? 'Oui' : 'Non'}
                      </p>
                    </div>
                    {user.isVerified && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                        Vérifié
                      </div>
                    )}
                  </div>
                  
                  {user.lastSeen && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="material-icons text-gray-500 text-sm">schedule</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(user.lastSeen).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Services & Preferences Section */}
              {(user.clientType || user.appearance || user.offerings?.length || user.hourlyRate || user.halfDayRate || user.fullDayRate) && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-indigo-500">settings</span>{' '}
                    Services & Préférences
                  </h3>
                  <div className="space-y-4">
                    {user.clientType && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-indigo-500 text-sm">group</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Type de clientèle</span>
                          <p className="font-medium text-gray-900 dark:text-white">{user.clientType}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.appearance && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-purple-500 text-sm">face</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Apparence</span>
                          <p className="font-medium text-gray-900 dark:text-white">{user.appearance}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.offerings && user.offerings.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-pink-500 text-sm">local_offer</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Services proposés</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.offerings.map((o) => {
                              const offering = offeringOptions.find(opt => opt.id === o);
                              return (
                              <div key={o} className="flex items-center px-2 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400 rounded-full text-xs font-medium">
                                <span className="material-icons text-pink-500 text-sm">{offering? offering.icon: o}</span>
                                {offering? offering.label : o}
                              </div>
                            )})}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {(user.hourlyRate || user.halfDayRate || user.fullDayRate) && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-green-500 text-sm">monetization_on</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Tarifs</span>
                          <div className="space-y-1 mt-1">
                            {user.hourlyRate && (
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">Heure:</span> {user.hourlyRate.toLocaleString()} FCFA
                              </p>
                            )}
                            {user.halfDayRate && (
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">Demi-journée:</span> {user.halfDayRate.toLocaleString()} FCFA
                              </p>
                            )}
                            {user.fullDayRate && (
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">Journée complète:</span> {user.fullDayRate.toLocaleString()} FCFA
                              </p>
                            )}
                            {user.weekendRate && (
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-medium">Week-end:</span> {user.weekendRate.toLocaleString()} FCFA
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {user.availabilityHours && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-blue-500 text-sm">access_time</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Horaires de disponibilité</span>
                          <p className="font-medium text-gray-900 dark:text-white">{user.availabilityHours}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.paymentMethods && user.paymentMethods.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-yellow-500 text-sm">payment</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Moyens de paiement</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.paymentMethods.map((method) => (
                              <span key={method} className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              {(user.bio || user.specialServices || user.additionalNotes || user.createdAt) && (
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-icons text-gray-500">info</span>{' '}
                    Informations complémentaires
                  </h3>
                  <div className="space-y-4">
                    {user.bio && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="material-icons text-gray-500 text-sm">description</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Biographie</span>
                          <p className="font-medium text-gray-900 dark:text-white mt-1 leading-relaxed">{user.bio}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.specialServices && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-red-500 text-sm">star_border</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Services spéciaux</span>
                          <p className="font-medium text-gray-900 dark:text-white mt-1 leading-relaxed">{user.specialServices}</p>
                        </div>
                      </div>
                    )}
                    
                    {user.additionalNotes && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                          <span className="material-icons text-orange-500 text-sm">note</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Notes additionnelles</span>
                          <p className="font-medium text-gray-900 dark:text-white mt-1 leading-relaxed">{user.additionalNotes}</p>
                        </div>
                      </div>
                    )}
                    
                    {currentUser && currentUser.isAdmin && user.createdAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="material-icons text-gray-500 text-sm">calendar_today</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              
              {user.offerings && user.offerings.length > 0 ? (
                <div className="py-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {user.offerings.map((offeringId) => {
                    const offering = offeringOptions.find(opt => opt.id === offeringId);
                    return (
                      <div
                        key={offeringId}
                        className="px-3 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <span className="material-icons text-base text-pink-400 dark:text-pink-200">{offering?.icon}</span>
                        {offering ? offering.label : offeringId}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Aucun service ou délire renseigné.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <BottomActionBar
          onCall={handleCall}
          onWhatsapp={handleWhatsapp}
          onChat={handleChatWithUser}
          onEmail={handleEmail}
          disabled={{
            call: !user.phoneNumber,
            whatsapp: !user.phoneNumber,
            chat: false,
            email: !user.email
          }}
        />
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Noter {user?.name}
              </h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Rating Stars */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Cliquez sur les étoiles pour noter
                </p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => !hasAlreadyRated?setUserRating(star):null}
                      className={`material-icons text-3xl transition-colors ${
                        star <= userRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      {star <= userRating ? 'star' : 'star_border'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment */}
              <div>
                <label htmlFor="rating-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="rating-comment"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRate(userRating, ratingComment)}
                  disabled={userRating === 0 || loadingEngagement}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingEngagement ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}

export default UserDetailView

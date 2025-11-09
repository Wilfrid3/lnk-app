'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'

interface InviteStats {
  totalInvites: number
  successfulInvites: number
  pendingInvites: number
  rewardsEarned: number
  currency: string
}

interface InvitedUser {
  id: string
  name: string
  email: string
  status: 'pending' | 'registered' | 'verified'
  createdAt: string
  registeredAt?: string
  reward?: number
}

interface PaginatedInvitedUsers {
  users: InvitedUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function InviteCodeView() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<InviteStats>({
    totalInvites: 0,
    successfulInvites: 0,
    pendingInvites: 0,
    rewardsEarned: 0,
    currency: 'FCFA'
  })
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([])
  const [invitedUsersPagination, setInvitedUsersPagination] = useState({
    users: [] as InvitedUser[],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  })
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      await loadInviteData()
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadInviteData = async () => {
    try {
      setIsLoading(true)
      
      // Load invite statistics
      const statsResponse = await apiClient.get('/users/profile/invite-stats')
    //   console.log('Invite stats:', statsResponse.data)
      const statsData = statsResponse.data as {
        totalInvitedUsers?: number
        actualInvitedUsersCount?: number
        totalRewards?: number
        currency?: string
      }
      setStats({
        totalInvites: statsData.totalInvitedUsers ?? 0,
        successfulInvites: statsData.actualInvitedUsersCount ?? 0,
        pendingInvites: (statsData.totalInvitedUsers ?? 0) - (statsData.actualInvitedUsersCount ?? 0),
        rewardsEarned: statsData.totalRewards ?? 0,
        currency: statsData.currency ?? 'FCFA',
      })
      
      // Load invited users list (first page)
      await loadInvitedUsers(1)
      
    } catch (error) {
      console.error('Error loading invite data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvitedUsers = async (page: number = 1) => {
    try {
      setLoadingUsers(true)
      const usersResponse = await apiClient.get(`/users/profile/invited-users?page=${page}&limit=20`)
    //   console.log('Invited users:', usersResponse.data)
      
      const paginatedData = usersResponse.data as PaginatedInvitedUsers
      
      if (page === 1) {
        // First page - replace all users
        setInvitedUsers(paginatedData.users || [])
      } else {
        // Subsequent pages - append to existing users
        setInvitedUsers(prev => [...prev, ...(paginatedData.users || [])])
      }
      
      setInvitedUsersPagination({
        users: paginatedData.users || [],
        total: paginatedData.total || 0,
        page: paginatedData.page || 1,
        limit: paginatedData.limit || 20,
        totalPages: paginatedData.totalPages || 0
      })
      
    } catch (error) {
      console.error('Error loading invited users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadMoreUsers = () => {
    const nextPage = invitedUsersPagination.page + 1
    if (nextPage <= invitedUsersPagination.totalPages) {
      loadInvitedUsers(nextPage)
    }
  }

  const copyInviteCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const copyInviteLink = () => {
    if (user?.inviteCode) {
      const inviteLink = `${window.location.origin}/auth/signup?ref=${user.inviteCode}`
      navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const shareOnWhatsApp = () => {
    if (user?.inviteCode) {
      const inviteLink = `${window.location.origin}/auth/signup?ref=${user.inviteCode}`
      const message = `Rejoins-moi sur yamohub avec mon code d'invitation: ${user.inviteCode}\n\nOu utilise ce lien: ${inviteLink}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const shareViaNativeDialog = async () => {
    if (user?.inviteCode) {
      const inviteLink = `${window.location.origin}/auth/signup?ref=${user.inviteCode}`
      const shareData = {
        title: 'Rejoignez yamohub',
        text: `Rejoins-moi sur yamohub avec mon code d'invitation: ${user.inviteCode} et nous recevrons tous les deux des récompenses !`,
        url: inviteLink
      }

      try {
        if (navigator.share) {
          await navigator.share(shareData)
        } else {
          // Fallback to clipboard
          const message = `${shareData.text}\n\n${shareData.url}`
          await navigator.clipboard.writeText(message)
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2000)
        }
      } catch (error) {
        console.error('Error sharing:', error)
        // Fallback to clipboard
        const message = `${shareData.text}\n\n${inviteLink}`
        navigator.clipboard.writeText(message)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    }
  }

  const shareOnSocialMedia = (platform: 'facebook' | 'twitter' | 'telegram') => {
    if (!user?.inviteCode) return

    const inviteLink = `${window.location.origin}/auth/signup?ref=${user.inviteCode}`
    const message = `Rejoins-moi sur yamohub avec mon code d'invitation: ${user.inviteCode}`
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}&quote=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(inviteLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return { icon: 'verified', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' }
      case 'registered':
        return { icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' }
      case 'pending':
      default:
        return { icon: 'schedule', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Vérifié'
      case 'registered':
        return 'Inscrit'
      case 'pending':
      default:
        return 'En attente'
    }
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

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center mr-3"
          >
            <span className="material-icons">arrow_back_ios</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{"Mon code d'invitation"}</h1>
        </div>

        {/* Invite Code Card */}
        <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg p-6 mb-6 text-white">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{"Votre code d'invitation"}</h2>
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold tracking-wider">
                {user?.inviteCode || 'LOADING...'}
              </div>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Partagez ce code avec vos amis et gagnez des récompenses !
            </p>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={copyInviteCode}
                className="bg-white text-primary-500 py-2 px-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center text-sm"
              >
                <span className="material-icons mr-1 text-sm">content_copy</span>
                {copiedCode ? 'Copié !' : 'Code'}
              </button>
              
              <button
                onClick={copyInviteLink}
                className="bg-white/10 text-white border border-white/30 py-2 px-3 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center text-sm"
              >
                <span className="material-icons mr-1 text-sm">link</span>
                {copiedLink ? 'Copié !' : 'Lien'}
              </button>
              
              <button
                onClick={shareOnWhatsApp}
                className="bg-green-500 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
              >
                <span className="material-icons mr-1 text-sm">share</span>
                WhatsApp
              </button>
              
              <button
                onClick={shareViaNativeDialog}
                className="bg-blue-500 text-white py-2 px-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
              >
                <span className="material-icons mr-1 text-sm">share</span>
                Partager
              </button>
            </div>

            {/* Social Media Sharing */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => shareOnSocialMedia('facebook')}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                title="Partager sur Facebook"
              >
                <span className="material-icons text-sm">facebook</span>
              </button>
              
              <button
                onClick={() => shareOnSocialMedia('twitter')}
                className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors"
                title="Partager sur Twitter"
              >
                <span className="text-sm font-bold">𝕏</span>
              </button>
              
              <button
                onClick={() => shareOnSocialMedia('telegram')}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                title="Partager sur Telegram"
              >
                <span className="material-icons text-sm">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-blue-500">group_add</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvites}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total invités</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-green-500">check_circle</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulInvites}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Inscrits</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-orange-500">schedule</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingInvites}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">En attente</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-yellow-500">monetization_on</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.rewardsEarned?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Gains {stats?.currency}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 mb-6 text-white text-center">
          <h3 className="font-semibold mb-1">Résumé de vos invitations</h3>
          <p className="text-sm opacity-90">
            Vous avez invité <span className="font-bold">{stats.totalInvites} amis</span> et gagné <span className="font-bold">{stats?.rewardsEarned?.toLocaleString()} {stats?.currency}</span>
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comment ça marche ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-primary-500">share</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Partagez</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {"Partagez votre code d'invitation avec vos amis via WhatsApp, SMS ou réseaux sociaux"}
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-primary-500">person_add</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. {"Ils s'inscrivent"}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vos amis utilisent votre code lors de leur inscription sur yamohub
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-primary-500">monetization_on</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. Vous gagnez</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {"Recevez des crédits pour chaque ami qui s'inscrit et vérifie son compte"}
              </p>
            </div>
          </div>
        </div>

        {/* Invited Users List */}
        {invitedUsers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mes invitations ({invitedUsersPagination.users.length})
            </h3>
            <div className="space-y-3">
              {invitedUsers.map((invitedUser) => {
                const statusConfig = getStatusIcon(invitedUser.status)
                return (
                  <div key={invitedUser.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${statusConfig.bg} rounded-full flex items-center justify-center`}>
                        <span className={`material-icons text-sm ${statusConfig.color}`}>
                          {statusConfig.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {invitedUser.name || invitedUser.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getStatusLabel(invitedUser.status)} • {(new Date(invitedUser.createdAt))?.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    
                    {invitedUser.reward && (
                      <div className="text-right">
                        <div className="font-medium text-green-600 dark:text-green-400">
                          +{invitedUser.reward} {stats.currency}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Récompense
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Load More Button */}
            {invitedUsersPagination.page < invitedUsersPagination.totalPages && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMoreUsers}
                  disabled={loadingUsers}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingUsers ? (
                    <div className="flex items-center gap-2">
                      <span className="material-icons animate-spin text-sm">autorenew</span>
                      Chargement...
                    </div>
                  ) : (
                    `Charger plus (${invitedUsers.length}/${invitedUsersPagination.total})`
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {invitedUsers.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-100 dark:border-gray-700 text-center">
            <span className="material-icons text-4xl text-gray-400 mb-4">group_add</span>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune invitation envoyée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Commencez à inviter vos amis et gagnez des récompenses !
            </p>
            <button
              onClick={shareOnWhatsApp}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Inviter mes amis
            </button>
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}

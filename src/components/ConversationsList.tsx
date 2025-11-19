'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useMessagingStore, type Conversation } from '@/store/useMessagingStore'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/utils/cookies'
import { getFullImageUrl } from '@/utils/imageUtils'

interface ConversationsListProps {
  readonly className?: string
}

export default function ConversationsList({ className = '' }: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { user: currentUser } = useAuth()

  // Get auth token (this should come from your auth context)
  const token = getAuthToken();

  const {
    conversations: rawConversations,
    loading,
    error,
    fetchConversations,
    onlineUsers,
    getTypingUsersInConversation
  } = useMessagingStore()

  // Ensure conversations is always an array
  const conversations = rawConversations || []

  useEffect(() => {
    if (token) {
      setIsLoading(true)
      fetchConversations({ search: searchQuery })
        .finally(() => setIsLoading(false))
    }
  }, [token, searchQuery, fetchConversations])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24

    if (diffInMinutes < 1) {
      return 'À l\'instant'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}min`
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    }
  }

  const renderConversation = (conversation: Conversation) => {
    // Find the other participant (not the current user) from participantDetails
    const currentUserId = (currentUser as { id?: string; _id?: string })?.id || (currentUser as { id?: string; _id?: string })?._id
    
    let otherParticipant = null
    
    if (conversation.participantDetails && conversation.participantDetails.length > 0) {
      // Use participantDetails for full user information
      otherParticipant = conversation.participantDetails.find(p => 
        p._id !== currentUserId
      ) || conversation.participantDetails[0]
    } else {
      // Fallback to participants array (just IDs)
      const otherParticipantId = conversation.participants.find(id => {
        const participantId = typeof id === 'string' ? id : id._id
        return participantId !== currentUserId
      }) || conversation.participants[0]
      
      const actualId = typeof otherParticipantId === 'string' ? otherParticipantId : otherParticipantId._id
      otherParticipant = {
        _id: actualId,
        name: 'Utilisateur',
        avatar: '/images/avatars/avatar.png',
        isVerified: false,
        isVip: false,
        servicePackages: []
      }
    }
    
    if (!otherParticipant) {
      return null // Skip this conversation if we can't find the other participant
    }
    
    // Ensure we get the string ID for the online status check
    const participantId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant._id
    const isUserOnline = onlineUsers.has(participantId)
    
    // Get unread count for current user from unreadCounts object
    const unreadCount = conversation.unreadCounts?.[currentUserId || ''] || 0
    const hasUnread = unreadCount > 0

    // Get typing users for this conversation (excluding current user)
    const storeCurrentUserId = useMessagingStore.getState().getCurrentUserId()
    const typingUserIds = getTypingUsersInConversation(conversation._id, storeCurrentUserId || undefined)
    const isTyping = typingUserIds.length > 0
    
    // Get the name of who is typing
    const getTypingUserName = () => {
      if (typingUserIds.length === 0) return ''
      
      // For direct conversations, check if the typing user is the other participant
      const typingUserId = typingUserIds[0] // Get first typing user
      
      // If the typing user ID matches the other participant, show their name
      if (typingUserId === participantId) {
        return otherParticipant.name
      }
      
      // Otherwise, show a generic message or try to find the user name
      return 'Quelqu&apos;un'
    }

    return (
      <Link 
        key={conversation._id} 
        href={`/messages/${conversation._id}`}
        className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={getFullImageUrl(otherParticipant.avatar) || '/images/avatars/avatar.png'}
                alt={otherParticipant.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            {isUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className={`text-sm font-medium truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {otherParticipant.name}
                </h3>
                {otherParticipant.isVerified && (
                  <span className="material-icons text-blue-500 text-sm ml-1">verified</span>
                )}
                {otherParticipant.isVip && (
                  <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">VIP</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(conversation.lastMessageAt)}
                </span>
                {hasUnread && (
                  <div className="ml-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex-1 min-w-0">
                {isTyping ? (
                  <div className="flex items-center text-sm text-primary-600 dark:text-primary-400">
                    <span className="truncate">
                      {getTypingUserName()} est en train d&apos;écrire
                    </span>
                    <div className="flex space-x-1 ml-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {conversation.lastMessage || 'Aucun message'}
                  </p>
                )}
              </div>
              
              {otherParticipant.servicePackages && otherParticipant.servicePackages.length > 0 && (
                <span className="text-xs text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0">
                  {otherParticipant.servicePackages[0].name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <span className="material-icons text-4xl text-red-500 mb-2 block">error</span>
          <p className="text-red-600 dark:text-red-400">Erreur de chargement</p>
          <button 
            onClick={() => fetchConversations()}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Rechercher des conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading || loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <span className="material-icons text-4xl text-gray-400 mb-2 block">chat_bubble_outline</span>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                  </p>
                </div>
              </div>
            ) : (
              conversations.map(renderConversation)
            )}
          </>
        )}
      </div>
    </div>
  )
}

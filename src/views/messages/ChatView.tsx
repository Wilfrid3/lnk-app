'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ChatLayout from '@/components/layouts/ChatLayout'
import { useMessagingStore, type Message, type ChatUser } from '@/store/useMessagingStore'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/utils/cookies'

interface ChatViewProps {
  readonly userId: string
  readonly conversationId: string
  readonly user?: ChatUser
  readonly initialMessages?: Message[]
}

export default function ChatView({ userId, conversationId, user, initialMessages = [] }: ChatViewProps) {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [actualConversationId, setActualConversationId] = useState<string>(conversationId)
  const [chatUser, setChatUser] = useState<ChatUser | null>(user || null)
  const [conversationResolved, setConversationResolved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get auth token (this should come from your auth context)
  const token = getAuthToken();

  // Initialize messaging with global Zustand store and socket support
  const {
    socket,
    messages: hookMessages,
    conversations,
    fetchMessages,
    fetchConversations,
    sendMessage: sendMessageApi,
    createConversation,
    getConversationDetails,
    initializeSocket,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    getTypingUsersInConversation,
    isUserOnline: isUserOnlineSocket,
    autoMarkConversationAsRead,
    markAllMessagesAsRead,
    setCurrentConversation
  } = useMessagingStore()

  // Initialize socket connection on mount
  useEffect(() => {
    if (!socket) {
      initializeSocket()
    }
    
    return () => {
      // Don't cleanup socket here as it's shared globally
    }
  }, [socket, initializeSocket])

  // Effect to determine if we need to find/create conversation
  useEffect(() => {
    // Prevent multiple calls if already resolved
    if (conversationResolved) {
      return
    }

    const handleConversationResolution = async () => {
      if (!token || !currentUser) {
        return
      }

      try {
        // First, always try to fetch conversation details if we have what might be a conversation ID
        // This handles both cases: direct navigation to conversation and page refresh
        if (getConversationDetails) {
          try {
            const conversationResponse = await getConversationDetails(conversationId)
            
            if (conversationResponse) {
              // Extract the actual conversation data from API response
              const conversation = 'data' in conversationResponse ? conversationResponse.data : conversationResponse
              const currentUserId = (currentUser as { id?: string; _id?: string })?.id || (currentUser as { id?: string; _id?: string })?._id
              
              // Type assertion to ensure we have the right structure
              const typedConversation = conversation as { participants?: (string | ChatUser)[] }
              
              // Find the other participant from participants (conversation details returns full user objects)
              if (typedConversation.participants && typedConversation.participants.length > 0) {
                // Handle both string IDs and full user objects
                const otherParticipant = typedConversation.participants.find((p: string | ChatUser) => {
                  // If it's a string, we can't use it directly
                  if (typeof p === 'string') {
                    return p !== currentUserId
                  }
                  // If it's a user object, check the ID
                  const participantId = p._id || (p as { id?: string }).id
                  const isNotCurrentUser = participantId !== currentUserId
                  return isNotCurrentUser
                }) as ChatUser | string
                
                if (otherParticipant && typeof otherParticipant === 'object') {
                  setChatUser({
                    _id: otherParticipant._id,
                    name: otherParticipant.name || 'Utilisateur',
                    avatar: otherParticipant.avatar || '/images/avatars/avatar.png',
                    isOnline: otherParticipant.isOnline || false,
                    isVerified: otherParticipant.isVerified || false,
                    isVip: otherParticipant.isVip || false,
                    servicePackages: otherParticipant.servicePackages || [],
                    location: otherParticipant.location || '',
                    responseTime: otherParticipant.responseTime || ''
                  })
                  setActualConversationId(conversationId)
                  setConversationResolved(true) // Mark as resolved
                  return // Early return if successful
                } else {
                  // If we can't find the other participant but the conversation exists, 
                  // still set the conversation ID so we can show the conversation
                  setActualConversationId(conversationId)
                  setConversationResolved(true) // Mark as resolved
                  return
                }
              } else {
                // Still set the conversation ID if the conversation exists
                setActualConversationId(conversationId)
                setConversationResolved(true) // Mark as resolved
                return
              }
            }
          } catch {
            // Error fetching conversation details
          }
        }
        // If we reach here, either conversation details failed or it's a user ID
        // Only proceed with user lookup if userId !== conversationId (meaning we were passed a user ID, not conversation ID)
        if (userId !== conversationId) {
          if (conversations.length === 0) {
            await fetchConversations({ page: 1, limit: 50 })
          }
          
          // Check if there's an existing conversation with this user
          const existingUserConv = conversations.find(conv => {
            if (conv.type !== 'direct') return false
            
            // Check in participantDetails first
            if (conv.participantDetails && conv.participantDetails.length > 0) {
              const hasUser = conv.participantDetails.some(p => p._id === userId)
              return hasUser
            }
            
            // Fallback to participants array
            const hasUser = conv.participants.some(p => (typeof p === 'string' ? p : (p as { _id: string })._id) === userId)
            return hasUser
          })

          if (existingUserConv) {
            // Found existing conversation, fetch its full details
            if (getConversationDetails) {
              try {
                const conversationResponse = await getConversationDetails(existingUserConv._id)
                if (conversationResponse) {
                  // Extract the actual conversation data from API response
                  const conversation = 'data' in conversationResponse ? conversationResponse.data : conversationResponse
                  
                  // Type assertion to ensure we have the right structure
                  const typedConversation = conversation as { participants?: (string | ChatUser)[] }
                  
                  // Find the target user from participants
                  if (typedConversation.participants && typedConversation.participants.length > 0) {
                    // Handle both string IDs and full user objects
                    const targetUser = typedConversation.participants.find((p: string | ChatUser) => {
                      // If it's a string, check if it matches the userId
                      if (typeof p === 'string') {
                        return p === userId
                      }
                      // If it's a user object, check the ID
                      const participantId = p._id || (p as { id?: string }).id
                      return participantId === userId
                    }) as ChatUser | string
                    
                    if (targetUser && typeof targetUser === 'object') {
                      setChatUser({
                        _id: targetUser._id,
                        name: targetUser.name || 'Utilisateur',
                        avatar: targetUser.avatar || '/images/avatars/avatar.png',
                        isOnline: targetUser.isOnline || false,
                        isVerified: targetUser.isVerified || false,
                        isVip: targetUser.isVip || false,
                        servicePackages: targetUser.servicePackages || [],
                        location: targetUser.location || '',
                        responseTime: targetUser.responseTime || ''
                      })
                      setActualConversationId(existingUserConv._id)
                      setConversationResolved(true) // Mark as resolved
                      
                      // Only redirect if the URL is significantly different (not just a user ID vs conversation ID)
                      // Don't redirect if we're already on the right conversation
                      if (conversationId !== existingUserConv._id && userId !== existingUserConv._id) {
                        router.replace(`/messages/${existingUserConv._id}`)
                      }
                      return // Early return
                    }
                  }
                }
              } catch {
                // Error fetching conversation details
              }
            }
          } else {
            // No existing conversation found, create a new one
            try {
              const newConversation = await createConversation({
                participantIds: [userId],
                type: 'direct'
              })
              if (newConversation) {
                setActualConversationId(newConversation._id)
                setConversationResolved(true)
                
                // Redirect to proper conversation URL if needed
                if (conversationId !== newConversation._id) {
                  router.replace(`/messages/${newConversation._id}`)
                }
                return // Early return
              }
            } catch {
              // Set basic conversation info even if creation fails
              setActualConversationId(userId) // Use userId as fallback
              setConversationResolved(true)
            }
          }
        } else {
          // If userId equals conversationId but we couldn't fetch details, 
          // treat it as a valid conversation ID and continue
          setActualConversationId(conversationId)
          setConversationResolved(true)
        }
      } catch {
        // Error resolving conversation
      }
    }

    handleConversationResolution()
  }, [userId, conversationId, currentUser, token, conversations, fetchConversations, createConversation, getConversationDetails, router, conversationResolved])

  // Get messages for this conversation
  const conversationMessages = hookMessages[actualConversationId] || initialMessages
  
  // Add some test messages to verify rendering works
  const testMessages = useMemo((): Message[] => [
    // {
    //   _id: "test-1",
    //   conversationId: actualConversationId,
    //   senderId: "test-user-1",
    //   content: "Test message 1",
    //   type: "text",
    //   readBy: {},
    //   createdAt: new Date().toISOString()
    // },
    // {
    //   _id: "test-2", 
    //   conversationId: actualConversationId,
    //   senderId: currentUser?._id || "current-user",
    //   content: "Test message 2 from me",
    //   type: "text",
    //   readBy: {},
    //   createdAt: new Date().toISOString()
    // }
  ], [])
  
  // Use test messages if no real messages exist, otherwise use real messages
  const messagesToRender = conversationMessages.length > 0 ? conversationMessages : testMessages
  
  // Check if other users are typing in this conversation (excluding current user)
  const typingUsers = actualConversationId ? getTypingUsersInConversation(actualConversationId, currentUser?._id) : []
  const isTyping = typingUsers.length > 0

  // Default values for when no user data is provided
  const defaultChatUser: ChatUser = {
    _id: userId,
    name: 'Utilisateur',
    avatar: '/images/avatars/avatar.png',
    isOnline: false,
    isVerified: false,
    isVip: false,
    servicePackages: [],
    location: '',
    responseTime: ''
  }

  const finalChatUser = chatUser || defaultChatUser

  // Check if user is online using real socket data
  const isUserOnlineStatus = isUserOnlineSocket(finalChatUser._id)
  const isUserOnline = finalChatUser.isOnline || isUserOnlineStatus
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messagesToRender])

  // Join conversation and fetch messages on mount
  useEffect(() => {
    if (actualConversationId && token) {
      // Join the conversation for real-time updates
      joinConversation(actualConversationId)
      
      // Fetch messages
      fetchMessages(actualConversationId)
        .then(() => {
          // Auto mark messages as read when conversation is opened
          autoMarkConversationAsRead(actualConversationId)
        })
        .catch(() => {
          // Error fetching messages
        })
      
      // Leave conversation on cleanup
      return () => {
        leaveConversation(actualConversationId)
      }
    }
  }, [actualConversationId, token, fetchMessages, joinConversation, leaveConversation, autoMarkConversationAsRead, setCurrentConversation])

  const sendMessage = async () => {
    if (message.trim() && sendMessageApi && actualConversationId) {
      try {
        await sendMessageApi(actualConversationId, message.trim())
        setMessage('')
      } catch {
        // Failed to send message
      }
    }
  }

  // Quick action handlers
  // const handleReservation = () => {
  //   setShowBookingModal(true)
  // }

  // const handleLocation = () => {
  //   setShowLocationModal(true)
  // }

  // const handleServices = () => {
  //   setShowServicesModal(true)
  // }

  // const handleContact = () => {
  //   setShowContactModal(true)
  // }

  const handleAttachment = async () => {
    // TODO: Implement file upload
  }

  const handleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  // Emoji selection handler
  const addEmoji = (emoji: string) => {
    setMessage(message + emoji)
    setShowEmojiPicker(false)
  }

  // Handle typing indicators with real WebSocket support
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setMessage(newValue)
    
    // Trigger typing indicator when user starts typing
    if (actualConversationId && newValue.trim()) {
      startTyping(actualConversationId)
    } else if (actualConversationId) {
      stopTyping(actualConversationId)
    }
  }

  // Handle manual mark all as read
  const handleMarkAllAsRead = async () => {
    if (actualConversationId) {
      try {
        const result = await markAllMessagesAsRead(actualConversationId)
        if (result.success && result.markedCount > 0) {
          // Messages marked as read successfully
        }
      } catch {
        // Error marking messages as read
      }
    }
  }

  // Stop typing when user stops typing for a while
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (actualConversationId) {
        stopTyping(actualConversationId)
      }
    }, 1000)

    return () => clearTimeout(typingTimeout)
  }, [message, actualConversationId, stopTyping])

  // Send quick message handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendQuickBooking = async (serviceName: string, price: number) => {
    // TODO: Implement booking request
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendLocation = async (location: string) => {
    // TODO: Implement location sharing
    setShowLocationModal(false)
  }

  const renderMessage = (msg: Message) => {
    // Handle senderId being either a string or a user object
    // Use currentUser from component scope - this contains the API user data
    const currentUserId = currentUser?._id
    
    // Get sender ID from message - handle both string and object formats
    const senderIdValue = typeof msg.senderId === 'string' ? msg.senderId : (msg.senderId as ChatUser)?._id
    const isMe = senderIdValue === currentUserId
    
    // Check if message is read by other participants (excluding sender)
    const isReadByOthers = msg.readBy && Object.keys(msg.readBy).some(userId => userId !== senderIdValue)
    
    // For sent messages (isMe), show delivery status
    const hasDeliveryReceipt = isMe && msg.readBy && Object.keys(msg.readBy).length > 0
    const isFullyRead = isMe && isReadByOthers
    
    const timestamp = new Date(msg.createdAt).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Get read status indicator for sent messages
    const getReadStatusIcon = () => {
      if (!isMe) return null
      
      if (isFullyRead) {
        return <span className="ml-1 text-blue-500" title="Lu">✓✓</span>
      } else if (hasDeliveryReceipt) {
        return <span className="ml-1 text-gray-400" title="Délivré">✓✓</span>
      } else {
        return <span className="ml-1 text-gray-400" title="Envoyé">✓</span>
      }
    }
    
    return (
      <div key={msg._id} className={`flex mb-3 sm:mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
            <Image
              src={finalChatUser.avatar || '/images/avatars/avatar.png'}
              alt={finalChatUser.name}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        
        <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${isMe ? 'order-1' : ''}`}>
          {msg.type === 'text' && (
            <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
              isMe 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <p className="text-sm sm:text-base break-words">{msg.content}</p>
            </div>
          )}
          
          {msg.type === 'service_offer' && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <span className="material-icons text-blue-500 mr-1 text-sm">star</span>
                <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">Service proposé</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{msg.metadata?.serviceName}</p>
              <p className="text-primary-600 dark:text-primary-400 font-bold text-sm sm:text-base">
                {msg.metadata?.price?.toLocaleString()} {msg.metadata?.currency || 'FCFA'}
              </p>
              <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-600">
                Voir détails
              </button>
            </div>
          )}
          
          {msg.type === 'booking_request' && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <span className="material-icons text-green-500 mr-1 text-sm">event</span>
                <span className="font-medium text-green-900 dark:text-green-100 text-sm">Demande de réservation</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{msg.metadata?.serviceName}</p>
              <p className="text-green-600 dark:text-green-400 font-bold text-sm sm:text-base">
                {msg.metadata?.price?.toLocaleString()} {msg.metadata?.currency || 'FCFA'}
              </p>
              {!isMe && (
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 mt-3">
                  <button className="bg-green-500 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-600">
                    Accepter
                  </button>
                  <button className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-400 dark:hover:bg-gray-500">
                    Négocier
                  </button>
                </div>
              )}
            </div>
          )}
          
          {msg.type === 'location' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <span className="material-icons text-yellow-600 mr-1 text-sm">location_on</span>
                <span className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">Localisation</span>
              </div>
              <p className="text-gray-900 dark:text-white text-sm sm:text-base">{msg.metadata?.address}</p>
              <button className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-yellow-600">
                Voir sur la carte
              </button>
            </div>
          )}
          
          <p className={`text-xs mt-1 ${isMe ? 'text-right text-gray-400' : 'text-gray-500'}`}>
            {timestamp}
            {getReadStatusIcon()}
          </p>
        </div>
        
        {isMe && (
          <div className="w-6 sm:w-8 ml-2 flex-shrink-0" />
        )}
      </div>
    )
  }

  return (
    <ChatLayout>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
        {/* Chat Header - Mobile optimized */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/messages" className="mr-2 sm:mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="material-icons text-gray-600 dark:text-gray-400 text-xl">arrow_back</span>
            </Link>
            
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={finalChatUser.avatar || '/images/avatars/avatar.png'}
                  alt={finalChatUser.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              {finalChatUser.isOnline && isUserOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {finalChatUser.name}
                </h2>
                {finalChatUser.isVerified && (
                  <span className="material-icons text-blue-500 text-sm ml-1 flex-shrink-0">verified</span>
                )}
                {finalChatUser.isVip && (
                  <span className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">VIP</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {finalChatUser.servicePackages?.[0]?.name || 'Service disponible'}
              </p>
              <p className="text-xs text-gray-400 hidden sm:block">{finalChatUser.responseTime}</p>
            </div>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <span className="material-icons text-lg sm:text-xl">call</span>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <span className="material-icons text-lg sm:text-xl">videocam</span>
            </button>
            <button 
              onClick={handleMarkAllAsRead}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              title="Marquer tout comme lu"
            >
              <span className="material-icons text-lg sm:text-xl">done_all</span>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <span className="material-icons text-lg sm:text-xl">more_vert</span>
            </button>
          </div>
        </div>

        {/* Messages Area - Mobile optimized */}
        <div className="flex-1 overflow-y-auto p-3 pb-8 sm:p-4 sm:pb-8 bg-gray-50 dark:bg-gray-900 touch-scroll">
          {messagesToRender.map(renderMessage)}
          
          {isTyping && (
            <div className="flex justify-start mb-6 pb-2">
              <Image
                src={finalChatUser.avatar || '/images/avatars/avatar.png'}
                alt={finalChatUser.name}
                width={32}
                height={32}
                className="rounded-full mr-2 mt-1"
              />
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar - Mobile optimized */}
        {/* <div className="px-3 sm:px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={handleReservation}
              className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <span className="material-icons text-sm">event</span>
              <span>Réserver</span>
            </button>
            <button 
              onClick={handleLocation}
              className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <span className="material-icons text-sm">location_on</span>
              <span>Lieu</span>
            </button>
            <button 
              onClick={handleServices}
              className="flex items-center space-x-1 bg-purple-500 hover:bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <span className="material-icons text-sm">star</span>
              <span>Services</span>
            </button>
            <button 
              onClick={handleContact}
              className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <span className="material-icons text-sm">phone</span>
              <span>Contact</span>
            </button>
          </div>
        </div> */}

        {/* Message Input - Mobile optimized */}
        <div className="flex items-center p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button 
            onClick={handleAttachment}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-2 transition-colors"
          >
            <span className="material-icons text-lg">add</span>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Tapez votre message..."
              className="w-full px-3 sm:px-4 py-2.5 pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button 
              onClick={handleEmojiPicker}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="material-icons text-lg">emoji_emotions</span>
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10">
                <div className="grid grid-cols-6 gap-2 text-lg">
                  {['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🙏', '💋', '🔥', '💰', '📍', '⏰', '✅', '❌', '🎉', '💯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={sendMessage}
            disabled={!message.trim()}
            className="ml-2 w-10 h-10 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <span className="material-icons text-lg">send</span>
          </button>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Réservation rapide</h3>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="space-y-3">
                {finalChatUser.servicePackages && finalChatUser.servicePackages.length > 0 ? (
                  finalChatUser.servicePackages
                    .filter(pkg => pkg.isActive)
                    .map((servicePackage) => (
                      <button
                        key={servicePackage._id}
                        onClick={() => sendQuickBooking(servicePackage.name, servicePackage.price)}
                        className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">{servicePackage.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {servicePackage.price.toLocaleString()} {servicePackage.currency}
                          {servicePackage.duration && ` • ${servicePackage.duration}`}
                        </div>
                        {servicePackage.description && (
                          <div className="text-xs text-gray-400 mt-1">{servicePackage.description}</div>
                        )}
                      </button>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="material-icons text-4xl mb-2 block">info</span>
                    <p>Aucun service disponible pour l&apos;instant</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services Modal */}
        {showServicesModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services disponibles</h3>
                <button onClick={() => setShowServicesModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Escort Premium</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compagnie de luxe pour événements</p>
                </div>
                <div className="border-l-4 border-pink-500 pl-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Services intimes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moments privés et discrets</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Massage thérapeutique</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Détente et bien-être</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partager ma position</h3>
                <button onClick={() => setShowLocationModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => sendLocation('Centre-ville Abidjan')}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  📍 Centre-ville Abidjan
                </button>
                <button
                  onClick={() => sendLocation('Zone Cocody')}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  📍 Zone Cocody
                </button>
                <button
                  onClick={() => sendLocation('Marcory résidentiel')}
                  className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  📍 Marcory résidentiel
                </button>
                <button
                  onClick={() => sendLocation('Ma position actuelle')}
                  className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <span className="material-icons text-blue-500 text-sm mr-2">my_location</span>
                  Partager ma position actuelle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Options de contact</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                  <div className="flex items-center">
                    <span className="material-icons text-green-500 mr-3">call</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Appel téléphonique</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">+225 XX XX XX XX</div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                  <div className="flex items-center">
                    <span className="material-icons text-purple-500 mr-3">videocam</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Appel vidéo</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Vérification par vidéo</div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <div className="flex items-center">
                    <span className="material-icons text-blue-500 mr-3">info</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Voir le profil</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Plus d&apos;informations</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  )
}

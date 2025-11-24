import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import apiClient from '@/lib/axios'
import { io, Socket } from 'socket.io-client'
import { getAuthToken } from '@/utils/cookies'

// Types for messaging
interface Message {
  _id: string
  id?: string
  conversationId: string
  senderId: string | {
    _id: string
    id?: string
    name: string
    avatar?: string
    isPremium?: boolean
    isVerified?: boolean
    [key: string]: unknown
  }
  content: string
  createdAt: string
  updatedAt?: string
  type: 'text' | 'image' | 'file' | 'service_offer' | 'booking_request' | 'location'
  metadata?: {
    servicePackageId?: string
    serviceName?: string
    price?: number
    currency?: string
    duration?: string
    note?: string
    fileName?: string
    fileUrl?: string
    fileSize?: number
    mimeType?: string
    latitude?: number
    longitude?: number
    address?: string
    requestedDate?: string
    requestedTime?: string
  }
  readBy: Record<string, string>
  reactions?: Array<{
    userId: string
    emoji: string
    createdAt: string
  }>
  replyToId?: string | null
  editedAt?: string | null
  isForwarded?: boolean
  reactionTypes?: Record<string, unknown>
  deletedFor?: string[]
}

// API Response types
interface MarkAsReadResponse {
  success: boolean
  error?: string
}

interface BulkMarkAsReadResponse {
  success: boolean
  markedCount: number
  error?: string
}

interface ChatUser {
  _id: string
  id?: string
  name: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
  isVerified?: boolean
  isPremium?: boolean
  isVip?: boolean
  servicePackages?: Array<{
    _id: string
    name: string
    price: number
    currency: string
    duration?: string
    description?: string
    isActive?: boolean
  }>
  location?: string
  responseTime?: string
}

interface Conversation {
  _id: string
  participants: string[] | ChatUser[] // Can be either IDs or full user objects depending on endpoint
  participantDetails?: ChatUser[]
  type: 'direct' | 'group'
  lastMessage?: string
  lastMessageAt: string
  lastMessageDetails?: Message[]
  unreadCounts?: Record<string, number> // User ID -> unread count
  isActive?: boolean
  isArchived?: boolean
  archivedBy?: Record<string, boolean>
  deletedBy?: Record<string, boolean>
  createdAt: string
  updatedAt?: string
  __v?: number
}

interface MessagingState {
  // State
  socket: Socket | null
  conversations: Conversation[]
  messages: Record<string, Message[]> // conversationId -> messages
  typingUsers: Set<string>
  onlineUsers: Set<string>
  loading: boolean
  error: string | null
  currentConversationId: string | null // Track which conversation user is currently viewing
  
  // Actions
  setSocket: (socket: Socket | null) => void
  initializeSocket: () => void
  cleanupSocket: () => void
  
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  prependMessages: (conversationId: string, messages: Message[]) => void
  
  setTypingUsers: (users: Set<string>) => void
  addTypingUser: (userId: string) => void
  removeTypingUser: (userId: string) => void
  
  setOnlineUsers: (users: Set<string>) => void
  addOnlineUser: (userId: string) => void
  removeOnlineUser: (userId: string) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Current conversation management
  setCurrentConversation: (conversationId: string | null) => void
  getCurrentConversation: () => string | null
  
  // Socket functions
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  markAsRead: (conversationId: string, messageId: string) => void
  
  // Additional socket functions from documentation
  sendSocketMessage: (conversationId: string, message: { content: string; type: string }) => void
  updateUserOnlineStatus: (isOnline: boolean, lastSeen?: Date) => void
  
  // Unread count management
  resetUnreadCount: (conversationId: string, userId?: string) => void
  
  // Mark as read API functions
  markMessageAsRead: (messageId: string) => Promise<boolean>
  markConversationAsRead: (conversationId: string, messageIds: string[]) => Promise<{ success: boolean; markedCount: number }>
  markAllMessagesAsRead: (conversationId: string) => Promise<{ success: boolean; markedCount: number }>
  
  // Auto mark as read when user opens conversation
  autoMarkConversationAsRead: (conversationId: string) => Promise<void>
  
  // Helper functions
  getTypingUsersInConversation: (conversationId: string, excludeUserId?: string) => string[]
  isUserOnline: (userId: string) => boolean
  getCurrentUserId: () => string | null
  getUnreadMessagesInConversation: (conversationId: string, userId?: string) => Message[]
  
  // API Actions
  fetchConversations: (params?: {
    page?: number
    limit?: number
    search?: string
    type?: 'direct' | 'group'
    archived?: boolean
  }) => Promise<void>
  
  fetchMessages: (conversationId: string, params?: {
    page?: number
    limit?: number
    before?: string
    after?: string
  }) => Promise<void>
  
  sendMessage: (conversationId: string, content: string, options?: {
    replyToId?: string
    isForwarded?: boolean
    forwardedFromId?: string
  }) => Promise<Message | null>
  
  createConversation: (data: {
    participantIds: string[]
    type: 'direct' | 'group'
    groupName?: string
    groupAvatar?: string
  }) => Promise<Conversation | null>
  
  getConversationDetails: (conversationId: string) => Promise<Conversation | null>
}

export const useMessagingStore = create<MessagingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    conversations: [],
    messages: {},
    typingUsers: new Set(),
    onlineUsers: new Set(),
    loading: false,
    error: null,
    currentConversationId: null,

    // Socket management
    setSocket: (socket) => set({ socket }),
    
    initializeSocket: () => {
      const token = getAuthToken()
      const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
      
      if (!token || !websocketUrl) return

      // Connect to the /chat namespace as specified in documentation
      const socketUrl = `${websocketUrl}/chat`

      const newSocket = io(socketUrl, {
        auth: { token },
        autoConnect: true,
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: 20000,
      })

      newSocket.on('connect', () => {
        set({ socket: newSocket, error: null })
        
        // Send online status when connecting to the app (not in any specific conversation)
        setTimeout(() => {
          const currentConversationId = get().getCurrentConversation()
          if (!currentConversationId) {
            get().updateUserOnlineStatus(true)
          }
        }, 1000) // Small delay to ensure socket is fully connected
      })

      newSocket.on('disconnect', () => {
        set({ socket: null })
      })

      newSocket.on('connect_error', () => {
        set({ error: 'Connection failed. Please check your internet connection.' })
      })

      // Message events (matching documentation)
      newSocket.on('new_message', (data: { conversationId: string; message: Message }) => {
        get().addMessage(data.conversationId, data.message)
        
        // Get current user ID to check if they are the sender
        const currentUserId = get().getCurrentUserId()
        const currentConversationId = get().getCurrentConversation()
        const senderIdValue = typeof data.message.senderId === 'string' ? data.message.senderId : data.message.senderId._id
        
        // If the message is not from the current user
        if (currentUserId && senderIdValue !== currentUserId) {
          // If user is currently viewing this conversation, mark message as read automatically
          if (currentConversationId === data.conversationId) {
            get().markAsRead(data.conversationId, data.message._id || data.message.id!)
            
            // Also update local state immediately for better UX
            get().updateMessage(data.conversationId, data.message._id || data.message.id!, {
              readBy: { 
                ...data.message.readBy || {}, 
                [currentUserId]: new Date().toISOString() 
              }
            })
          } else {
            // User is not in this conversation, increment unread count
            const conversations = get().conversations
            const conversation = conversations.find(c => c._id === data.conversationId)
            
            if (conversation) {
              const currentUnreadCount = conversation.unreadCounts?.[currentUserId] || 0
              get().updateConversation(data.conversationId, {
                unreadCounts: {
                  ...conversation.unreadCounts,
                  [currentUserId]: currentUnreadCount + 1
                }
              })
            }
          }
        }
        
        // Update conversation last message
        get().updateConversation(data.conversationId, {
          lastMessage: data.message.content,
          lastMessageAt: data.message.createdAt
        })
      })

      newSocket.on('message_updated', (data: { conversationId: string; message: Message }) => {
        get().updateMessage(data.conversationId, data.message._id || data.message.id!, data.message)
      })

      newSocket.on('new_conversation', (data: { conversation: Conversation }) => {
        get().addConversation(data.conversation)
      })

      newSocket.on('message_received', (data: { message: Message; conversationId: string }) => {
        // Note: This event might be redundant with 'new_message' - only add message without counting logic
        get().addMessage(data.conversationId, data.message)
        
        // Update conversation last message
        get().updateConversation(data.conversationId, {
          lastMessage: data.message.content,
          lastMessageAt: data.message.createdAt
        })
      })

      newSocket.on('user_typing', (data: { conversationId: string; userId: string; isTyping: boolean; user?: ChatUser }) => {
        const typingKey = `${data.userId}-${data.conversationId}`
        if (data.isTyping) {
          get().addTypingUser(typingKey)
        } else {
          get().removeTypingUser(typingKey)
        }
      })

      newSocket.on('message_read', (data: { messageId: string; conversationId: string; readBy: string; readAt: Date }) => {
        get().updateMessage(data.conversationId, data.messageId, {
          readBy: { ...get().messages[data.conversationId]?.find(m => m._id === data.messageId)?.readBy || {}, [data.readBy]: data.readAt.toString() }
        })
        
        // Reset unread count for the user who read the message
        get().resetUnreadCount(data.conversationId, data.readBy)
      })

      newSocket.on('user_online_status', (data: { userId: string; isOnline: boolean; lastSeen: Date }) => {
        if (data.isOnline) {
          get().addOnlineUser(data.userId)
        } else {
          get().removeOnlineUser(data.userId)
        }
      })

      newSocket.on('conversation_updated', (data: { conversationId: string; lastMessage: string; lastMessageAt: Date }) => {
        get().updateConversation(data.conversationId, {
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt.toString()
        })
      })

      set({ socket: newSocket })
    },

    cleanupSocket: () => {
      const { socket } = get()
      if (socket) {
        socket.close()
        set({ socket: null })
      }
    },

    // Socket functions (matching documentation)
    joinConversation: (conversationId: string) => {
      const { socket } = get()
      
      // Set current conversation
      get().setCurrentConversation(conversationId)
      
      // Join the conversation room
      socket?.emit('join_conversation', { conversationId })
      
      // When entering a conversation, send offline status (user is busy in conversation)
      // get().updateUserOnlineStatus(false)
    },

    leaveConversation: (conversationId: string) => {
      const { socket } = get()
      
      // Clear current conversation
      get().setCurrentConversation(null)
      
      // Leave the conversation room
      socket?.emit('leave_conversation', { conversationId })
      
      // When leaving conversation, send online status (user is back in app)
      get().updateUserOnlineStatus(true)
    },

    startTyping: (conversationId: string) => {
      const { socket } = get()
      socket?.emit('typing_start', { conversationId })
    },

    stopTyping: (conversationId: string) => {
      const { socket } = get()
      socket?.emit('typing_stop', { conversationId })
    },

    markAsRead: (conversationId: string, messageId: string) => {
      const { socket } = get()
      socket?.emit('mark_read', { messageId, conversationId })
    },

    // Additional socket functions from documentation
    sendSocketMessage: (conversationId: string, message: { content: string; type: string }) => {
      const { socket } = get()
      socket?.emit('send_message', { conversationId, message })
    },

    updateUserOnlineStatus: (isOnline: boolean, lastSeen?: Date) => {
      const { socket } = get()
      socket?.emit('user_online', { isOnline, lastSeen })
    },

    // Unread count management
    resetUnreadCount: (conversationId: string, userId?: string) => {
      const { conversations } = get()
      const conversation = conversations.find(c => c._id === conversationId)
      if (conversation?.unreadCounts && userId) {
        get().updateConversation(conversationId, {
          unreadCounts: {
            ...conversation.unreadCounts,
            [userId]: 0
          }
        })
      }
    },

    // Helper functions
    getTypingUsersInConversation: (conversationId: string, excludeUserId?: string) => {
      const { typingUsers } = get()
      const typingInConv: string[] = []
      
      typingUsers.forEach(userConv => {
        const [userId, convId] = userConv.split('-')
        if (convId === conversationId && userId !== excludeUserId) {
          typingInConv.push(userId)
        }
      })
      
      return typingInConv
    },

    isUserOnline: (userId: string) => {
      const { onlineUsers } = get()
      return onlineUsers.has(userId)
    },

    getCurrentUserId: () => {
      // You might need to implement this based on your auth system
      // For now, we'll try to decode the JWT token to get user ID
      const token = getAuthToken()
      if (!token) return null
      
      try {
        // Basic JWT decode (just for getting user ID - not for security validation)
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.userId || payload.id || payload.sub || null
      } catch {
        return null
      }
    },

    getUnreadMessagesInConversation: (conversationId: string, userId?: string) => {
      const { messages } = get()
      const currentUserId = userId || get().getCurrentUserId()
      
      if (!currentUserId) return []
      
      const conversationMessages = messages[conversationId] || []
      return conversationMessages.filter(msg => {
        // Message is unread if current user is not in readBy or readBy is empty
        return !msg.readBy || !msg.readBy[currentUserId]
      })
    },

    // State setters
    setConversations: (conversations) => set({ conversations }),
    
    addConversation: (conversation) => set((state) => ({
      conversations: [conversation, ...state.conversations]
    })),
    
    updateConversation: (conversationId, updates) => set((state) => ({
      conversations: state.conversations.map(conv => 
        conv._id === conversationId ? { ...conv, ...updates } : conv
      )
    })),
    
    setMessages: (conversationId, messages) => set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages
      }
    })),
    
    addMessage: (conversationId, message) => {
      set((state) => {
        const existingMessages = state.messages[conversationId] || []
        
        // Check if message already exists to avoid duplicates
        const messageExists = existingMessages.some(m => m._id === message._id || m.id === message.id)
        if (messageExists) {
          return state
        }
        
        const newMessages = [...existingMessages, message]
        
        return {
          messages: {
            ...state.messages,
            [conversationId]: newMessages
          }
        }
      })
    },
    
    updateMessage: (conversationId, messageId, updates) => set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(msg =>
          (msg._id === messageId || msg.id === messageId) ? { ...msg, ...updates } : msg
        )
      }
    })),
    
    prependMessages: (conversationId, messages) => set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...messages, ...(state.messages[conversationId] || [])]
      }
    })),
    
    setTypingUsers: (users) => set({ typingUsers: users }),
    addTypingUser: (userId) => set((state) => {
      const newSet = new Set(state.typingUsers)
      newSet.add(userId)
      return { typingUsers: newSet }
    }),
    removeTypingUser: (userId) => set((state) => {
      const newSet = new Set(state.typingUsers)
      newSet.delete(userId)
      return { typingUsers: newSet }
    }),
    
    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addOnlineUser: (userId) => set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.add(userId)
      return { onlineUsers: newSet }
    }),
    removeOnlineUser: (userId) => set((state) => {
      const newSet = new Set(state.onlineUsers)
      newSet.delete(userId)
      return { onlineUsers: newSet }
    }),
    
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Current conversation management
    setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),
    getCurrentConversation: () => get().currentConversationId,

    // API Actions
    fetchConversations: async (params = {}) => {
      try {
        set({ loading: true, error: null })
        
        const queryParams = new URLSearchParams({
          page: (params.page || 1).toString(),
          limit: (params.limit || 20).toString(),
          ...(params.search && { search: params.search }),
          ...(params.type && { type: params.type }),
          ...(params.archived !== undefined && { archived: params.archived.toString() })
        })

        const response = await apiClient.get(`/conversations?${queryParams}`)
        
        // Handle different response formats
        let conversations: Conversation[] = []
        const responseData = response.data as Record<string, unknown>
        if (responseData.conversations && Array.isArray(responseData.conversations)) {
          conversations = responseData.conversations as Conversation[]
        } else if (Array.isArray(responseData)) {
          conversations = responseData as Conversation[]
        } else if (responseData.data && Array.isArray(responseData.data)) {
          conversations = responseData.data as Conversation[]
        }
        
        set({ conversations, loading: false })
      } catch (error: unknown) {
        set({ 
          error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch conversations',
          loading: false 
        })
      }
    },

    fetchMessages: async (conversationId, params = {}) => {
      try {
        set({ loading: true, error: null })
        
        const queryParams = new URLSearchParams({
          page: (params.page || 1).toString(),
          limit: (params.limit || 50).toString(),
          ...(params.before && { before: params.before }),
          ...(params.after && { after: params.after })
        })

        const response = await apiClient.get(`/conversations/${conversationId}/messages?${queryParams}`)
        
        // Handle different response formats
        let messages: Message[] = []
        const responseData = response.data as Record<string, unknown>
        if (responseData.messages && Array.isArray(responseData.messages)) {
          messages = responseData.messages as Message[]
        } else if (Array.isArray(responseData)) {
          messages = responseData as Message[]
        } else if (responseData.data && typeof responseData.data === 'object' && responseData.data !== null) {
          const dataObj = responseData.data as Record<string, unknown>
          if (dataObj.messages && Array.isArray(dataObj.messages)) {
            messages = dataObj.messages as Message[]
          }
        }
        
        get().setMessages(conversationId, messages)
        set({ loading: false })
      } catch (error: unknown) {
        set({ 
          error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch messages',
          loading: false 
        })
      }
    },

    sendMessage: async (conversationId, content, options = {}) => {
      try {
        const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
          content,
          ...options
        })
        
        // The API returns the message directly (not wrapped)
        const message: Message = response.data as Message
        
        // Add the message to local state immediately
        get().addMessage(conversationId, message)
        
        // Update the conversation's last message
        get().updateConversation(conversationId, {
          lastMessage: content,
          lastMessageAt: message.createdAt
        })
        
        return message
      } catch (error: unknown) {
        set({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send message' })
        return null
      }
    },

    createConversation: async (data) => {
      try {
        set({ loading: true, error: null })
        
        const response = await apiClient.post('/conversations', data)
        const conversation: Conversation = response.data as Conversation
        
        get().addConversation(conversation)
        set({ loading: false })
        
        return conversation
      } catch (error: unknown) {
        set({ 
          error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create conversation',
          loading: false 
        })
        return null
      }
    },

    getConversationDetails: async (conversationId) => {
      try {
        const response = await apiClient.get(`/conversations/${conversationId}`)
        const conversation: Conversation = response.data as Conversation
        
        // Update the conversation in our store
        get().updateConversation(conversationId, conversation)
        
        return conversation
      } catch (error: unknown) {
        set({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to get conversation details' })
        return null
      }
    },

    // Mark as read API functions
    markMessageAsRead: async (messageId: string) => {
      try {
        const response = await apiClient.post<MarkAsReadResponse>(`/messages/${messageId}/read`)
        return response.data?.success || false
      } catch (error: unknown) {
        // Handle specific error codes
        const status = (error as { response?: { status?: number } }).response?.status
        if (status === 401) {
          // Token expired - redirect to login might be handled by axios interceptor
          set({ error: 'Session expired. Please login again.' })
        } else if (status === 403) {
          set({ error: 'Access denied. You are not part of this conversation.' })
        } else if (status === 404) {
          set({ error: 'Message not found. It may have been deleted.' })
        } else {
          set({ error: 'Failed to mark message as read. Please try again.' })
        }
        return false
      }
    },

    markConversationAsRead: async (conversationId: string, messageIds: string[]) => {
      try {
        const response = await apiClient.post<BulkMarkAsReadResponse>(`/conversations/${conversationId}/messages/bulk-mark-read`, {
          messageIds
        })
        
        if (response.data?.success) {
          return {
            success: true,
            markedCount: response.data.markedCount || messageIds.length
          }
        }
        
        return { success: false, markedCount: 0 }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } }).response?.status
        if (status === 401) {
          set({ error: 'Session expired. Please login again.' })
        } else if (status === 403) {
          set({ error: 'Access denied. You are not part of this conversation.' })
        } else {
          set({ error: 'Failed to mark messages as read. Please try again.' })
        }
        
        return { success: false, markedCount: 0 }
      }
    },

    markAllMessagesAsRead: async (conversationId: string) => {
      try {
        // Get all unread messages in the conversation
        const conversationMessages = get().messages[conversationId] || []
        
        // We need to get current user ID - this would typically come from auth context
        // For now, we'll get all message IDs and let the server determine which are unread
        const allMessageIds = conversationMessages.map(msg => msg._id || msg.id!)
        
        if (allMessageIds.length === 0) {
          return { success: true, markedCount: 0 }
        }
        
        return get().markConversationAsRead(conversationId, allMessageIds)
      } catch {
        set({ error: 'Failed to mark all messages as read. Please try again.' })
        return { success: false, markedCount: 0 }
      }
    },

    autoMarkConversationAsRead: async (conversationId: string) => {
      try {
        const currentUserId = get().getCurrentUserId()
        if (!currentUserId) return
        
        // Get unread messages for current user
        const unreadMessages = get().getUnreadMessagesInConversation(conversationId, currentUserId)
        
        if (unreadMessages.length === 0) return
        
        // Extract message IDs
        const unreadMessageIds = unreadMessages.map(msg => msg._id || msg.id!)
        
        // Use bulk mark as read API
        const result = await get().markConversationAsRead(conversationId, unreadMessageIds)
        
        if (result.success) {
          // Update local state immediately for better UX
          const currentTime = new Date().toISOString()
          unreadMessageIds.forEach(messageId => {
            get().updateMessage(conversationId, messageId, {
              readBy: { 
                ...get().messages[conversationId]?.find(m => m._id === messageId || m.id === messageId)?.readBy || {}, 
                [currentUserId]: currentTime 
              }
            })
          })
          
          // Reset unread count for current user
          get().resetUnreadCount(conversationId, currentUserId)
        }
      } catch {
        // Don't show error to user for auto-mark operations
      }
    }
  }))
)

export type { Message, ChatUser, Conversation, MessagingState }

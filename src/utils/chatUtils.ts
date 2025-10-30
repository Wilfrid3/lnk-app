import { NextRouter } from 'next/router'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import apiClient from '@/lib/axios'

/**
 * Global chat utilities for handling messaging functionality across the app
 */

interface User {
  id?: string
  _id?: string
  // Allow any additional properties to handle different User types across the app
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface ChatParticipant {
  _id?: string
  id?: string
}

interface ChatConversation {
  _id: string
  type: 'direct' | 'group'
  participants: ChatParticipant[]
}

interface ChatOptions {
  router: NextRouter | AppRouterInstance
  currentUser?: User | null
  targetUserId: string
  redirectToAuth?: boolean
}

/**
 * Helper function to find existing conversation
 */
const findExistingConversation = (conversations: ChatConversation[], targetUserId: string): ChatConversation | undefined => {
  return conversations.find(conv => {
    // Only check direct conversations
    if (conv.type !== 'direct') return false
    
    // Check if any participant matches the target user ID
    return conv.participants.some(p => {
      const participantId = p._id || p.id
      return participantId === targetUserId
    })
  })
}

interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Track ongoing navigation requests to prevent duplicates
const ongoingNavigations = new Set<string>()

/**
 * Helper function to create new conversation
 */
const createNewConversation = async (targetUserId: string) => {
  const response = await apiClient.post('/conversations', {
    participants: [targetUserId], // Only send target user ID, API will add current user from token
    type: 'direct'
  })

  // Handle different response structures
  const data = response.data as ApiResponse<ChatConversation> | ChatConversation
  if ('data' in data && data.data) {
    return data.data // If response is wrapped in { data: conversation }
  }
  return data as ChatConversation // If response is direct conversation object
}

/**
 * Helper function to fetch conversations
 */
const fetchConversations = async (): Promise<ChatConversation[]> => {
  const response = await apiClient.get('/conversations')
  // API returns { conversations: [...], pagination: {...} }
  return (response.data as { conversations: ChatConversation[] }).conversations || []
}

/**
 * Handles chat navigation with authentication check
 * Creates or navigates to a conversation with the target user
 */
export const handleChatNavigation = async ({
  router,
  currentUser,
  targetUserId,
  redirectToAuth = true
}: ChatOptions) => {
  // Check if user is authenticated
  if (!currentUser) {
    if (redirectToAuth) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
    }
    return false
  }

  // Don't allow messaging yourself
  if (currentUser?.id === targetUserId || currentUser?._id === targetUserId) {
    return false
  }

  // Prevent duplicate requests
  const navigationKey = `${currentUser?.id || currentUser?._id}-${targetUserId}`
  if (ongoingNavigations.has(navigationKey)) {
    return false
  }

  const currentUserId = currentUser?.id || currentUser?._id
  if (!currentUserId) {
    return false
  }

  try {
    // Mark navigation as ongoing
    ongoingNavigations.add(navigationKey)

    // Try to find existing conversation first
    const conversations = await fetchConversations()
    const existingConversation = findExistingConversation(conversations, targetUserId)

    if (existingConversation) {
      // Navigate to existing conversation with proper ID
      router.push(`/messages/${existingConversation._id}`)
      return true
    }

    // Create new conversation if none exists
    const newConversation = await createNewConversation(targetUserId)

    // Navigate to new conversation
    router.push(`/messages/${newConversation._id}`)
    return true
  } catch {
    // Instead of fallback to user-based navigation, try direct navigation to user
    // This allows ChatView to handle conversation creation if needed
    router.push(`/messages/${targetUserId}`)
    return false
  } finally {
    // Remove from ongoing navigations after a delay
    setTimeout(() => {
      ongoingNavigations.delete(navigationKey)
    }, 2000) // 2 second cooldown
  }
}

/**
 * Alternative approach: Create conversation first, then navigate
 * Use this if you want to ensure the conversation exists before navigation
 */
export const handleChatWithConversationCreation = async ({
  router,
  currentUser,
  targetUserId,
  redirectToAuth = true
}: ChatOptions) => {
  // Check if user is authenticated
  if (!currentUser) {
    if (redirectToAuth) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
    }
    return false
  }

  // Don't allow messaging yourself
  if (currentUser?.id === targetUserId || currentUser?._id === targetUserId) {
    return false
  }

  try {
    // Import the messaging hook or API client here if needed
    // For now, we'll use the direct navigation approach
    // The messages page can handle conversation creation if needed
    
    // Navigate to messages with target user
    router.push(`/messages/${targetUserId}`)
    return true
  } catch {
    return false
  }
}

/**
 * Hook for components that need chat functionality
 */
export const useChatHandler = (router: NextRouter | AppRouterInstance, currentUser?: User | null) => {
  const handleChat = (targetUserId: string, redirectToAuth = true) => {
    return handleChatNavigation({
      router,
      currentUser,
      targetUserId,
      redirectToAuth
    })
  }

  const handleChatWithCreation = (targetUserId: string, redirectToAuth = true) => {
    return handleChatWithConversationCreation({
      router,
      currentUser,
      targetUserId,
      redirectToAuth
    })
  }

  return {
    handleChat,
    handleChatWithCreation,
    canChat: !!currentUser
  }
}

/**
 * Utility to check if chat is available
 */
export const isChatAvailable = (currentUser?: User | null, targetUserId?: string) => {
  if (!currentUser || !targetUserId) return false
  if (currentUser?.id === targetUserId || currentUser?._id === targetUserId) return false
  return true
}

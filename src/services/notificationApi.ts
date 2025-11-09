import apiClient from '@/lib/axios'

export interface SendNotificationRequest {
  title: string
  body: string
  url?: string
  userIds?: string[]
  icon?: string
  badge?: string
}

export interface NotificationSubscription {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
  isActive: boolean
  createdAt: string
  lastUsed: string
}

export interface SubscriptionResponse {
  successful: number
  failed: number
  total: number
}

class NotificationApiService {
  /**
   * Subscribe to push notifications
   */
  async subscribe(subscriptionData: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
    userAgent?: string
  }) {
    const response = await apiClient.post('/notifications/subscribe', subscriptionData)
    return response.data
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(endpoint?: string) {
    const response = await apiClient.post('/notifications/unsubscribe', {
      endpoint
    })
    return response.data
  }

  /**
   * Send custom notification (admin only)
   */
  async sendNotification(notification: SendNotificationRequest): Promise<SubscriptionResponse> {
    const response = await apiClient.post('/notifications/send', notification)
    return response.data as SubscriptionResponse
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(): Promise<NotificationSubscription[]> {
    const response = await apiClient.get('/notifications/subscriptions')
    return response.data as NotificationSubscription[]
  }

  /**
   * Get subscription count
   */
  async getSubscriptionCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/notifications/subscriptions/count')
    return response.data as { count: number }
  }

  /**
   * Send test welcome notification
   */
  async sendTestWelcomeNotification() {
    const response = await apiClient.post('/notifications/test/welcome')
    return response.data
  }

  /**
   * Quick notification methods for common use cases
   */
  async sendWelcomeNotification(userId?: string) {
    return this.sendNotification({
      title: '🎉 Bienvenue sur yamohub !',
      body: 'Votre profil est maintenant actif. Commencez à explorer !',
      icon: '/icons/welcome-icon.png', // Use welcome-specific icon
      url: '/trending',
      userIds: userId ? [userId] : undefined,
    })
  }

  async sendMessageNotification(receiverUserId: string, senderName: string, messagePreview: string) {
    return this.sendNotification({
      title: `💬 Nouveau message de ${senderName}`,
      body: messagePreview,
      icon: '/icons/message-icon.png', // Use message-specific icon
      url: '/messages',
      userIds: [receiverUserId],
    })
  }

  async sendLikeNotification(postOwnerId: string, likerName: string, postTitle: string) {
    return this.sendNotification({
      title: `❤️ ${likerName} a aimé votre post`,
      body: postTitle,
      icon: '/icons/like-icon.png', // Use like-specific icon
      url: '/posts',
      userIds: [postOwnerId],
    })
  }

  async sendCommentNotification(
    postOwnerId: string, 
    commenterName: string, 
    commentPreview: string, 
    postTitle: string
  ) {
    return this.sendNotification({
      title: `💬 ${commenterName} a commenté`,
      body: `"${commentPreview}" sur "${postTitle}"`,
      icon: '/icons/comment-icon.png', // Use comment-specific icon
      url: '/posts',
      userIds: [postOwnerId],
    })
  }

  async sendReEngagementNotification(userIds: string[]) {
    const messages = [
      { 
        title: '🔥 Votre communauté vous manque !', 
        body: 'Découvrez les nouveaux profils dans votre zone' 
      },
      { 
        title: '✨ Nouveautés disponibles', 
        body: 'De nouvelles fonctionnalités vous attendent' 
      },
      { 
        title: '💕 Vos matchs vous attendent', 
        body: 'Quelqu\'un attend peut-être votre message' 
      },
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    return this.sendNotification({
      ...randomMessage,
      url: '/trending',
      userIds,
    })
  }

  async sendPromotionalNotification(
    title: string, 
    body: string, 
    url: string, 
    userIds?: string[]
  ) {
    return this.sendNotification({
      title,
      body,
      url,
      userIds,
    })
  }
}

export const notificationApi = new NotificationApiService()
export default notificationApi

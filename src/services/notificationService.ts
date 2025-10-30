interface NotificationPayload {
  title: string
  body: string
  icon?: string
  url?: string
  userIds?: string[] | 'all'
  scheduledFor?: string
}

export class NotificationService {
  /**
   * Send a welcome notification to new users
   */
  static async sendWelcomeNotification(userId: string) {
    return this.sendNotification({
      title: 'Bienvenue sur YamoZone ! 🎉',
      body: 'Découvrez des profils incroyables près de chez vous',
      icon: '/icons/welcome.png',
      url: '/',
      userIds: [userId]
    })
  }

  /**
   * Send new message notification
   */
  static async sendNewMessageNotification(userId: string, senderName: string) {
    return this.sendNotification({
      title: 'Nouveau message 💬',
      body: `${senderName} vous a envoyé un message`,
      icon: '/icons/message.png',
      url: '/messages',
      userIds: [userId]
    })
  }

  /**
   * Send new like notification
   */
  static async sendNewLikeNotification(userId: string, likerName: string) {
    return this.sendNotification({
      title: 'Nouveau like ❤️',
      body: `${likerName} a liké votre profil`,
      icon: '/icons/heart.png',
      url: '/profile',
      userIds: [userId]
    })
  }

  /**
   * Send new comment notification
   */
  static async sendNewCommentNotification(userId: string, commenterName: string, postType: 'post' | 'video') {
    return this.sendNotification({
      title: 'Nouveau commentaire 💭',
      body: `${commenterName} a commenté votre ${postType === 'post' ? 'publication' : 'vidéo'}`,
      icon: '/icons/comment.png',
      url: '/profile/posts',
      userIds: [userId]
    })
  }

  /**
   * Send profile view notification
   */
  static async sendProfileViewNotification(userId: string, viewerName: string) {
    return this.sendNotification({
      title: 'Profil consulté 👀',
      body: `${viewerName} a consulté votre profil`,
      icon: '/icons/eye.png',
      url: '/profile',
      userIds: [userId]
    })
  }

  /**
   * Send re-engagement notification to inactive users
   */
  static async sendReEngagementNotification(userIds: string[]) {
    const messages = [
      {
        title: 'Vous nous manquez ! 😊',
        body: 'Découvrez ce qui s\'est passé pendant votre absence'
      },
      {
        title: 'Nouveaux profils disponibles ! ✨',
        body: 'De nouveaux utilisateurs vous attendent'
      },
      {
        title: 'Revenez voir vos matchs ! 💕',
        body: 'Quelqu\'un attend peut-être votre message'
      }
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    return this.sendNotification({
      title: randomMessage.title,
      body: randomMessage.body,
      icon: '/icons/comeback.png',
      url: '/',
      userIds
    })
  }

  /**
   * Send promotional notification
   */
  static async sendPromotionalNotification(title: string, body: string, url?: string, userIds?: string[]) {
    return this.sendNotification({
      title,
      body,
      icon: '/icons/promo.png',
      url: url || '/',
      userIds: userIds || 'all'
    })
  }

  /**
   * Send scheduled notification (for campaigns)
   */
  static async scheduleNotification(payload: NotificationPayload, scheduledFor: Date) {
    return this.sendNotification({
      ...payload,
      scheduledFor: scheduledFor.toISOString()
    })
  }

  /**
   * Core method to send notifications
   */
  private static async sendNotification(payload: NotificationPayload) {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification')
      }

      console.log('Notification sent successfully:', result)
      return result
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }
}

// Notification triggers - examples of when to send notifications
export const notificationTriggers = {
  // User activity triggers
  onUserRegistration: (userId: string) => {
    NotificationService.sendWelcomeNotification(userId)
  },

  onMessageReceived: (userId: string, senderName: string) => {
    NotificationService.sendNewMessageNotification(userId, senderName)
  },

  onProfileLiked: (userId: string, likerName: string) => {
    NotificationService.sendNewLikeNotification(userId, likerName)
  },

  onPostCommented: (userId: string, commenterName: string, postType: 'post' | 'video') => {
    NotificationService.sendNewCommentNotification(userId, commenterName, postType)
  },

  onProfileViewed: (userId: string, viewerName: string) => {
    NotificationService.sendProfileViewNotification(userId, viewerName)
  },

  // Re-engagement triggers (run via cron jobs)
  onInactiveUsers: (inactiveUserIds: string[]) => {
    NotificationService.sendReEngagementNotification(inactiveUserIds)
  },

  // Marketing triggers
  onPromotion: (title: string, body: string, url?: string, targetUsers?: string[]) => {
    NotificationService.sendPromotionalNotification(title, body, url, targetUsers)
  }
}

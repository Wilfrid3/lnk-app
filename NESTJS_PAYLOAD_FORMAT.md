# 🔧 Nest.js Notification Payload Format

## 📤 Correct Payload Format

Your Nest.js backend should send the notification payload as a **JSON string**, not as a plain object.

### ✅ **Correct Implementation in Nest.js:**

```typescript
// In your Nest.js NotificationsService
import * as webpush from 'web-push';

async sendNotification(notificationDto: SendNotificationDto) {
  // Create the payload as a JSON object
  const payload = {
    title: notificationDto.title,
    body: notificationDto.body,
    icon: notificationDto.icon || '/icons/icon-192x192.svg',
    badge: notificationDto.badge || '/icons/badge-72x72.svg',
    url: notificationDto.url || '/',
    data: {
      type: 'custom', // Add notification type for grouping
      timestamp: Date.now(),
      ...notificationDto.data // Any additional data
    }
  };

  // Convert to JSON string - THIS IS IMPORTANT!
  const payloadString = JSON.stringify(payload);
  
  // Send to each subscription
  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payloadString // Send as JSON string
        );
        return { success: true, subscriptionId: subscription.id };
      } catch (error) {
        console.error(`Failed to send notification:`, error);
        return { success: false, subscriptionId: subscription.id, error };
      }
    })
  );
  
  return results;
}
```

### 🎯 **Specific Notification Examples:**

#### Welcome Notification:
```typescript
const welcomePayload = JSON.stringify({
  title: '🎉 Bienvenue sur YamoZone !',
  body: 'Votre profil est maintenant actif. Commencez à explorer !',
  icon: '/icons/welcome-icon.png',
  badge: '/icons/badge-72x72.svg',
  url: '/trending',
  data: {
    type: 'welcome',
    userId: userId
  }
});
```

#### Message Notification:
```typescript
const messagePayload = JSON.stringify({
  title: `💬 Nouveau message de ${senderName}`,
  body: messagePreview,
  icon: '/icons/message-icon.png',
  badge: '/icons/badge-72x72.svg',
  url: '/messages',
  data: {
    type: 'message',
    messageId: messageId,
    senderId: senderId
  }
});
```

#### Like Notification:
```typescript
const likePayload = JSON.stringify({
  title: `❤️ ${likerName} a aimé votre post`,
  body: postTitle,
  icon: '/icons/like-icon.png',
  badge: '/icons/badge-72x72.svg',
  url: `/posts/${postId}`,
  data: {
    type: 'like',
    postId: postId,
    likerId: likerId
  }
});
```

#### Comment Notification:
```typescript
const commentPayload = JSON.stringify({
  title: `💬 ${commenterName} a commenté`,
  body: `"${commentPreview}" sur "${postTitle}"`,
  icon: '/icons/comment-icon.png',
  badge: '/icons/badge-72x72.svg',
  url: `/posts/${postId}`,
  data: {
    type: 'comment',
    postId: postId,
    commentId: commentId,
    commenterId: commenterId
  }
});
```

## 🐛 **Common Issues & Solutions:**

### Issue 1: Raw JSON showing in notification
**Problem:** Sending object instead of JSON string
```typescript
// ❌ Wrong - sends object
await webpush.sendNotification(subscription, payload);

// ✅ Correct - sends JSON string
await webpush.sendNotification(subscription, JSON.stringify(payload));
```

### Issue 2: Icons not showing
**Problem:** Icon paths not accessible
```typescript
// ✅ Make sure icon paths are correct and accessible:
icon: '/icons/welcome-icon.png' // Must exist in your Next.js public folder
badge: '/icons/badge-72x72.svg'
```

### Issue 3: URL navigation not working
**Problem:** Relative URLs not working
```typescript
// ✅ Use absolute paths for URLs:
url: '/messages'        // ✅ Good
url: '/posts/123'       // ✅ Good
url: 'messages'         // ❌ Might not work
```

## 🔄 **Testing Your Payload:**

Add logging in your Nest.js service to verify the payload:

```typescript
console.log('Sending notification payload:', payloadString);
```

The service worker will now properly parse and display the notification! 🚀

## 📱 **Expected Result:**

After fixing the payload format, you should see:
- ✅ Proper notification title
- ✅ Readable notification body  
- ✅ Correct icon displayed
- ✅ Clicking opens the right URL
- ✅ No raw JSON in the notification text

# 🔧 Push Notification Troubleshooting Guide

## 🐛 Common Issues & Solutions

### Issue: "Push received but no notification shows"

This usually happens due to one of these reasons:

#### 1. **Notification Permission Issues**
```javascript
// Check in browser console:
console.log('Notification permission:', Notification.permission)
// Should be 'granted', not 'denied' or 'default'
```

#### 2. **Service Worker Data Parsing**
The updated service worker now properly handles JSON data from Nest.js.

#### 3. **Browser Focus Issues**
Some browsers don't show notifications when the page is in focus. Try:
- Minimize the browser window
- Switch to another tab
- Test on mobile device

#### 4. **Icon Loading Issues**
Make sure notification icons exist and are accessible.

## 🔍 Debugging Steps

### 1. Check Browser Console
```javascript
// In your main page console:
navigator.serviceWorker.ready.then(registration => {
  console.log('SW ready:', registration)
  console.log('Notification permission:', Notification.permission)
})
```

### 2. Check Service Worker Console
1. Open DevTools
2. Go to Application tab
3. Click on Service Workers
4. Click "inspect" next to your service worker
5. Look for console logs when notification arrives

### 3. Test Notification Display Manually
```javascript
// In browser console:
if ('serviceWorker' in navigator && 'Notification' in window) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Test Notification', {
      body: 'This is a test',
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/badge-72x72.svg'
    })
  })
}
```

### 4. Force Refresh Service Worker
1. Go to DevTools > Application > Service Workers
2. Check "Update on reload"
3. Refresh the page
4. Click "Update" next to your service worker

## 📱 Platform-Specific Issues

### **Chrome Desktop**
- Notifications work even when page is focused
- Check chrome://settings/content/notifications

### **Firefox Desktop**
- May not show notifications when page is focused
- Check about:preferences#privacy (Notifications section)

### **Mobile Browsers**
- iOS Safari: Limited push notification support
- Android Chrome: Full support
- Test with "Add to Home Screen" for better experience

## 🔧 Quick Fixes

### 1. Clear and Re-subscribe
```javascript
// In browser console:
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.getSubscription()
}).then(subscription => {
  if (subscription) {
    return subscription.unsubscribe()
  }
}).then(() => {
  console.log('Unsubscribed, now re-subscribe through the UI')
})
```

### 2. Reset Notification Permissions
1. Click the lock icon in address bar
2. Reset notification permission
3. Refresh page and re-enable notifications

### 3. Test with Different Payload
Try sending a simple text notification from your Nest.js backend:
```typescript
// In your Nest.js service:
await webpush.sendNotification(subscription, 'Simple test message')
```

## ✅ Verification Checklist

- [ ] Notification permission is "granted"
- [ ] Service worker is registered and active
- [ ] VAPID keys are correctly configured
- [ ] Backend sends proper JSON payload
- [ ] Icons are accessible at specified paths
- [ ] Browser tab is not focused (test minimized)
- [ ] No browser extensions blocking notifications

## 📞 If Still Not Working

1. **Check Network Tab**: Look for failed requests to notification icons
2. **Test on Incognito**: Rules out extension interference  
3. **Test on Mobile**: Different notification behavior
4. **Check Nest.js Logs**: Verify notifications are being sent
5. **Try Different Browser**: Cross-browser compatibility

The service worker has been updated to properly handle JSON data and provide better debugging output. Check the console logs for more details!

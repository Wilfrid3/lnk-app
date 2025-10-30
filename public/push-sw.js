// Service Worker for handling push notifications

// Install event - prepare for activation
self.addEventListener('install', function(event) {
  console.log('Push Service Worker installing...');
  // Don't skip waiting immediately, let it happen naturally
  event.waitUntil(self.skipWaiting());
});

// Activate event - claim all clients
self.addEventListener('activate', function(event) {
  console.log('Push Service Worker activating...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Push Service Worker activated and claimed all clients');
    })
  );
});

self.addEventListener('push', function(event) {
//   console.log('Push received:', event);
  
  let notificationData = {
    title: 'YamoZone',
    body: 'Vous avez une nouvelle notification!',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
    url: '/',
    data: {}
  };

  // Parse the notification data from Nest.js API
  if (event.data) {
    try {
      // First try to get the text content
      const textData = event.data.text();
    //   console.log('Raw notification data:', textData);
      
      // Try to parse as JSON
      let payload;
      try {
        payload = JSON.parse(textData);
        // console.log('Parsed notification payload:', payload);
      } catch (jsonError) {
        console.log('Not JSON, treating as plain text:', jsonError.message);
        // If it's not JSON, use the text as the body
        notificationData.body = textData;
        payload = null;
      }
      
      // If we have a valid payload object, use its properties
      if (payload && typeof payload === 'object') {
        notificationData = {
          title: payload.title || notificationData.title,
          body: payload.body || notificationData.body,
          icon: payload.icon || notificationData.icon,
          badge: payload.badge || notificationData.badge,
          url: payload.url || notificationData.url,
          data: payload.data || {}
        };
      }
      
    } catch (error) {
      console.error('Error processing notification data:', error);
      // Fallback: use default values
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: notificationData.url,
      ...notificationData.data // Spread any additional data from payload
    },
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: notificationData.data?.type || 'default' // Use type for grouping notifications
  };
  
//   console.log('Final notification data:', notificationData);
//   console.log('Showing notification with options:', options);
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
//   console.log('Notification click received.', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
//   console.log('Opening URL:', urlToOpen);
  
  if (event.action === 'open' || !event.action) {
    // Open the app or specific URL
    event.waitUntil(
      self.clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(function(clientList) {
        console.log('Found clients:', clientList.length);
        
        // Check if there's already a window/tab open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          console.log('Checking client:', client.url);
          
          if (client.url.includes(self.location.origin)) {
            console.log('Focusing existing client');
            // Focus existing window and navigate to URL
            return client.focus().then(() => {
              console.log('Client focused, attempting navigation');
              // Post a message to the client to navigate instead of using client.navigate
              return client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen
              });
            }).catch(error => {
              console.error('Error focusing client:', error);
              // Fallback: open new window
              return self.clients.openWindow(urlToOpen);
            });
          }
        }
        
        // Open new window if none exists
        console.log('No existing client found, opening new window');
        return self.clients.openWindow(urlToOpen);
      }).catch(error => {
        console.error('Error in notification click handler:', error);
        // Fallback: try to open new window
        return self.clients.openWindow(urlToOpen);
      })
    );
  }
  // For 'close' action, we just close (already done above)
});

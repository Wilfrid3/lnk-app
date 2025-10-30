'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ServiceWorkerMessageHandler() {
  const router = useRouter()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data)
        
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          const url = event.data.url || '/'
          console.log('Navigating to:', url)
          
          // Use Next.js router to navigate
          router.push(url)
          
          // Also focus the window if it's not focused
          if (document.hidden) {
            window.focus()
          }
        }
      })
    }
  }, [router])

  return null // This component doesn't render anything
}

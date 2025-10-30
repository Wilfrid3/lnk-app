'use client'

import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Client component wrapper to handle online status management
 * This component should be included in the root layout
 */
export default function OnlineStatusManager() {
  useOnlineStatus()
  
  // This component doesn't render anything, it just manages online status
  return null
}

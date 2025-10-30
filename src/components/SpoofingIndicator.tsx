'use client'

import React from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { getFullImageUrl } from '@/utils/imageUtils'

const SpoofingIndicator: React.FC = () => {
  const { spoofingState, stopSpoofing } = useAuth()
  const [isStoppingSpoofing, setIsStoppingSpoofing] = React.useState(false)

  const handleStopSpoofing = async () => {
    setIsStoppingSpoofing(true)
    try {
      await stopSpoofing()
    } catch (error) {
      console.error('Error stopping spoofing:', error)
    } finally {
      setIsStoppingSpoofing(false)
    }
  }

  // Only show when spoofing is active
  if (!spoofingState.isSpoofing) {
    return null
  }

  // Show spoofing indicator when spoofing is active
  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🎭</span>
            
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">Imitation:</span>
              
              {spoofingState.targetUser ? (
                <>
                  {spoofingState.targetUser.avatar ? (
                    <Image
                      src={getFullImageUrl(spoofingState.targetUser.avatar) ?? '/images/avatars/default_tous.png'}
                      alt={spoofingState.targetUser.name ?? 'Target User'}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover border border-white"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white text-purple-600 flex items-center justify-center text-xs font-bold border border-white">
                      {spoofingState.targetUser.name ? spoofingState.targetUser.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  
                  <span className="font-semibold text-sm">
                    {spoofingState.targetUser.name || 'Utilisateur sans nom'}
                  </span>
                  
                  <span className="text-purple-200 text-xs hidden sm:inline">
                    ({spoofingState.targetUser.email || spoofingState.targetUser.phoneNumber || spoofingState.targetUser._id})
                  </span>
                </>
              ) : (
                <span className="font-medium text-purple-200 text-sm">
                  Chargement...
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleStopSpoofing}
            disabled={isStoppingSpoofing}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStoppingSpoofing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="text-xs font-medium hidden sm:inline">Arrêt...</span>
              </>
            ) : (
              <>
                <span className="material-icons text-sm">exit_to_app</span>
                <span className="text-xs font-medium hidden sm:inline">Quitter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


export default SpoofingIndicator

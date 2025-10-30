import React from 'react'
import Image from 'next/image'

interface BottomActionBarProps {
  onCall: () => void
  onWhatsapp: () => void
  onChat: () => void
  onEmail: () => void
  disabled?: {
    call?: boolean
    whatsapp?: boolean
    chat?: boolean
    email?: boolean
  }
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onCall,
  onWhatsapp,
  onChat,
  onEmail,
  disabled = {}
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 py-3 px-4 fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 shadow-t z-10">
      <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2">
        <button 
          onClick={onCall}
          className="flex flex-col items-center justify-center text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled.call}
        >
          <span className="material-icons text-2xl">call</span>
          <span className="text-xs mt-1">Appeler</span>
        </button>
        
        <button 
          onClick={onWhatsapp}
          className="flex flex-col items-center justify-center text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled.whatsapp}
        >
          <div className="relative w-6 h-6">
            <Image 
              src="/icons/whatsapp.png" 
              alt="WhatsApp"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-xs mt-1">Whatsapp</span>
        </button>
        
        <button 
          onClick={onChat}
          className="flex flex-col items-center justify-center text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled.chat}
        >
          <span className="material-icons text-2xl">chat</span>
          <span className="text-xs mt-1">Chat</span>
        </button>
        
        <button 
          onClick={onEmail}
          className="flex flex-col items-center justify-center text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled.email}
        >
          <span className="material-icons text-2xl">email</span>
          <span className="text-xs mt-1">Email</span>
        </button>
      </div>
    </div>
  )
}

export default BottomActionBar

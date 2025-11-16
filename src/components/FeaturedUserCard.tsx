'use client'

import React from 'react'
import Image from 'next/image'
import type { User } from '@/services/usersService'
import { getFullImageUrl } from '@/utils/imageUtils'

interface FeaturedUserCardProps {
  user: User
  className?: string
}

const FeaturedUserCard: React.FC<FeaturedUserCardProps> = ({ user, className }) => {
  return (
    <div className={`relative overflow-hidden transition-shadow ${className || ''}`}>
      {/* Cover Image or Gradient Background - Full Card */}
      <div className="flex flex-col justify-center items-center w-full h-full">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
          <Image
            src={getFullImageUrl(user.avatar) || '/images/avatars/avatar.png'}
            alt={`${user.name}'s avatar`}
            fill
            className="object-cover rounded-full"
            sizes="100px"
            priority
          />
        </div>
        <h3 className="text-gray-900 dark:text-white text-sm drop-shadow-sm mt-2 truncate px-2 text-center">
          {user.name}
        </h3>
      </div>
    </div>
  )
}

export default FeaturedUserCard

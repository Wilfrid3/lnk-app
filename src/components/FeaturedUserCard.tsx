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
      <div className="flex justify-center items-center w-full h-full">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg mx-auto">
          <Image
            src={getFullImageUrl(user.avatar) || '/images/avatars/avatar.png'}
            alt={`${user.name}'s avatar`}
            fill
            className="object-cover"
            sizes="100px"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default FeaturedUserCard

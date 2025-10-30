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
    <div className={`relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow ${className || ''}`}>
      {/* Cover Image or Gradient Background - Full Card */}
      <div className="absolute inset-0">
        {user.coverImage ? (
          <Image
            src={getFullImageUrl(user.coverImage) || '/images/featured/vedette_bg.png'}
            alt={`${user.name}'s cover`}
            fill
            className="object-cover"
            sizes="160px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600"></div>
        )}
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-2 flex flex-col h-full">
        {/* Top Badge Row */}
        <div className="flex flex-wrap gap-0.5 mb-1">
          {/* Premium Badge */}
          {user.isPremium && (
            <div className="bg-yellow-500 text-[8px] text-white px-1 py-0.5 rounded-sm font-medium tracking-wide flex items-center">
              <span className="material-icons text-[10px] mr-0.5">star</span>
              <span>PREMIUM</span>
            </div>
          )}

          {/* VIP Badge */}
          {user.isVip && (
            <div className="bg-purple-500 text-[8px] text-white px-1 py-0.5 rounded-sm font-medium tracking-wide flex items-center">
              <span className="material-icons text-[10px] mr-0.5">diamond</span>
              <span>VIP</span>
            </div>
          )}
        </div>

        {/* Avatar positioned in center-top area */}
        <div className="flex justify-center mb-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <Image
              src={getFullImageUrl(user.avatar) || '/images/avatars/avatar.png'}
              alt={`${user.name}'s avatar`}
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </div>
        </div>

        {/* Content at bottom with white text */}
        <div className="mt-auto">
          {/* User Name */}
          <h3 className="font-bold text-white text-xs mb-0.5 truncate text-center">
            {user.name}
          </h3>
          
          {/* User Type */}
          {user.userType && (
            <p className="text-white/80 text-[10px] mb-1 capitalize text-center">
              {user.userType}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex justify-between items-center text-[9px] text-white/70">
            <div className="flex items-center">
              <span className="material-icons text-[10px] mr-0.5">people</span>
              <span>{user.followersCount || Math.floor(Math.random() * 1000)}</span>
            </div>
            
            <div className="flex items-center">
              <span className="material-icons text-[10px] mr-0.5">visibility</span>
              <span>{user.views || Math.floor(Math.random() * 10000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedUserCard

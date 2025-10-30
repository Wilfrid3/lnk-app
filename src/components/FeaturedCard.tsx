'use client'

import React from 'react'
import Image from 'next/image'
import type { Profile } from './FeaturedCarousel'

interface FeaturedCardProps {
  profile: Profile
  className?: string
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ profile, className }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow ${className || ''}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={profile.featureImage}
          alt={`${profile.name}'s background`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
          priority
        />
        {/* Improved gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col p-1">
        {/* Top Badge Row - side by side positioning */}
        <div className="flex flex-wrap gap-0.5 mb-0.5">
          {/* Premium Badge */}
          {profile.premium && (
            <div className="bg-yellow-500 text-[10px] text-white px-1.5 py-0.5 rounded-sm font-medium tracking-wide flex items-center">
              <span className="material-icons text-xs mr-0.5">star</span>
              <span>PREMIUM</span>
            </div>
          )}

          {/* Verified Badge */}
          {profile.verified && (
            <div className="bg-blue-500 text-[10px] text-white px-1.5 py-0.5 rounded-sm font-medium tracking-wide flex items-center">
              <span className="material-icons text-xs mr-0.5">verified</span>
              <span>VÉRIFIÉ</span>
            </div>
          )}
        </div>

        {/* User Name - positioned at the bottom left */}
        <div className="mt-auto">
          <h3 className="font-bold text-white text-base tracking-wide text-shadow-sm">
            {profile.name}
          </h3>
          
          {/* Bottom Action Row */}
          <div className="flex justify-between items-center mt-0.5">
            <div className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm flex items-center">
              <span className="material-icons text-xs mr-1">people</span>
              <span className="whitespace-nowrap">{profile.subscribers} abonnés</span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedCard
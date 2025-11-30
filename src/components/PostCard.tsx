import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type Post = {
  id: string;
  name: string;
  avatar: string;
  featureImage?: string; // Added feature image property
  age: number;
  vip?: boolean;
  premium?: boolean; // Add this if not already present
  when: string;
  location: string;
  description: string;
  title: string;
  lookingFor: string;
  verified?: boolean;
  isAd?: boolean;
  views?: number;
  likes?: number;
  hasVideos?: boolean; // Indicates if post contains videos
  videoCount?: number; // Number of videos in the post
  firstVideoUrl?: string; // URL of the first video for preview
};

const PostCard: React.FC<Post> = ({
  id,
  name,
  avatar,
  featureImage,
  age,
  vip = false,
  premium = false, // Add this if not already present
  when,
  location,
  title,
  lookingFor,
  verified = false,
  isAd = false,
  views,
  likes,
  hasVideos = false,
  videoCount = 0,
  firstVideoUrl,
}) => {
  const defaultSrc = '/images/avatars/default.png';
  const [src, setSrc] = useState(
    avatar ?? defaultSrc
  );
  return (
    <Link href={`/posts/${id}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-pink-200 transition-colors relative ${hasVideos ? 'ring-1 ring-pink-200 hover:ring-pink-300' : ''}`}>
        {/* Ad Banner */}
        {isAd && (
          <div className="bg-primary-500 text-white text-xs font-semibold text-center py-0.5">
            SPONSORISÉ
          </div>
        )}
        {/* Premium Star Badge on top left */}
        {premium && featureImage && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow">
              <span className="material-icons text-base text-white">star</span>
            </div>
          </div>
        )}
        {/* Card Content as flex row with full height - using absolute positioning for better image handling */}
        <div className="flex flex-row min-h-[120px] relative">
          {/* Feature Image or Video Preview (if available) on the left */}
          {(featureImage || (hasVideos && firstVideoUrl)) && (
            <div className="absolute top-0 left-0 bottom-0 w-24 sm:w-28 overflow-hidden">
              <div className="relative w-full h-full">
                {featureImage ? (
                  <>
                    <Image
                      src={featureImage}
                      priority={true}
                      alt={`${name}'s featured image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, 112px"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null
                        currentTarget.src = '/images/ads/feature_1.png'
                      }}
                    />

                    {/* Video Indicator Badge for posts with feature image */}
                    {hasVideos && (
                      <div className="absolute inset-0 overflow-hidden">
                        {/* Video preview background with enhanced styling */}
                        {firstVideoUrl ? (
                          <video
                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                            muted
                            loop
                            autoPlay
                            playsInline
                            preload="metadata"
                            poster={firstVideoUrl + '#t=0.1'}
                          >
                            <source src={firstVideoUrl} type="video/mp4" />
                          </video>
                        ) : (
                          /* Fallback gradient for posts without video URL */
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-500/30 to-pink-600/40"></div>
                        )}

                        {/* Enhanced gradient overlay for better contrast */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>

                        {/* Premium glassmorphism play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/25 backdrop-blur-lg rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border border-white/40 hover:bg-white/35 hover:scale-110 transition-all duration-300 group">
                            <span className="material-icons text-white text-2xl drop-shadow-lg group-hover:animate-pulse">play_arrow</span>
                          </div>
                        </div>

                        {/* Subtle animation overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50"></div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Video-only preview for posts without feature image */
                  hasVideos && firstVideoUrl && (
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Main video preview */}
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                        playsInline
                        preload="metadata"
                        poster={firstVideoUrl + '#t=0.1'}
                      >
                        <source src={firstVideoUrl} type="video/mp4" />
                      </video>

                      {/* Enhanced gradient overlay for better contrast */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>

                      {/* Premium glassmorphism play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/25 backdrop-blur-lg rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border border-white/40 hover:bg-white/35 hover:scale-110 transition-all duration-300 group">
                          <span className="material-icons text-white text-2xl drop-shadow-lg group-hover:animate-pulse">play_arrow</span>
                        </div>
                      </div>

                      {/* Subtle animation overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50"></div>
                    </div>
                  )
                )}

                {/* Video Count Badge */}
                {hasVideos && videoCount > 0 && (
                  <div className="absolute bottom-1 right-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md z-10">
                    {videoCount} vidéo{videoCount > 1 ? 's' : ''}
                  </div>
                )}

                {/* Gradient overlay for better text readability */}
                {hasVideos && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/40 to-transparent"></div>
                )}
              </div>
            </div>
          )}
          {/* User Info Header with left padding to accommodate the image/video */}
          <div className={`p-3 ${(featureImage || (hasVideos && firstVideoUrl)) ? 'pl-28 sm:pl-32' : ''}`}>
            {/* Time */}
            <div className="absolute top-2 right-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-md">
              {when}
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={src}
                      alt={name || 'User Avatar'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      onError={() => {
                        setSrc(defaultSrc)
                      }}
                    />
                  </div>
                  {premium && !featureImage && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      <span className="material-icons text-[10px] text-white">
                        star
                      </span>
                    </div>
                  )}
                </div>

                {/* Name, Age, Verification */}
                <div className="ml-2 flex items-center">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {name}
                  </span>
                  {/* VIP Chip next to name */}
                  {vip && (
                    <span className="ml-1 px-2 py-0.5 bg-pink-500 text-white text-[10px] rounded font-bold uppercase">
                      VIP
                    </span>
                  )}
                  <span className="ml-1 text-gray-700 dark:text-gray-300 text-xs">
                    {age}ans
                  </span>
                  {verified && (
                    <span className="material-icons text-blue-500 text-xs ml-1">
                      verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description - reduced height */}
            <p className="text-gray-700 dark:text-gray-300 text-xs mb-2 line-clamp-2">
              {lookingFor}
            </p>
            {/* Description - reduced height */}
            <p className="text-gray-700 font-bold dark:text-gray-300 text-xs mb-2 line-clamp-1">
              {title}
            </p>

            {/* Footer with Location and Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 w-full">
              <div className="flex items-center">
                <span className="material-icons text-xs mr-1">location_on</span>
                <span className="truncate">{location}</span>
              </div>

              {/* Views and Likes */}
              {(views !== undefined || likes !== undefined || hasVideos) && (
                <div className="flex items-center gap-3 w-full">

                  {/* Vidéo indicator */}
                  {hasVideos && !featureImage && !firstVideoUrl && (
                    <div className="flex items-center gap-1 text-pink-500">
                      <span className="material-icons text-xs animate-pulse">videocam</span>
                      <span className="text-xs font-medium">{videoCount || 'Vidéo'}</span>
                    </div>
                  )}

                  {/* RIGHT SIDE: Views + Likes */}
                  <div className="flex items-center gap-3 ml-auto">
                    {views !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-xs">visibility</span>
                        <span>{views}</span>
                      </div>
                    )}
                    {likes !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-xs">favorite</span>
                        <span>{likes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};


export default PostCard;

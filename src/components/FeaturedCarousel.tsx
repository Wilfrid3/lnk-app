// src/components/FeaturedCarousel.tsx
'use client'

import React, { useRef, useState, useEffect } from 'react'
import FeaturedCard from './FeaturedCard'
import Link from 'next/link'
import { getFeaturedPosts } from '@/services/postsService'
import { getFullImageUrl } from '@/utils/imageUtils'

export interface Profile {
  id: string
  name: string
  avatar: string
  featureImage: string
  rank: string
  views: string
  premium: boolean
  subscribers: string
  verified: boolean
}

interface FeaturedCarouselProps {
  items: Profile[]
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ items: defaultItems }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Profile[]>(defaultItems)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch featured posts from API
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const featuredPosts = await getFeaturedPosts();
        if (featuredPosts.length > 0) {
          // Map API posts to Profile format expected by FeaturedCard
          const mappedProfiles = featuredPosts.map(post => ({
            id: post.id,
            name: post.user.name,
            avatar: getFullImageUrl(post.user.avatar) || '/images/avatars/avatar.png',
            featureImage: getFullImageUrl(post.mainPhoto?.url) || '/images/featured/vedette_bg.png',
            rank: `${post.views || 0} vues`,
            views: `${post.views || 0}`,
            premium: post.isVip || false,
            subscribers: `${Math.floor(Math.random() * 1000)}`, // This is just for display purposes
            verified: post.user.isVerified || false,
          }));
          setItems(mappedProfiles);
        }
      } catch (err) {
        console.error('Failed to load featured posts:', err);
        setError('Failed to load featured posts');
        // Fall back to default items if API call fails
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, [defaultItems]); // Only run once or when defaultItems changes

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const { current } = scrollRef;
    const scrollAmount = 300; // Adjust based on card width + gap
    const currentScroll = current.scrollLeft;

    // Use smooth scrolling for better UX
    current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left scroll button - Only show on tablets and desktops */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 shadow-md text-gray-800 dark:text-gray-200 transition-colors"
        style={{ transform: 'translate(0, -50%)' }}
      >
        <span className="material-icons text-base">arrow_back_ios</span>
      </button>

      {/* Featured profiles */}
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar"
      >
        {items.map((profile) => (
          <Link 
            key={profile.id} 
            href={`/posts/${profile.id}`}
            className="w-[120px] sm:w-[140px] flex-shrink-0"
          >
            <FeaturedCard profile={profile} className="h-[160px]" />
          </Link>
        ))}
      </div>

      {/* Right scroll button - Only show on tablets and desktops */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 shadow-md text-gray-800 dark:text-gray-200 transition-colors"
        style={{ transform: 'translate(0, -50%)' }}
      >
        <span className="material-icons text-base">arrow_forward_ios</span>
      </button>
    </div>
  )
}

export default FeaturedCarousel

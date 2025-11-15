// src/components/FeaturedUserCarousel.tsx
'use client'

import React, { useRef, useState, useEffect } from 'react'
import FeaturedUserCard from './FeaturedUserCard'
import Link from 'next/link'
import { getFeaturedUsers, type User } from '@/services/usersService'

interface FeaturedUserCarouselProps {
  users?: User[]
}

const FeaturedUserCarousel: React.FC<FeaturedUserCarouselProps> = ({ users: defaultUsers = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch featured users from API
  useEffect(() => {
    const fetchFeaturedUsers = async () => {
      try {
        const featuredUsers = await getFeaturedUsers();
        if (featuredUsers.length > 0) {
          setUsers(featuredUsers);
        }
      } catch (err) {
        console.error('Failed to load featured users:', err);
        setError('Failed to load featured users');
        // Fall back to default users if API call fails
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedUsers();
  }, [defaultUsers]); // Only run once or when defaultUsers changes

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

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Aucun profil en vedette pour le moment
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

      {/* Featured user profiles */}
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar"
      >
        {users.map((user) => (
          <Link 
            key={user._id} 
            href={`/users/${user._id}`}
            className="w-[80px] sm:w-[80px] flex-shrink-0"
          >
            <FeaturedUserCard user={user} className="h-[100px]" />
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

export default FeaturedUserCarousel

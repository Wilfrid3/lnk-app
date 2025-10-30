import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import FeaturedUserCard from '@/components/FeaturedUserCard';
import { useInfiniteFeaturedUsers } from '@/hooks/useInfiniteFeaturedUsers';

interface InfiniteFeaturedUsersProps {
  className?: string;
}

const InfiniteFeaturedUsers: React.FC<InfiniteFeaturedUsersProps> = ({ className = '' }) => {
  const { users, loading, error, hasMore, loadMore } = useInfiniteFeaturedUsers();
  const observer = useRef<IntersectionObserver | null>(null);

  // Set up the intersection observer to detect when user scrolls to the bottom
  const lastUserElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    
    // Disconnect the previous observer if it exists
    if (observer.current) observer.current.disconnect();
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last item is visible and we have more items to load
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    // Start observing the last user element
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Featured Users Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 justify-items-center">
        {users.map((user, index) => (
          <div 
            key={user._id} 
            ref={index === users.length - 1 ? lastUserElementRef : undefined}
            className="w-[140px] sm:w-[160px]"
          >
            <Link href={`/users/${user.id}`}>
              <FeaturedUserCard 
                user={user} 
                className="h-[180px] cursor-pointer hover:scale-[1.02] transition-transform"
              />
            </Link>
          </div>
        ))}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {/* End of list message */}
      {!hasMore && users.length > 0 && (
        <div className="text-gray-500 text-center py-8">
          Vous avez atteint la fin des profils en vedette.
        </div>
      )}
      
      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          <span className="material-icons text-4xl mb-2 block">group</span>{' '}
          Aucun profil en vedette disponible pour le moment.
        </div>
      )}
    </div>
  );
};

export default InfiniteFeaturedUsers;

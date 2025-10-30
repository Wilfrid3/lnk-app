import React, { useEffect, useRef, useCallback } from 'react';
import PostCard from '@/components/PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { mapApiPostToCardProps } from '@/utils/postMappers';

interface InfinitePostListProps {
  userId?: string; // Optional userId to filter posts for a specific user
}

const InfinitePostList: React.FC<InfinitePostListProps> = ({ userId }) => {
  const { posts, loading, error, hasMore, loadMore } = useInfiniteScroll({ userId });
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Set up the intersection observer to detect when user scrolls to the bottom
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
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
    
    // Start observing the last post element
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
    <>
      <div className="grid gap-4">
        {posts.map((post, index) => (
          <div key={post.id} ref={index === posts.length - 1 ? lastPostElementRef : undefined}>
            <PostCard {...mapApiPostToCardProps(post)} />
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-gray-500 text-center py-8">
          Vous avez atteint la fin des annonces disponibles.
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          {userId ? "Aucune annonce publiée par cet utilisateur." : "Aucune annonce disponible pour le moment."}
        </div>
      )}
      
      {/* This div is used to observe when it becomes visible */}
      <div ref={loadMoreRef} className="h-1"></div>
    </>
  );
};

export default InfinitePostList;
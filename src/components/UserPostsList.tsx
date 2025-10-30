import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserPosts } from '@/hooks/useUserPosts';
import { getFullImageUrl } from '@/utils/imageUtils';

interface UserPostsListProps {
  userId: string;
  userName: string;
  userAvatar?: string;
}

const UserPostsList: React.FC<UserPostsListProps> = ({ userId, userName, userAvatar }) => {
  const router = useRouter();
  const { posts, loading, error, hasMore, loadMore } = useUserPosts(userId);
  const observer = useRef<IntersectionObserver | null>(null);

  const defaultAvatarSrc = '/images/avatars/default_tous.png';

  // Set up the intersection observer to detect when user scrolls to the bottom
  const lastPostElementRef = useCallback((node: HTMLButtonElement | HTMLDivElement | null) => {
    if (loading || !node) return;
    
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
    observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <button 
            key={post.id} 
            ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow w-full text-left"
            onClick={() => router.push(`/posts/${post.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                <Image
                  src={getFullImageUrl(userAvatar) ?? defaultAvatarSrc}
                  alt={userName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {userName}
                  </h3>
                  <span className="text-sm text-gray-500">• {formatTimeAgo(post.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="material-icons text-sm">location_on</span>
                  <span>{post.city}</span>
                  {Boolean(post.price) && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {post.price.toLocaleString()} FCFA
                      </span>
                    </>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h4>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-sm">visibility</span>
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-icons text-sm">favorite_border</span>
                    <span>{post.likesCount}</span>
                  </div>
                  {post.isFeatured && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <span className="material-icons text-sm">star</span>
                      <span>Vedette</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {post.mainPhoto && (
              <div className="mt-3 relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={getFullImageUrl(post.mainPhoto.url) ?? ''}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                {post.isFeatured && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    Vedette
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="text-gray-500 text-center py-8">
          Toutes les annonces ont été affichées.
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <span className="material-icons text-4xl text-gray-400 mb-4">post_add</span>
          <p className="text-gray-500 dark:text-gray-400">Aucune publication pour le moment</p>
        </div>
      )}
    </>
  );
};

export default UserPostsList;

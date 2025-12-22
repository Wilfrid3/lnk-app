import { useEffect, useState, useCallback } from 'react';
import { ApiPost, getPosts } from '@/services/postsService';
import { usePostsCacheStore } from '@/store/usePostsCacheStore';

interface UseInfiniteScrollOptions {
  initialLimit?: number;
  userId?: string;
}

interface UseInfiniteScrollReturn {
  posts: ApiPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn => {
  const { initialLimit = 10, userId } = options;
  
  // Récupérer le cache
  const { getHomePosts, setHomePosts, getUserPosts, setUserPosts } = usePostsCacheStore();
  const cachedData = userId ? getUserPosts(userId) : getHomePosts();
  
  const [posts, setPosts] = useState<ApiPost[]>(cachedData?.posts || []);
  const [page, setPage] = useState(cachedData?.page || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(cachedData?.hasMore ?? true);

  const fetchPosts = useCallback(async (pageNum: number) => {
    // Si les données sont en cache et que c'est la première page, ne pas recharger
    if (pageNum === 1 && cachedData?.initialized) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPosts(pageNum, initialLimit, userId);
      
      const newPosts = pageNum === 1 ? response.items : [...posts, ...response.items];
      
      setPosts(newPosts);
      setHasMore(
        response?.meta?.currentPage !== undefined &&
        response?.meta?.totalPages !== undefined &&
        response.meta.currentPage < response.meta.totalPages
      );
      
      // Mettre en cache
      if (userId) {
        setUserPosts(userId, newPosts, pageNum, response.meta.currentPage < response.meta.totalPages);
      } else {
        setHomePosts(newPosts, pageNum, response.meta.currentPage < response.meta.totalPages);
      }
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit, userId, posts, cachedData?.initialized, setHomePosts, setUserPosts]);
  
  // Initial load - uniquement si pas de cache
  useEffect(() => {
    if (!cachedData?.initialized) {
      fetchPosts(1);
    }
  }, [cachedData?.initialized, fetchPosts]);
  
  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [fetchPosts, hasMore, loading, page]);
  
  return { posts, loading, error, hasMore, loadMore };
};
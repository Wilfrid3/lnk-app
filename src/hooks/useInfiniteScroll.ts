import { useEffect, useState, useCallback } from 'react';
import { ApiPost, getPosts } from '@/services/postsService';

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
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPosts(pageNum, initialLimit, userId);
      
      setPosts(prev => pageNum === 1 ? response.items : [...prev, ...response.items]);
      setHasMore(
        response?.meta?.currentPage !== undefined &&
        response?.meta?.totalPages !== undefined &&
        response.meta.currentPage < response.meta.totalPages
      );
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [initialLimit, userId]);
  
  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);
  
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
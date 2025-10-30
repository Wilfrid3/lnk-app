import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/axios';

interface UserPost {
  id: string;
  title: string;
  description: string;
  city: string;
  clientType: string;
  price: number;
  views: number;
  likesCount: number;
  isActive: boolean;
  isFeatured: boolean;
  mainPhoto: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface UserPostsResponse {
  items: UserPost[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface UseUserPostsReturn {
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useUserPosts = (userId: string, initialLimit = 10): UseUserPostsReturn => {
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum: number, reset = false) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/users/${userId}/posts`, {
        params: {
          page: pageNum,
          limit: initialLimit,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      const data = response.data as UserPostsResponse;
      
      setPosts(prev => reset || pageNum === 1 ? data.items : [...prev, ...data.items]);
      setHasMore(
        data?.meta?.currentPage !== undefined &&
        data?.meta?.totalPages !== undefined &&
        data.meta.currentPage < data.meta.totalPages
      );
    } catch (err) {
      setError('Failed to load user posts. Please try again later.');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, initialLimit]);
  
  // Initial load
  useEffect(() => {
    if (userId) {
      setPage(1);
      setPosts([]);
      setHasMore(true);
      fetchPosts(1, true);
    }
  }, [userId, fetchPosts]);
  
  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [fetchPosts, hasMore, loading, page]);

  // Refresh function
  const refresh = useCallback(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, true);
  }, [fetchPosts]);
  
  return { posts, loading, error, hasMore, loadMore, refresh };
};

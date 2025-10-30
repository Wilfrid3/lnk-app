import { useEffect, useState, useCallback } from 'react';
import { User, getUsers } from '@/services/usersService';
import apiClient from '@/lib/axios';

interface FeaturedUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseInfiniteFeaturedUsersOptions {
  initialLimit?: number;
}

interface UseInfiniteFeaturedUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export const useInfiniteFeaturedUsers = (
  options: UseInfiniteFeaturedUsersOptions = {}
): UseInfiniteFeaturedUsersReturn => {
  const { initialLimit = 10 } = options;
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeaturedUsers = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', initialLimit.toString());
      
      // Try to fetch from /users/featured endpoint first
      const response = await apiClient.get<FeaturedUsersResponse>(`/users/featured?${queryParams.toString()}`);
      const data = response.data;
      
      setUsers(prev => pageNum === 1 ? data.users : [...prev, ...data.users]);
      setHasMore(
        data?.pagination?.page !== undefined &&
        data?.pagination?.totalPages !== undefined &&
        data.pagination.page < data.pagination.totalPages
      );
    } catch (err) {
      console.warn('Featured users endpoint not available, falling back to premium users');
      console.error('Error fetching featured users:', err);
      
      // Fallback: get premium/VIP users like in getFeaturedUsers
      try {
        const fallbackResponse = await getUsers({ 
          page: pageNum, 
          limit: initialLimit, 
          premium: true 
        });
        
        setUsers(prev => pageNum === 1 ? fallbackResponse.users : [...prev, ...fallbackResponse.users]);
        setHasMore(
          fallbackResponse?.pagination?.page !== undefined &&
          fallbackResponse?.pagination?.totalPages !== undefined &&
          fallbackResponse.pagination.page < fallbackResponse.pagination.totalPages
        );
      } catch (fallbackErr) {
        setError('Failed to load featured users. Please try again later.');
        console.error('Error fetching featured users:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);
  
  // Initial load
  useEffect(() => {
    fetchFeaturedUsers(1);
  }, [fetchFeaturedUsers]);
  
  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeaturedUsers(nextPage);
    }
  }, [fetchFeaturedUsers, hasMore, loading, page]);
  
  return { users, loading, error, hasMore, loadMore };
};

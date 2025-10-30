import { useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/axios';
import { ApiPost } from '@/services/postsService';
import { User } from '@/services/usersService';

interface PostApiResponse {
  items: ApiPost[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

interface UserApiResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SearchParams {
  query?: string;
  city?: string;
  userType?: string;
  clientType?: string;
  minPrice?: number;
  maxPrice?: number;
  offerings?: string[];
  category?: string | null;
  appearance?: string;
  verified?: boolean;
  premium?: boolean;
  minAge?: number;
  maxAge?: number;
}

interface UseInfiniteSearchOptions {
  searchType: 'posts' | 'users';
  initialLimit?: number;
  searchParams?: SearchParams;
}

interface UseInfiniteSearchReturn {
  posts: ApiPost[];
  users: User[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  resetSearch: () => void;
  totalItems: number;
}

export const useInfiniteSearch = (options: UseInfiniteSearchOptions): UseInfiniteSearchReturn => {
  const { searchType, initialLimit = 10, searchParams = {} } = options;
  
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  
  // Use a ref to track if we should reset on next search
  const shouldReset = useRef(true);

  const buildSearchParams = useCallback((searchParams: SearchParams, page: number, limit: number) => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (searchParams.query?.trim()) {
      params.append('search', searchParams.query.trim());
    }
    
    if (searchParams.city) {
      params.append('city', searchParams.city);
    }
    
    if (searchType === 'posts') {
      // Post-specific filters
      if (searchParams.clientType) {
        params.append('clientType', searchParams.clientType);
      }
      if (searchParams.minPrice !== undefined && searchParams.minPrice > 0) {
        params.append('minPrice', searchParams.minPrice.toString());
      }
      if (searchParams.maxPrice !== undefined && searchParams.maxPrice < 100000) {
        params.append('maxPrice', searchParams.maxPrice.toString());
      }
      if (searchParams.offerings && searchParams.offerings.length > 0) {
        searchParams.offerings.forEach(attr => params.append('offerings[]', attr));
      }
      if (searchParams.category) {
        params.append('category', searchParams.category);
      }
    } else {
      // User-specific filters
      if (searchParams.userType) {
        params.append('userType', searchParams.userType);
      }
      if (searchParams.appearance) {
        params.append('appearance', searchParams.appearance);
      }
      if (searchParams.verified) {
        params.append('verified', 'true');
      }
      if (searchParams.premium) {
        params.append('premium', 'true');
      }
      if (searchParams.offerings && searchParams.offerings.length > 0) {
        searchParams.offerings.forEach(attr => params.append('offerings[]', attr));
      }
      if (searchParams.minAge !== undefined) {
        params.append('minAge', searchParams.minAge.toString());
      }
      if (searchParams.maxAge !== undefined) {
        params.append('maxAge', searchParams.maxAge.toString());
      }
    }
    
    return params;
  }, [searchType]);

  const fetchSearchResults = useCallback(async (pageNum: number, currentSearchParams: SearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = searchType === 'posts' ? '/posts/search' : '/users/search';
      const params = buildSearchParams(currentSearchParams, pageNum, initialLimit);
      
      const response = await apiClient.get(endpoint, { params });
      
      if (searchType === 'posts') {
        const postsData = response.data as PostApiResponse;
        const newPosts = postsData.items || [];
        
        setPosts(prev => shouldReset.current || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
        setUsers([]);
        setHasMore(
          postsData.meta?.currentPage !== undefined &&
          postsData.meta?.totalPages !== undefined &&
          postsData.meta.currentPage < postsData.meta.totalPages
        );
        setTotalItems(postsData.meta?.totalItems || 0);
      } else {
        const usersData = response.data as UserApiResponse;
        const newUsers = usersData.users || [];
        
        setUsers(prev => shouldReset.current || pageNum === 1 ? newUsers : [...prev, ...newUsers]);
        setPosts([]);
        setHasMore(
          usersData.pagination?.page !== undefined &&
          usersData.pagination?.totalPages !== undefined &&
          usersData.pagination.page < usersData.pagination.totalPages
        );
        setTotalItems(usersData.pagination?.total || 0);
      }
      
      shouldReset.current = false;
    } catch (err) {
      setError('Failed to load search results. Please try again later.');
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  }, [searchType, initialLimit, buildSearchParams]);
  
  // Reset search function
  const resetSearch = useCallback(() => {
    setPosts([]);
    setUsers([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setTotalItems(0);
    shouldReset.current = true;
  }, []);
  
  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(nextPage, searchParams);
    }
  }, [loading, hasMore, page, searchParams, fetchSearchResults]);
  
  // Search when searchType or searchParams change
  useEffect(() => {
    shouldReset.current = true;
    setPage(1);
    fetchSearchResults(1, searchParams);
  }, [searchType, searchParams, fetchSearchResults]);
  
  return { 
    posts, 
    users, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    resetSearch,
    totalItems
  };
};

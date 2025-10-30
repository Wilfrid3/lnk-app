import { create } from 'zustand';
import apiClient from '@/lib/axios';

interface ApiResponse<T> {
  items?: T[];
  meta?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  // New format for videos endpoint
  videos?: T[];
  hasMore?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
}

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
  additionalPhotos: {
    id: string;
    url: string;
    originalName: string;
  }[];
  videos: {
    id: string;
    url: string;
    originalName: string;
    duration?: number;
  }[];
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface VideosApiResponse {
  videos: ApiVideoResponse[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface ApiVideoResponse {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  user: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  duration: number;
  createdAt: string;
  tags: string[];
  privacy: 'public' | 'private';
}

interface UserVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  likes: number;
  isActive: boolean;
  privacy: 'public' | 'private';
  createdAt: string;
  user: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  tags: string[];
}

interface UserContentState {
  // Posts state
  posts: UserPost[];
  postsLoading: boolean;
  postsError: string | null;
  postsHasMore: boolean;
  postsPage: number;
  
  // Videos state
  videos: UserVideo[];
  videosLoading: boolean;
  videosError: string | null;
  videosHasMore: boolean;
  videosPage: number;
  
  // Active tab
  activeTab: 'posts' | 'videos';
  
  // Actions
  setActiveTab: (tab: 'posts' | 'videos') => void;
  loadUserPosts: (userId: string, reset?: boolean) => Promise<void>;
  loadUserVideos: (userId: string, reset?: boolean) => Promise<void>;
  loadMorePosts: (userId: string) => Promise<void>;
  loadMoreVideos: (userId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  togglePostStatus: (postId: string) => Promise<void>;
  toggleVideoStatus: (videoId: string) => Promise<void>;
  resetStore: () => void;
}

export const useUserContentStore = create<UserContentState>((set, get) => ({
  // Initial state
  posts: [],
  postsLoading: false,
  postsError: null,
  postsHasMore: true,
  postsPage: 1,
  
  videos: [],
  videosLoading: false,
  videosError: null,
  videosHasMore: true,
  videosPage: 1,
  
  activeTab: 'posts',
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  loadUserPosts: async (userId: string, reset = false) => {
    const state = get();
    if (state.postsLoading) return;
    
    set({ postsLoading: true, postsError: null });
    
    try {
      const page = reset ? 1 : state.postsPage;
      
      const response = await apiClient.get(`/posts/user/${userId}`, {
        params: {
          page,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      const data = response.data as ApiResponse<UserPost>;
      const newPosts = data.items || [];
      
      set({
        posts: reset ? newPosts : [...state.posts, ...newPosts],
        postsHasMore: data.meta ? data.meta.currentPage < data.meta.totalPages : false,
        postsPage: page,
        postsLoading: false
      });
    } catch (error) {
      console.error('Error loading user posts:', error);
      set({ 
        postsError: 'Erreur lors du chargement des publications',
        postsLoading: false 
      });
    }
  },
  
  loadUserVideos: async (userId: string, reset = false) => {
    const state = get();
    if (state.videosLoading) return;
    
    set({ videosLoading: true, videosError: null });
    
    try {
      const page = reset ? 1 : state.videosPage;
      
      const response = await apiClient.get(`/videos/user/${userId}`, {
        params: {
          page,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
      
      const data = response.data as VideosApiResponse;
      const apiVideos = data.videos || [];
      
      // Transform API response to match our interface
      const newVideos: UserVideo[] = apiVideos.map((video: ApiVideoResponse) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: undefined, // Not provided in API response
        duration: video.duration,
        views: video.stats.views,
        likes: video.stats.likes,
        isActive: true, // Assume active if returned by API
        privacy: video.privacy,
        createdAt: video.createdAt,
        user: video.user,
        stats: video.stats,
        isLiked: video.isLiked,
        tags: video.tags
      }));
      
      set({
        videos: reset ? newVideos : [...state.videos, ...newVideos],
        videosHasMore: data.hasMore || false,
        videosPage: page,
        videosLoading: false
      });
    } catch (error) {
      console.error('Error loading user videos:', error);
      set({ 
        videosError: 'Erreur lors du chargement des vidéos',
        videosLoading: false 
      });
    }
  },
  
  loadMorePosts: async (userId: string) => {
    const state = get();
    if (state.postsLoading || !state.postsHasMore) return;
    
    set({ postsPage: state.postsPage + 1 });
    await state.loadUserPosts(userId);
  },
  
  loadMoreVideos: async (userId: string) => {
    const state = get();
    if (state.videosLoading || !state.videosHasMore) return;
    
    set({ videosPage: state.videosPage + 1 });
    await state.loadUserVideos(userId);
  },
  
  deletePost: async (postId: string) => {
    try {
      await apiClient.delete(`/posts/${postId}`);
      
      const state = get();
      set({ 
        posts: state.posts.filter(post => post.id !== postId)
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Erreur lors de la suppression de la publication');
    }
  },
  
  deleteVideo: async (videoId: string) => {
    try {
      await apiClient.delete(`/videos/${videoId}`);
      
      const state = get();
      set({ 
        videos: state.videos.filter(video => video.id !== videoId)
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Erreur lors de la suppression de la vidéo');
    }
  },
  
  togglePostStatus: async (postId: string) => {
    try {
      const state = get();
      const post = state.posts.find(p => p.id === postId);
      if (!post) return;
      
      await apiClient.patch(`/posts/${postId}/status`, {
        isActive: !post.isActive
      });
      
      set({
        posts: state.posts.map(p => 
          p.id === postId 
            ? { ...p, isActive: !p.isActive }
            : p
        )
      });
    } catch (error) {
      console.error('Error toggling post status:', error);
      throw new Error('Erreur lors de la modification du statut');
    }
  },
  
  toggleVideoStatus: async (videoId: string) => {
    try {
      const state = get();
      const video = state.videos.find(v => v.id === videoId);
      if (!video) return;
      
      await apiClient.patch(`/videos/${videoId}/status`, {
        isActive: !video.isActive
      });
      
      set({
        videos: state.videos.map(v => 
          v.id === videoId 
            ? { ...v, isActive: !v.isActive }
            : v
        )
      });
    } catch (error) {
      console.error('Error toggling video status:', error);
      throw new Error('Erreur lors de la modification du statut');
    }
  },
  
  resetStore: () => {
    set({
      posts: [],
      postsLoading: false,
      postsError: null,
      postsHasMore: true,
      postsPage: 1,
      videos: [],
      videosLoading: false,
      videosError: null,
      videosHasMore: true,
      videosPage: 1,
      activeTab: 'posts'
    });
  }
}));

import apiClient from '@/lib/axios';

export interface PostImage {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface PostVideo {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  duration?: number;
}

export interface PostUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  userType: string;
  bio: string;
  isActive: boolean;
  isPremium: boolean;
  isVip: boolean;
  isVerified: boolean;
}

export interface ApiPost {
  id: string;
  title: string;
  description: string;
  services: { service: string; price: number }[];
  mainPhoto: PostImage;
  additionalPhotos: PostImage[];
  videos: PostVideo[];
  user: PostUser;
  clientType: string;
  appearance: string;
  offerings: string[];
  city: string;
  neighborhood: string;
  travelOption: string;
  phoneNumber: string;
  whatsappNumber: string;
  isFeatured: boolean;
  isAd: boolean;
  isVip: boolean;
  isPremium: boolean;
  views: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  items: T;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Fetch posts with pagination
export const getPosts = async (page = 1, limit = 10, userId?: string): Promise<ApiResponse<ApiPost[]>> => {
  let url: string;
  if (userId) {
    url = `/users/${userId}/posts?page=${page}&limit=${limit}`;
  } else {
    url = `/posts?page=${page}&limit=${limit}`;
  }
  
  const response = await apiClient.get<ApiResponse<ApiPost[]>>(url);

  return response.data;
};

// Fetch a single post by ID
export const getPostById = async (id: string): Promise<ApiPost> => {
  const response = await apiClient.get<ApiPost>(`/posts/${id}`);

  return response.data;
};

// Fetch featured posts
export const getFeaturedPosts = async (): Promise<ApiPost[]> => {
  const response = await apiClient.get('/posts/featured');
  return response.data as unknown as ApiPost[];
};

// Search posts
export const searchPosts = async (
  query: string,
  page = 1,
  limit = 10
): Promise<ApiResponse<ApiPost[]>> => {
  const response = await apiClient.get<ApiResponse<ApiPost[]>>(`/posts/search?q=${query}&page=${page}&limit=${limit}`);
  
  return response.data;
};
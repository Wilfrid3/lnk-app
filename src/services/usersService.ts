import apiClient from '@/lib/axios';

export interface User {
  _id: string;
  id: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  age?: number;
  userType: string;
  city?: string;
  bio?: string;
  isVerified: boolean;
  isPremium: boolean;
  isVip: boolean;
  offerings?: string[];
  appearance?: string;
  clientType?: string;
  followersCount?: number;
  postsCount?: number;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  premium?: boolean;
  city?: string;
  userType?: string;
  verified?: boolean;
  offerings?: string[];
  clientType?: string;
}

interface SearchUsersParams extends GetUsersParams {
  q?: string;
  minAge?: number;
  maxAge?: number;
}

// Fetch users with pagination and filtering
export const getUsers = async (params: GetUsersParams = {}): Promise<UserListResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add all parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const response = await apiClient.get<UserListResponse>(`/users?${queryParams.toString()}`);
  return response.data;
};

// Fetch a single user by ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

// Fetch featured users (premium/verified users)
export const getFeaturedUsers = async (params: GetUsersParams = {}): Promise<User[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add parameters to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await apiClient.get<UserListResponse>(`/users/featured?${queryParams.toString()}`);
    return response.data.users;
  } catch {
    // Fallback: get premium/VIP users
    console.warn('Featured users endpoint not available, falling back to premium users');
    const fallbackParams = { ...params, premium: true, limit: params.limit || 10 };
    const response = await getUsers(fallbackParams);
    return response.users;
  }
};

// Search users with advanced filtering
export const searchUsers = async (params: SearchUsersParams): Promise<UserListResponse> => {
  const queryParams = new URLSearchParams();
  
  // Add all parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const response = await apiClient.get<UserListResponse>(`/users/search?${queryParams.toString()}`);
  return response.data;
};

// Helper function: Get premium users only
export const getPremiumUsers = async (params: Omit<GetUsersParams, 'premium'> = {}): Promise<UserListResponse> => {
  return getUsers({ ...params, premium: true });
};

// Helper function: Get verified users only
export const getVerifiedUsers = async (params: Omit<GetUsersParams, 'verified'> = {}): Promise<UserListResponse> => {
  return getUsers({ ...params, verified: true });
};

// Helper function: Get users by city
export const getUsersByCity = async (city: string, params: Omit<GetUsersParams, 'city'> = {}): Promise<UserListResponse> => {
  return getUsers({ ...params, city });
};

// Helper function: Search users with simple query
export const simpleSearchUsers = async (query: string, page = 1, limit = 10): Promise<UserListResponse> => {
  return searchUsers({ q: query, page, limit });
};

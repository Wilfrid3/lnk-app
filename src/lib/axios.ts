import axios from 'axios';
import { getAuthToken } from '@/utils/cookies';

const apiURL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api');

const apiClient = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token && config.headers) {
      // Include the token in the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't tried to refresh the token yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      // Mark this request so we don't retry it again
      originalRequest._retry = true;
      
      try {
        // TODO: Implement token refresh logic here once available
        // const refreshToken = getCookie('refreshToken');
        // const response = await axios.post('/auth/refresh', { token: refreshToken });
        // const { accessToken } = response.data;
        // Update the token in cookies and memory
        // setAuthTokens(accessToken, refreshToken);
        
        // For now, just redirect to login
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

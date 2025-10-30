// Cookie utility functions
export const setCookie = (name: string, value: string, options: Record<string, string | number | boolean> = {}) => {
  if (typeof window === 'undefined') return;

  const cookieOptions = {
    path: '/',
    ...options,
  };
  
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  Object.entries(cookieOptions).forEach(([key, value]) => {
    cookieString += `; ${key}`;
    if (typeof value !== 'boolean' || value !== true) {
      cookieString += `=${value}`;
    }
  });
  
  document.cookie = cookieString;
};

export const getCookie = (name: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return decodeURIComponent(match[2]);
  return undefined;
};

export const removeCookie = (name: string, options: Record<string, string | number | boolean> = {}) => {
  if (typeof window === 'undefined') return;
  
  setCookie(name, '', {
    ...options,
    'max-age': 0,
  });
};

export const getAuthToken = (): string | undefined => {
  return getCookie('accessToken');
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  // Set access token (shorter expiry)
  setCookie('accessToken', accessToken, {
    'max-age': 86400, // 24 hours
    samesite: 'lax', // Changed to lax to work better with redirects
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only set secure in production
  });
  
  // Set refresh token (longer expiry)
  setCookie('refreshToken', refreshToken, {
    'max-age': 604800, // 7 days
    samesite: 'lax', // Changed to lax to work better with redirects
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only set secure in production
  });
  
  // For debugging
  // console.log('Cookies set - accessToken:', accessToken.substring(0, 20) + '...');
};

export const clearAuthTokens = () => {
  removeCookie('accessToken');
  removeCookie('refreshToken');
};
/**
 * Converts relative or localhost URLs to absolute URLs based on the environment
 * Helps with image loading in various environments (local, production)
 */
export const getFullImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it's already a full URL, return it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // In production, if we get localhost URLs, convert them to production URLs
    if (process.env.NODE_ENV === 'production' && 
       (url.includes('localhost:3000') || url.includes('localhost:3001'))) {
      // Replace with production URL
      const prodApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://v1.yamohub.com/api';
      const baseUrl = prodApiUrl.replace(/\/api$/, '');
      const newUrl = url.replace(/http:\/\/localhost:(3000|3001)/g, baseUrl);
      // console.log('🖼️ Image URL converted:', url, '->', newUrl);
      return newUrl;
    }
    // For production URLs that are already correct, return as-is
    // console.log('🖼️ Image URL (already absolute):', url);
    return url;
  }
  
  // If it's a relative URL, make it absolute by appending the appropriate base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const baseUrl = apiUrl.replace(/\/api$/, ''); // Remove /api if present
  
  // Join the base URL with the image URL, handling any slashes correctly
  const fullUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  // console.log('🖼️ Image URL (relative to absolute):', url, '->', fullUrl);
  return fullUrl;
};

/**
 * Converts relative video URLs to absolute URLs using the API base URL
 * Specifically for video streaming endpoints
 */
export const getFullVideoUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it's already a full URL, return it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL, prepend the API base URL
  if (url.startsWith('/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3000/api');
    // Remove '/api' from the end if it exists, since our video URLs already include '/api'
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
  }
  
  // For any other case, return the URL as-is
  return url;
};
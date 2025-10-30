'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/utils/analytics';

/**
 * Hook to track page views and handle route changes
 */
export function useTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track page views when route changes
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}
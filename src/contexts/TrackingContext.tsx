'use client';

import React, { createContext, useContext, ReactNode, Suspense } from 'react';
import { useTracking } from '@/hooks/useTracking';
import * as analytics from '@/utils/analytics';

// Create the context
interface TrackingContextType {
  trackEvent: typeof analytics.trackEvent;
  trackAuth: typeof analytics.trackAuth;
  trackProfile: typeof analytics.trackProfile;
  trackMessaging: typeof analytics.trackMessaging;
  trackService: typeof analytics.trackService;
  trackApp: typeof analytics.trackApp;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

// Create provider
interface TrackingProviderProps {
  children: ReactNode;
}

function TrackingSuspense() {
  useTracking();
  return null;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  const value = {
    trackEvent: analytics.trackEvent,
    trackAuth: analytics.trackAuth,
    trackProfile: analytics.trackProfile,
    trackMessaging: analytics.trackMessaging,
    trackService: analytics.trackService,
    trackApp: analytics.trackApp,
  };

  return (
    <TrackingContext.Provider value={value}>
      <Suspense fallback={null}>
        <TrackingSuspense />
      </Suspense>
      {children}
    </TrackingContext.Provider>
  );
}

// Custom hook for accessing the tracking context
export function useTrackingContext() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider');
  }
  return context;
}
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/axios';

interface AgeVerificationContextProps {
  isVerified: boolean;
  verify: () => void;
  decline: () => void;
  isExemptPath: boolean;
  tempExempt: boolean;
  setTempExempt: (exempt: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextProps | undefined>(undefined);

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
}

// Define exempt paths that don't require age verification
const EXEMPT_PATHS = ['/privacy', '/terms', '/privacy-policy', '/terms-of-service', '/help', '/contact', '/about', '/auth'];

export function AgeVerificationProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExemptPath, setIsExemptPath] = useState(false);
  const [tempExempt, setTempExempt] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  // Get current pathname
  const pathname = usePathname();

  // Check verification status when path changes
  useEffect(() => {
    // Don't do anything until auth is loaded
    if (authLoading) {
      return;
    }

    const checkVerification = async () => {
      try {
        // Check if current path is exempt from verification
        const isCurrentPathExempt = EXEMPT_PATHS.some(path => 
          pathname === path || pathname?.startsWith(path + '/')
        );
        
        // console.log('Current path:', pathname);
        // console.log('Is path exempt?', isCurrentPathExempt);
        // console.log('Temp exempt status:', tempExempt);
        
        setIsExemptPath(isCurrentPathExempt);

        // For authenticated users, check if they have already accepted terms
        if (user && user.acceptedTermsAndPrivacy) {
          setIsVerified(true);
          localStorage.setItem('age-verified', 'true');
          setIsLoaded(true);
          return;
        }

        // Local verification for non-authenticated users
        const localVerification = localStorage.getItem('age-verified') === 'true';
        
        if (localVerification) {
          setIsVerified(true);
          setIsLoaded(true);
          return;
        }

        // Only check API if user is authenticated but we don't know their terms status
        if (user && !user.acceptedTermsAndPrivacy) {
          try {
            interface MeResponse {
              acceptedTermsAndPrivacy?: boolean;
              [key: string]: unknown;
            }
            const response = await apiClient.get<MeResponse>('/auth/me');
            if (response.data?.acceptedTermsAndPrivacy) {
              setIsVerified(true);
              localStorage.setItem('age-verified', 'true');
            }
          } catch (error) {
            console.error('Error checking user status:', error);
          }
        }
        
        // Set as loaded regardless of API call result
        setIsLoaded(true);
      } catch (error) {
        console.error('Error checking age verification:', error);
        // Even if there's an error, still mark as loaded
        setIsLoaded(true);
      }
    };
    
    checkVerification();
  }, [user, authLoading, pathname, tempExempt]);

  // Verify user age and acceptance of terms
  const verify = async () => {
    try {
      // Set local storage flag first
      localStorage.setItem('age-verified', 'true');
      
      // Try to update on server if user is authenticated
      if (user) {
        // Send acceptance to the API with correct payload
        await apiClient.post('/auth/accept-terms', {
          accept: true
        });
      }
      
      setIsVerified(true);
    } catch (error) {
      console.error('Failed to set age verification:', error);
      // Even if API call fails, we still want to set local verification
      setIsVerified(true);
    }
  };

  // Decline and redirect to an appropriate page
  const decline = () => {
    // Clear any existing verification
    localStorage.removeItem('age-verified');
    
    // Redirect out
    window.location.href = 'https://www.google.com';
  };

  // Only render children after we've checked verification status
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>;
  }

  return (
    <AgeVerificationContext.Provider value={{ 
      isVerified, 
      verify, 
      decline, 
      isExemptPath, 
      tempExempt, 
      setTempExempt 
    }}>
      {children}
    </AgeVerificationContext.Provider>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  PhoneAuthProvider,
  signInWithCredential 
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User } from '@/types/User';
import { trackAuth } from '@/utils/analytics';
import apiClient from '@/lib/axios';
import { setAuthTokens, clearAuthTokens, getAuthToken } from '@/utils/cookies';
import { usePushNotifications } from '@/hooks/usePushNotifications';

// Define Tokens interface
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Define Spoofing State interface
interface SpoofingState {
  isSpoofing: boolean;
  originalUser: User | null;
  targetUser: User | null;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  spoofingState: SpoofingState;
  googleSignIn: () => Promise<void>;
  phoneSignIn: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: Tokens) => void;
  startSpoofing: (targetUserId: string) => Promise<void>;
  stopSpoofing: () => Promise<void>;
  checkSpoofingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigninIn, setIsSigninIn] = useState<boolean>(false);
  const [spoofingState, setSpoofingState] = useState<SpoofingState>({
    isSpoofing: false,
    originalUser: null,
    targetUser: null
  });

  // Get push notifications hook for unsubscribing on sign out
  const { unsubscribeFromPush } = usePushNotifications();

  // Set up recaptcha verifier
  const setupRecaptcha = useCallback((containerId: string) => {
    if (typeof window !== 'undefined') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, []);  // Store tokens in cookies for authentication and access by middleware
  const setTokens = useCallback((tokens: Tokens) => {
    // Set cookies with our utility function
    setAuthTokens(tokens.accessToken, tokens.refreshToken);
    
    // Also keep in memory for use by the client
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }, []);

  // Custom setUser function that also sets email verification cookies
  const setUserWithCookies = useCallback((user: User | null) => {
    setUser(user);
    
    if (user) {
      // Set email verification cookies for middleware
      if (user.email) {
        document.cookie = `user_email=${encodeURIComponent(user.email)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        document.cookie = `email_verified=${user.isEmailVerified ? 'true' : 'false'}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      } else {
        // Clear email cookies if no email
        document.cookie = 'user_email=; path=/; max-age=0';
        document.cookie = 'email_verified=; path=/; max-age=0';
      }
    } else {
      // Clear email cookies when user is null
      document.cookie = 'user_email=; path=/; max-age=0';
      document.cookie = 'email_verified=; path=/; max-age=0';
    }
  }, []);
  
  // Sign in with Google
  const googleSignIn = useCallback(async () => {
    setIsSigninIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // console.log('Google sign-in successful, result:', result);
        // Get the ID token from the result
      // This is the token we need to send to our backend
      const idToken = await result.user.getIdToken(true); // Force refresh to ensure fresh token
      
      // console.log('ID Token:', idToken.substring(0, 20) + '...' + idToken.substring(idToken.length - 20));
      // console.log('Sending ID token to backend API...');
      
      try {
        const inviteCode = sessionStorage.getItem('pendingInviteCode') || undefined;
        const queryParams = inviteCode ? `?ref=${inviteCode}` : '';
        // Send the token to your backend API
        const response = await apiClient.post(`/auth/google${queryParams}`, { idToken });
        
        // Get tokens and user data from your backend
        const { user, accessToken, refreshToken } = response.data as {
          user: User;
          accessToken: string;
          refreshToken: string;
        };
        
        // Store tokens securely
        setTokens({ accessToken, refreshToken });
        
        // Set user data from the backend response
        setUserWithCookies(user);
        
        // Track successful login
        trackAuth.login('social');      } catch (error: unknown) {
        const apiError = error as { response?: { data?: Record<string, unknown> }, message?: string };
        console.error('API Error:', apiError.response?.data || apiError.message || 'Unknown error');
        // Handle API error but don't throw yet - we'll create a temporary user instead
        
        // For now, create a temporary user object from Firebase auth
        // This allows the user to proceed even if backend auth fails
        setUserWithCookies({
          _id: result.user.uid,
          email: result.user.email ?? undefined,
          name: result.user.displayName ?? undefined,
          avatar: result.user.photoURL ?? undefined,
          isEmailVerified: result.user.emailVerified,
          isActive: true,
        });
        
        // Check if this is the "Invalid Google token" error
        const isInvalidTokenError = 
          apiError.response?.data?.message === 'Invalid Google token' ||
          apiError.response?.data?.statusCode === 401;
          
        if (isInvalidTokenError) {
          console.error('Backend token verification issue - check firebaseService.verifyGoogleIdToken configuration');
        }
        
        trackAuth.error('google_signin_api', new Error(apiError.message || 'API Authentication failed'));
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      trackAuth.error('google_signin', error as Error);
      throw error;
    } finally {
      setIsSigninIn(false);
    }
  }, [setTokens, setUserWithCookies]);

  // Sign in with phone number
  const phoneSignIn = useCallback(async (phoneNumber: string) => {
    try {
      // Set up invisible reCAPTCHA
      setupRecaptcha('recaptcha-container');
      
      // Send verification code
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      
      // Store the verificationId to use when confirming the code
      return confirmationResult.verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      trackAuth.error('phone_verification_send', error as Error);
      throw error;
    }
  }, [setupRecaptcha]);

  // Verify phone verification code
  const verifyPhoneCode = useCallback(async (verificationId: string, code: string) => {
    try {
      // Create credential
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Sign in with credential
      const result = await signInWithCredential(auth, credential);
      
      // Create a simple user object
      setUserWithCookies({
        _id: result.user.uid,
        phoneNumber: result.user.phoneNumber ?? undefined,
        isPhoneVerified: true,
        isActive: true,
      });
      
      // Track successful verification
      trackAuth.verifyPhone();
      trackAuth.login('phone');
    } catch (error) {
      console.error('Error verifying code:', error);
      trackAuth.error('phone_verification', error as Error);
      throw error;
    }
  }, [setUserWithCookies]);  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Unsubscribe from push notifications before signing out
      try {
        await unsubscribeFromPush();
        console.log('Successfully unsubscribed from push notifications during sign out');
      } catch (unsubscribeError) {
        console.warn('Failed to unsubscribe from push notifications during sign out:', unsubscribeError);
        // Don't block sign out if notification unsubscribe fails
      }

      await firebaseSignOut(auth);
      setUserWithCookies(null);
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear cookies using our utility function
      clearAuthTokens();
      
      // Reset spoofing state
      setSpoofingState({
        isSpoofing: false,
        originalUser: null,
        targetUser: null
      });
      
      trackAuth.logout();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }, [setUserWithCookies, unsubscribeFromPush]);

  // Start spoofing a user (admin only)
  const startSpoofing = useCallback(async (targetUserId: string) => {
    try {
      if (!user?.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }


      const response = await apiClient.post('/auth/admin/start-spoofing', { 
        targetUserId 
      });
      
      
      const { accessToken, refreshToken, user: targetUser } = response.data as {
        accessToken: string;
        refreshToken: string;
        user: User;
      };
      
      
      // Store the original user before spoofing
      setSpoofingState({
        isSpoofing: true,
        originalUser: user,
        targetUser: targetUser
      });
      
      // Update tokens
      setTokens({ accessToken, refreshToken });
      
      // Set the target user as current user
      setUserWithCookies(targetUser);
      
    } catch (error) {
      console.error('Error starting spoofing:', error);
      throw error;
    }
  }, [user, setTokens, setUserWithCookies]);

  // Stop spoofing and return to admin account
  const stopSpoofing = useCallback(async () => {
    try {
      if (!spoofingState.isSpoofing) {
        throw new Error('Not currently spoofing');
      }

      const response = await apiClient.post('/auth/admin/stop-spoofing');
      
      const { accessToken, refreshToken } = response.data as {
        accessToken: string;
        refreshToken: string;
      };
      
      // Restore original admin user
      const originalUser = spoofingState.originalUser;
      
      // Reset spoofing state
      setSpoofingState({
        isSpoofing: false,
        originalUser: null,
        targetUser: null
      });
      
      // Update tokens
      setTokens({ accessToken, refreshToken });
      
      // Restore original user
      setUserWithCookies(originalUser);
      
    } catch (error) {
      console.error('Error stopping spoofing:', error);
      throw error;
    }
  }, [spoofingState, setTokens, setUserWithCookies]);

  // Check spoofing status (useful for page refreshes)
  const checkSpoofingStatus = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/admin/spoofing-status');
      
      const { isSpoofing, originalUser, targetUser } = response.data as {
        isSpoofing: boolean;
        originalUser: User | null;
        targetUser: User | null;
      };
      
      
      if (isSpoofing) {
        setSpoofingState({
          isSpoofing: true,
          originalUser: originalUser,
          targetUser: targetUser
        });
      } else {
        setSpoofingState({
          isSpoofing: false,
          originalUser: null,
          targetUser: null
        });
      }
    } catch (error) {
      console.error('Error checking spoofing status:', error);
      // Reset on error
      setSpoofingState({
        isSpoofing: false,
        originalUser: null,
        targetUser: null
      });
    }
  }, []);
    // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isSigninIn) return; // Skip if we're in the middle of signing in
      setCurrentUser(firebaseUser);
      
      // Check for existing tokens in cookies on auth state change
      const cookieAccessToken = getAuthToken();
      
      if (firebaseUser) {
        try {
          // Get the ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Check if we have stored tokens either in localStorage or cookies
          const localAccessToken = localStorage.getItem('accessToken');
          const accessToken = cookieAccessToken || localAccessToken;
          
          if (!accessToken) {
            // If we don't have tokens, get them from the API
            const inviteCode = sessionStorage.getItem('pendingInviteCode') || undefined;
            const queryParams = inviteCode ? `?ref=${inviteCode}` : '';
            const response = await apiClient.post(`/auth/google${queryParams}`, { idToken });
            
            if (response && response.status === 200) {
              const { user, accessToken, refreshToken } = response.data as { 
                user: User; 
                accessToken: string; 
                refreshToken: string; 
              };
              
              // Store tokens
              setTokens({ accessToken, refreshToken });
              
              // Set user data from the backend
              setUserWithCookies(user);
            } else {
              console.error('Failed to authenticate with backend');
              setUserWithCookies(null);
            }
          } else {
            // We have tokens, try to fetch user info
            try {
              const userResponse = await apiClient.get('/auth/me');
              if (userResponse && userResponse.status === 200) {
                const userData = userResponse.data as User;
                setUserWithCookies(userData);
                
                // Check spoofing status for admin users
                if (userData.isAdmin) {
                  try {
                    await checkSpoofingStatus();
                  } catch (spoofError) {
                    console.warn('Error checking spoofing status:', spoofError);
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              // Token might be invalid, clear it
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              setUserWithCookies(null);
            }
          }
        } catch (error) {
          console.error('Error during authentication state change:', error);
          setUserWithCookies(null);
        }      } else {
        // Even if Firebase says no user, check for API tokens in cookies
        const cookieAccessToken = getAuthToken();
        
        if (cookieAccessToken) {
          // We have a token, try to fetch user info
          try {
            const userResponse = await apiClient.get('/auth/me');
            if (userResponse && userResponse.status === 200) {
              const userData = userResponse.data as User;
              setUserWithCookies(userData);
              
              // Check spoofing status for admin users or if we might be spoofed
              try {
                await checkSpoofingStatus();
              } catch (spoofError) {
                console.warn('Error checking spoofing status:', spoofError);
              }
              
              setLoading(false);
              return; // Exit early, we're authenticated
            }
          } catch (error) {
            console.error('Error fetching user data from token:', error);
            // Token might be invalid, clear it
            clearAuthTokens();
          }
        }
        
        // If we reach here, either no token or token was invalid
        setUserWithCookies(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        clearAuthTokens();
      }
      
      setLoading(false);
    });

    // Check for tokens on initial load, even without Firebase auth
    const checkTokens = async () => {
      const cookieAccessToken = getAuthToken();
      if (cookieAccessToken && !currentUser) {
        try {
          const userResponse = await apiClient.get('/auth/me');
          if (userResponse && userResponse.status === 200) {
            const userData = userResponse.data as User;
            setUserWithCookies(userData);
            
            // Check spoofing status
            try {
              await checkSpoofingStatus();
            } catch (spoofError) {
              console.warn('Error checking spoofing status on init:', spoofError);
            }
          }
        } catch (error) {
          console.error('Error validating token on init:', error);
          clearAuthTokens();
        }
      }
      
      // In any case, we've finished initial loading
      setLoading(false);
    };
    
    checkTokens();
      return unsubscribe;
  }, [setTokens, currentUser, isSigninIn, setUserWithCookies, checkSpoofingStatus]);
  
  // Check spoofing status on user change (admin users only)
  useEffect(() => {
    if (user?.isAdmin && !loading) {
      checkSpoofingStatus();
    }
  }, [user, loading, checkSpoofingStatus]);
    // Use useMemo to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    currentUser,
    user,
    loading,
    spoofingState,
    googleSignIn,
    phoneSignIn,
    verifyPhoneCode,
    signOut,
    setUser: setUserWithCookies,
    setTokens,
    startSpoofing,
    stopSpoofing,
    checkSpoofingStatus
  }), [currentUser, user, loading, spoofingState, googleSignIn, phoneSignIn, verifyPhoneCode, signOut, setUserWithCookies, setTokens, startSpoofing, stopSpoofing, checkSpoofingStatus]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Add window type for recaptcha verifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}


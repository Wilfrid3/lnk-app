'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { FaGoogle } from 'react-icons/fa';
import { trackAuth } from '@/utils/analytics';

interface GoogleSignInButtonProps {
  onSuccess?: () => void
  onError?: (error: unknown) => void
  className?: string
  inviteCode?: string
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onSuccess, 
  onError, 
  className = ''
}) => {
  const { googleSignIn } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Track auth attempt if analytics is available
      if (typeof trackAuth !== 'undefined') {
        trackAuth.attempt('social');
      }
      
      // Include invite code in Google OAuth URL if present
      // const queryParams = inviteCode ? `?ref=${inviteCode}` : '';
      
      // If googleSignIn method exists from auth context, use it
      await googleSignIn();
      onSuccess?.();
      
    } catch (error) {
      console.error('Google sign in error:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className={`flex items-center justify-center gap-2 w-full ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <FaGoogle className="text-red-500" />
      )}
      <span>Continuer avec Google</span>
    </Button>
  );
};

export default GoogleSignInButton;

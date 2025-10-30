'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LogoutView() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      if (isLoggingOut) return; // Prevent double execution
      
      setIsLoggingOut(true);
      
      try {
        // Perform proper logout with notification unsubscription
        await signOut();
        console.log('Successfully logged out');
      } catch (error) {
        console.error('Error during logout:', error);
      }
      
      // Redirect to home page after logout
      setTimeout(() => {
        router.push('/');
      }, 1500);
    };

    performLogout();
  }, [signOut, router, isLoggingOut]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="animate-spin mb-6">
          <span className="material-icons text-5xl text-primary-500">autorenew</span>
        </div>
        <h1 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Déconnexion en cours...</h1>
        <p className="text-gray-500 dark:text-gray-400">Merci d&apos;avoir utilisé Le Yamo</p>
      </div>
    </div>
  );
}

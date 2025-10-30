'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * AuthGuard component - protects client-side routes 
 * Use this in addition to middleware for better security
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback = <div className="flex justify-center items-center min-h-screen">Loading...</div> 
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [user, loading, router])

  // Show fallback while loading or if not authenticated
  if (loading || !user) {
    return <>{fallback}</>
  }

  // User is authenticated, render children
  return <>{children}</>
}

export default AuthGuard
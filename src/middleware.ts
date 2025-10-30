import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const protectedPaths = [
  '/profile',
  '/app',
  '/messages',
  '/favoris',
  '/settings',
  '/publish'
]

// Paths that should not be accessible if the user is authenticated
const authPaths = [
  '/auth/signin',
  '/auth/signup',
]

// Note: verification paths are handled separately and don't redirect authenticated users

// Paths that should be accessible even if email is not verified
const emailVerificationExemptPaths = [
  '/auth/verify-email',
  '/auth/signin',
  '/auth/signup',
  '/privacy',
  '/terms',
  '/help',
  '/contact',
  '/about'
]

// Function to check if the path starts with any of the protected paths
const isProtectedPath = (path: string): boolean => {
  return protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )
}

// Function to check if the path is an authentication path
const isAuthPath = (path: string): boolean => {
  return authPaths.some(authPath => 
    path === authPath
  )
}

// Define paths that are exempt from age verification
const EXEMPT_PATHS = ['/privacy', '/terms', '/help', '/contact', '/about', '/auth'];

// Helper function to check if request should skip middleware
const shouldSkipMiddleware = (path: string): boolean => {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.')
  )
}

// Helper function to handle email verification check
const handleEmailVerificationCheck = (request: NextRequest, path: string) => {
  if (!emailVerificationExemptPaths.some(exemptPath => path.startsWith(exemptPath))) {
    try {
      // Check if user has verified email status in cookies
      const emailVerifiedCookie = request.cookies.get('email_verified')?.value
      const userEmailCookie = request.cookies.get('user_email')?.value
      
      // If we have email info in cookies
      if (userEmailCookie && emailVerifiedCookie === 'false') {
        const verifyEmailUrl = new URL('/auth/verify-email', request.url)
        verifyEmailUrl.searchParams.set('email', userEmailCookie)
        return NextResponse.redirect(verifyEmailUrl)
      }
      
      // If we don't have email verification info in cookies, we'll let the user through
      // The AuthContext will handle checking and setting these cookies when user data is loaded
      
    } catch (error) {
      console.error('Error in email verification check:', error)
      // If there's an error, we'll skip the email verification check
      // to avoid blocking the user
    }
  }
  return null
}

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname
  
  // Skip middleware for api routes, static files, etc.
  if (shouldSkipMiddleware(path)) {
    return NextResponse.next()
  }  // Get the authentication token from cookies
  const accessToken = request.cookies.get('accessToken')?.value
  // Check for both cookie and authorization header
  const authHeader = request.headers.get('authorization')
  const headerToken = authHeader ? authHeader.replace('Bearer ', '') : null
  
  const token = accessToken ?? headerToken
  const isAuthenticated = !!token

  // For debugging
  console.log('Middleware - Path:', path)
  console.log('Middleware - Cookie Token exists:', !!accessToken)
  console.log('Middleware - Header Token exists:', !!headerToken)
  console.log('Middleware - Is Authenticated:', isAuthenticated)
  
  // If user is authenticated, check for email verification requirements
  if (isAuthenticated) {
    const emailVerificationResult = handleEmailVerificationCheck(request, path)
    if (emailVerificationResult) {
      return emailVerificationResult
    }
  }
  
  // If path is protected and user is not authenticated, redirect to login
  if (isProtectedPath(path) && !isAuthenticated) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(path))
    return NextResponse.redirect(loginUrl)
  }

  // If path is an auth path and user is authenticated, redirect to home
  if (isAuthPath(path) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Skip verification for exempt paths - FIXED: use 'path' instead of 'pathname'
  if (EXEMPT_PATHS.some(exemptPath => path.startsWith(exemptPath))) {
    return NextResponse.next();
  }

  // Check for our secure verification cookie
  const verified = request.cookies.get('age_verified')?.value === 'true';

  // If not verified, redirect to home with verification required
  if (!verified) {
    // Instead of redirecting, we can pass the request but add a header
    // This will be checked by our AgeVerificationContext to force display the modal
    const response = NextResponse.next();
    response.headers.set('x-age-verification-required', 'true');
    return response;
  }

  // Continue with request
  return NextResponse.next();
}

// Configure Middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /fonts (static resources)
     * 4. /public (public resources)
     * 5. all root files like favicon.ico, robots.txt, etc.
     */
    '/((?!api|_next|fonts|public|[\\w-]+\\.\\w+).*)',
  ],
}
// src/components/OptimizedImage.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Generate a simple blur placeholder if none provided
  const generateBlurDataURL = (w: number = 20, h: number = 20) => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="60%" height="20%" x="20%" y="40%" fill="#e5e7eb" rx="4"/>
      </svg>`
    )}`
  }

  // Fallback image for errors
  const fallbackSrc = '/images/logo.png'

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <Image
          src={fallbackSrc}
          alt="YamoZone Logo"
          width={width}
          height={height}
          className="opacity-50"
          loading={loading}
        />
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    quality,
    priority,
    loading,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: placeholder as 'blur' | 'empty' | undefined,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined),
    sizes: sizes || (fill ? '100vw' : undefined),
  }

  if (fill) {
    return (
      <div className="relative">
        <Image
          {...imageProps}
          alt={alt}
          fill
          style={{ objectFit }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        alt={alt}
        width={width}
        height={height}
        style={{ objectFit }}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '100%',
          }}
        />
      )}
    </div>
  )
}

// Helper function to get optimized image URLs
export function getOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 85
): string {
  if (!src) return '/images/logo.png'
  
  // If it's already a full URL, return as is
  if (src.startsWith('http')) return src
  
  // If it's a relative path, ensure it starts with /
  const normalizedSrc = src.startsWith('/') ? src : `/${src}`
  
  // For Next.js Image Optimization API
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  return `${normalizedSrc}?${params.toString()}`
}

// Generate responsive image sizes for different breakpoints
export function generateImageSizes(options: {
  mobile?: number
  tablet?: number
  desktop?: number
  default?: number
}): string {
  const { mobile = 100, tablet = 50, desktop = 33, default: defaultSize = 100 } = options
  
  return [
    `(max-width: 640px) ${mobile}vw`,
    `(max-width: 1024px) ${tablet}vw`,
    `(max-width: 1280px) ${desktop}vw`,
    `${defaultSize}vw`,
  ].join(', ')
}

import { getFullImageUrl, getFullVideoUrl } from '@/utils/imageUtils';
import React, { useRef, useEffect, useState } from 'react'

interface UserVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  likes: number;
  isActive: boolean;
  privacy: 'public' | 'private';
  createdAt: string;
  user: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  tags: string[];
}

interface VideoGridItemProps {
  video: UserVideo
  onClick: () => void
  className?: string
}

const VideoGridItem: React.FC<VideoGridItemProps> = ({ video, onClick, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    const handleLoadedData = () => {
      // Set the video to loop only the first 5 seconds
      videoElement.currentTime = 0
    }

    const handleTimeUpdate = () => {
      if (videoElement.currentTime >= 5) {
        videoElement.currentTime = 0
      }
    }

    const handleError = (e: Event) => {
      console.error('Video loading error:', video.title, e)
      setIsLoaded(true) // Show the poster/thumbnail instead
    }

    videoElement.addEventListener('canplay', handleCanPlay)
    videoElement.addEventListener('loadeddata', handleLoadedData)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('error', handleError)

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay)
      videoElement.removeEventListener('loadeddata', handleLoadedData)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('error', handleError)
    }
  }, [video.title])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !isLoaded) return

    if (isHovered) {
      videoElement.play().catch(console.error)
    } else {
      videoElement.pause()
      videoElement.currentTime = 0
    }
  }, [isHovered, isLoaded])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div
      className={`relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster={getFullImageUrl(video.thumbnailUrl)}
      >
        <source src={getFullVideoUrl(video.videoUrl)} type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Duration Badge */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
        {formatDuration(video.duration)}
      </div>

      {/* Privacy Badge */}
      {video.privacy === 'private' && (
        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <span className="material-icons text-xs">lock</span>
          Privé
        </div>
      )}

      {/* Stats Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="material-icons text-sm">visibility</span>
                <span>{formatViews(video.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-icons text-sm">favorite</span>
                <span>{formatViews(video.likes)}</span>
              </div>
            </div>
          </div>        {/* Title */}
        <h3 className="text-sm font-medium leading-tight overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {video.title}
        </h3>
      </div>

      {/* Hover Play Icon */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="material-icons text-white text-2xl">play_arrow</span>
        </div>
      </div>

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default VideoGridItem

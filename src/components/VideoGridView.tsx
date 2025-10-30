import React, { useState, useEffect } from 'react'
import VideoGridItem from './VideoGridItem'
import ProfileVideosView from '../views/ProfileVideosView'

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

interface VideoGridViewProps {
  videos: UserVideo[]
  userId: string
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onRefresh?: () => void
}

const VideoGridView: React.FC<VideoGridViewProps> = ({
  videos,
  userId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onRefresh
}) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null)
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullScreenOpen) return

      switch (e.key) {
        case 'Escape':
          setIsFullScreenOpen(false)
          setSelectedVideoIndex(null)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedVideoIndex(prev => 
            prev !== null && prev > 0 ? prev - 1 : prev
          )
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedVideoIndex(prev => 
            prev !== null && prev < videos.length - 1 ? prev + 1 : prev
          )
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullScreenOpen, videos.length])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0]
        if (lastEntry.isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const lastVideoElement = document.querySelector('.video-grid-item:last-child')
    if (lastVideoElement) {
      observer.observe(lastVideoElement)
    }

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isLoading, videos.length])

  const handleVideoClick = (index: number) => {
    setSelectedVideoIndex(index)
    setIsFullScreenOpen(true)
  }

  const handleCloseFullScreen = () => {
    setIsFullScreenOpen(false)
    setSelectedVideoIndex(null)
  }

  // Convert UserVideo to Video format for ProfileVideosView
  const convertToVideosViewFormat = (userVideos: UserVideo[]) => {
    return userVideos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      user: {
        id: video.user.id,
        name: video.user.name,
        avatar: undefined,
        isVerified: video.user.isVerified
      },
      stats: video.stats,
      isLiked: video.isLiked,
      duration: video.duration,
      createdAt: video.createdAt,
      tags: video.tags,
      privacy: video.privacy
    }))
  }

  if (videos.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="material-icons text-4xl text-gray-400">videocam_off</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune vidéo</h3>
        <p className="text-gray-600 max-w-sm">
          Aucune vidéo n&apos;a été publiée pour le moment.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualiser
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Video Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {videos.map((video, index) => (
          <VideoGridItem
            key={video.id}
            video={video}
            onClick={() => handleVideoClick(index)}
            className="video-grid-item"
          />
        ))}
        
        {/* Loading Skeleton Items */}
        {isLoading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && hasMore && videos.length > 0 && (
        <div className="flex justify-center py-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Charger plus de vidéos
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && videos.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Chargement...</span>
          </div>
        </div>
      )}

      {/* No More Videos Message */}
      {!hasMore && videos.length > 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <span className="material-icons mb-2">check_circle</span>
          <p>Toutes les vidéos ont été chargées</p>
        </div>
      )}

      {/* Full Screen Video Viewer */}
      {isFullScreenOpen && selectedVideoIndex !== null && (
        <ProfileVideosView
          userId={userId}
          videos={convertToVideosViewFormat(videos)}
          initialVideoIndex={selectedVideoIndex}
          onClose={handleCloseFullScreen}
        />
      )}
    </>
  )
}

export default VideoGridView

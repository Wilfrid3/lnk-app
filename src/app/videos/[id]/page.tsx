'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useChatHandler } from '@/utils/chatUtils'
import VideoPlayer from '@/components/VideoPlayer'
import CommentsModal from '@/components/CommentsModal'
import apiClient from '@/lib/axios'

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  user: {
    id: string
    name: string
    avatar?: string
    isVerified: boolean
  }
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  isLiked: boolean
  duration: number
  createdAt: string
  tags?: string[]
  location?: string
  privacy: 'public' | 'private'
}

const SingleVideoPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const videoId = Array.isArray(params.id) ? params.id[0] : params.id
  
  // Chat handler
  const { handleChat } = useChatHandler(router, user)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [commentsModalOpen, setCommentsModalOpen] = useState(false)
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [targetVideoLoaded, setTargetVideoLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const isScrolling = useRef<boolean>(false)
  const loadingRef = useRef<boolean>(false)

  // Load the target video first, then additional videos
  const loadTargetVideo = useCallback(async () => {
    if (!videoId) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Fetch the specific video
      const videoResponse = await apiClient.get(`/videos/${videoId}`)
      const targetVideo = videoResponse.data as Video
      
      // Set the target video as the first video
      setVideos([targetVideo])
      setCurrentIndex(0)
      setTargetVideoLoaded(true)
      
    } catch (error) {
      console.error('Error loading target video:', error)
      setError('Vidéo introuvable. Elle a peut-être été supprimée ou n\'est plus disponible.')
    } finally {
      setLoading(false)
    }
  }, [videoId])

  // Load additional videos to create a continuous experience
  const loadAdditionalVideos = useCallback(async (pageNum: number = 1) => {
    if (loadingRef.current || !targetVideoLoaded) return
    
    loadingRef.current = true
    
    try {
      const response = await apiClient.get(`/videos`, {
        params: {
          page: pageNum,
          limit: 10,
          excludes: [videoId] // Exclude the current video to avoid duplicates
        }
      })
      
      const data = response.data as { videos: Video[], hasMore: boolean }
      
      if (pageNum === 1) {
        // Add additional videos after the target video
        setVideos(prev => [...prev, ...data.videos])
      } else {
        // Append more videos for pagination
        setVideos(prev => [...prev, ...data.videos])
      }
      
      setHasMore(data.hasMore)
      setPage(pageNum)
      
    } catch (error) {
      console.error('Error loading additional videos:', error)
      // Don't set error here as the main video is already loaded
    } finally {
      loadingRef.current = false
    }
  }, [videoId, targetVideoLoaded])

  // Initial load
  useEffect(() => {
    loadTargetVideo()
  }, [loadTargetVideo])

  // Load additional videos after target video is loaded
  useEffect(() => {
    if (targetVideoLoaded) {
      loadAdditionalVideos(1)
    }
  }, [targetVideoLoaded, loadAdditionalVideos])

  // Preload more videos when approaching the end
  useEffect(() => {
    if (currentIndex >= videos.length - 3 && hasMore && !loadingRef.current && targetVideoLoaded) {
      loadAdditionalVideos(page + 1)
    }
  }, [currentIndex, videos.length, hasMore, page, targetVideoLoaded, loadAdditionalVideos])

  // Navigation functions
  const goToNextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, videos.length])

  const goToPreviousVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  // Handle touch/mouse events for swiping (same as VideosView)
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      e.preventDefault()
    }
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    startY.current = clientY
    currentY.current = clientY
    isScrolling.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!startY.current) return
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    currentY.current = clientY
    
    const deltaY = currentY.current - startY.current
    
    if ('touches' in e && Math.abs(deltaY) > 5) {
      e.preventDefault()
    }
    
    if (Math.abs(deltaY) > 20) {
      isScrolling.current = true
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isScrolling.current || !startY.current) {
      startY.current = 0
      currentY.current = 0
      isScrolling.current = false
      return
    }

    const deltaY = currentY.current - startY.current
    const threshold = 50

    if (Math.abs(deltaY) > threshold) {
      e.preventDefault()
      e.stopPropagation()
      
      if (deltaY > 0) {
        goToPreviousVideo()
      } else {
        goToNextVideo()
      }
    }

    startY.current = 0
    currentY.current = 0
    isScrolling.current = false
  }, [goToNextVideo, goToPreviousVideo])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        goToPreviousVideo()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goToNextVideo()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        router.back()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextVideo, goToPreviousVideo, router])

  // Video actions (same as VideosView)
  const handleLike = async (videoId: string) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      await apiClient.post(`/videos/${videoId}/like`)

      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? {
              ...v,
              isLiked: !v.isLiked,
              stats: {
                ...v.stats,
                likes: v.isLiked ? v.stats.likes - 1 : v.stats.likes + 1
              }
            }
          : v
      ))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = (videoId: string) => {
    setSelectedVideoForComments(videoId)
    setCommentsModalOpen(true)
  }

  const handleCommentAdded = (videoId: string) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId 
        ? { ...v, stats: { ...v.stats, comments: v.stats.comments + 1 } }
        : v
    ))
  }

  const handleShare = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId)
    if (!video) return

    const shareUrl = `${window.location.origin}/videos/${videoId}`
    const shareText = `Regardez cette vidéo de ${video.user.name} sur yamohub`

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl
        })
        
        await apiClient.post(`/videos/${videoId}/share`)
        
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, stats: { ...v.stats, shares: v.stats.shares + 1 } }
            : v
        ))
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Lien copié dans le presse-papier')
        
        await apiClient.post(`/videos/${videoId}/share`)
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, stats: { ...v.stats, shares: v.stats.shares + 1 } }
            : v
        ))
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  const handleMessage = (userId: string) => {
    handleChat(userId)
  }

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 500)
    }
  }

  // Loading state
  if (loading && videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement de la vidéo...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto px-4">
          <span className="material-icons text-6xl mb-4 block opacity-50">error_outline</span>
          <h2 className="text-2xl font-bold mb-2">Vidéo introuvable</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/videos')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Découvrir d&apos;autres vidéos
            </button>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main video view
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div className="sr-only">
          Use swipe up/down or arrow keys to navigate between videos
        </div>
        
        {videos.map((video, index) => {
          let transformClass = 'translate-y-full'
          if (index === currentIndex) {
            transformClass = 'translate-y-0'
          } else if (index < currentIndex) {
            transformClass = '-translate-y-full'
          }

          return (
            <div
              key={video.id}
              className={`absolute inset-0 transition-transform duration-300 ease-out ${transformClass}`}
            >
              <VideoPlayer
                video={video}
                isActive={index === currentIndex}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onMessage={handleMessage}
                onVideoEnd={handleVideoEnd}
              />
            </div>
          )
        })}

        {/* Navigation counter */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-primary-500/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {currentIndex + 1} / {videos.length}
            {currentIndex === 0 && (
              <span className="ml-2 text-yellow-300">★</span>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 z-30 flex-col items-center space-y-2 hidden md:flex">
          {currentIndex > 0 && (
            <button
              onClick={goToPreviousVideo}
              className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-primary-500/70 transition-all duration-200 backdrop-blur-sm"
            >
              <span className="material-icons text-sm">keyboard_arrow_up</span>
            </button>
          )}
          {currentIndex < videos.length - 1 && (
            <button
              onClick={goToNextVideo}
              className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-primary-500/70 transition-all duration-200 backdrop-blur-sm"
            >
              <span className="material-icons text-sm">keyboard_arrow_down</span>
            </button>
          )}
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 pl-2 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-primary-500/70 transition-all duration-200 backdrop-blur-sm"
          >
            <span className="material-icons">arrow_back_ios</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={commentsModalOpen}
        onClose={() => setCommentsModalOpen(false)}
        videoId={selectedVideoForComments ?? ''}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}

export default SingleVideoPage

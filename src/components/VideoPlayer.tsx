'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { getFullImageUrl, getFullVideoUrl } from '@/utils/imageUtils'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  phone?: string
  whatsapp?: string
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
}

interface VideoPlayerProps {
  video: Video
  isActive: boolean
  onLike: (videoId: string) => void
  onComment: (videoId: string) => void
  onShare: (videoId: string) => void
  // onMessage: (userId: string) => void
  onVideoEnd: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  onLike,
  onComment,
  onShare,
  onVideoEnd
}) => {
  const router = useRouter()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleDurationChange = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onVideoEnd()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('ended', handleEnded)
    }
  }, [onVideoEnd])

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isActive])

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)

      // Show play/pause icon feedback
      setShowPlayPauseIcon(true)
      setTimeout(() => setShowPlayPauseIcon(false), 500)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLElement>) => {
    if (!videoRef.current || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const seekPercentage = clickX / rect.width
    const seekTime = seekPercentage * duration

    videoRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
    setProgress(seekPercentage * 100)
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    try {
      onLike(video.id)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = () => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    onComment(video.id)
  }

  const handleWhatsapp = () => {
    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    console.log('Handling WhatsApp contact for video:', video)
    if (video?.whatsapp) {
      let whatsappNumber = video.whatsapp.startsWith('+')
        ? video.whatsapp.substring(1)
        : video.whatsapp
      const message = `Salut 😊. Je viens de voir votre annonce sur https://yamohub.com et je suis intéressé par vos services`
      whatsappNumber = whatsappNumber.replace(/\s+/g, '') // Remove spaces if any
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else if (video?.phone) {
      // Use phone number as fallback
      let phoneNumber = video.phone.startsWith('+')
        ? video.phone.substring(1)
        : video.phone
      const message = `Salut 😊. Je viens de voir votre annonce sur www.yamohub.com et je suis intéressé par vos services`
      phoneNumber = phoneNumber.replace(/\s+/g, '') // Remove spaces if any
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // const handleMessage = () => {
  //   if (!user) {
  //     router.push('/auth/signin')
  //     return
  //   }
  //   onMessage(video.user.id)
  // }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatCount = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover relative z-10"
        src={getFullVideoUrl(video.videoUrl)}
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={togglePlayPause}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <track kind="captions" label="English" />
      </video>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 z-30 pointer-events-none">
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center hover:bg-primary-500/30 transition-all duration-200 backdrop-blur-sm pointer-events-auto"
          >
            <span className="material-icons text-white text-4xl">play_arrow</span>
          </button>
        </div>
      )}

      {/* Play/Pause Toggle Feedback */}
      {showPlayPauseIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="w-16 h-16 rounded-full bg-primary-500/80 flex items-center justify-center animate-pulse">
            <span className="material-icons text-white text-3xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Progress Bar with Time Indicators - Always visible */}
      <div className="absolute -bottom-1.5 left-0 right-0 z-40">
        {/* Time indicators */}
        {showControls && (
          <div className="flex justify-between items-center text-white text-xs px-2 animate-fade-in mb-4 mt-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>
      <div className="absolute -bottom-1.5 left-0 right-0 z-40">
        {/* Progress bar */}
        <button
          className="w-full bg-gray-800/60 h-1 hover:h-2 transition-all duration-200 border-none outline-none focus:h-2 focus:outline-primary-500"
          onClick={handleSeek}
          aria-label="Seek video"
        >
          <div
            className="bg-primary-500 h-full transition-all duration-100 pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        </button>
      </div>

      {/* User Info */}
      <div className="absolute bottom-4 left-4 right-20 text-white z-30">
        {/* redirect to user profile */}
        <Link href={`/users/${video.user.id}`}>
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 ring-2 ring-white/20">
              {video.user.avatar ? (
                <Image
                  src={getFullImageUrl(video.user.avatar) ?? '/images/avatars/default_tous.png'}
                  alt={video.user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white font-bold">
                  {video.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-semibold text-sm drop-shadow-lg">{video.user.name}</span>
                {video.user.isVerified && (
                  <span className="material-icons text-blue-400 ml-1 text-sm drop-shadow-lg">verified</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {video.description && (
          <p className="text-sm mb-2 line-clamp-2 drop-shadow-lg">{video.description}</p>
        )}

        <div className="flex items-center text-xs text-gray-300 drop-shadow-lg">
          <span className="mr-4">{formatCount(video.stats.views)} vues</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-4 flex flex-col items-center space-y-2 z-30">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${video.isLiked
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-black/60 text-white hover:bg-primary-500/80'
            } ${isLiking ? 'opacity-50' : ''}`}
        >
          <span className="material-icons">
            {video.isLiked ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        <span className="text-white text-xs drop-shadow-lg -mt-1">{formatCount(video.stats.likes)}</span>

        {/* Comment Button */}
        <button
          onClick={handleComment}
          className="w-12 h-12 rounded-full bg-black/60 text-white hover:bg-primary-500/80 flex items-center justify-center transition-all"
        >
          <span className="material-icons">comment</span>
        </button>
        <span className="text-white text-xs drop-shadow-lg -mt-1">{formatCount(video.stats.comments)}</span>

        {/* Share Button */}
        <button
          onClick={() => onShare(video.id)}
          className="w-12 h-12 rounded-full bg-black/60 text-white hover:bg-primary-500/80 flex items-center justify-center transition-all"
        >
          <span className="material-icons">share</span>
        </button>
        <span className="text-white text-xs drop-shadow-lg -mt-1">{formatCount(video.stats.shares)}</span>

        {/* Message Button */}
        <button
          onClick={handleWhatsapp}
          className="w-12 h-12 rounded-full bg-black/60 text-white hover:bg-primary-500/80 flex items-center justify-center transition-all"
        >
          <Image
            src="/icons/whatsapp.png"
            alt="WhatsApp"
            width={24}
            height={24}
            className="object-contain"
          />
        </button>

        {/* Sound Button */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isMuted
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-black/60 text-white hover:bg-primary-500/80'
            }`}
        >
          <span className="material-icons">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default VideoPlayer

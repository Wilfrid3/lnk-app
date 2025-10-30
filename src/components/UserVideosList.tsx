'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProfileVideoCard from '@/components/ProfileVideoCard'
import VideoGridView from '@/components/VideoGridView'
import { useUserContentStore } from '@/store/useUserContentStore'

interface UserVideosListProps {
  userId: string
  currentUserId?: string
  showActions?: boolean // Whether to show edit/delete actions
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string) => void
}

export default function UserVideosList({ 
  userId, 
  currentUserId, 
  showActions = false,
  onEdit,
  onDelete,
  onToggleStatus
}: UserVideosListProps) {
  const router = useRouter()
  const [videoViewMode, setVideoViewMode] = useState<'list' | 'grid'>('grid')
  
  const {
    videos,
    videosLoading,
    videosError,
    videosHasMore,
    loadUserVideos,
    loadMoreVideos,
    deleteVideo,
    toggleVideoStatus
  } = useUserContentStore()

  const observer = useRef<IntersectionObserver | null>(null)

  // Load initial data
  useEffect(() => {
    if (userId && videos.length === 0) {
      loadUserVideos(userId, true)
    }
  }, [userId, loadUserVideos, videos.length])

  // Infinite scroll setup
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (videosLoading || !node) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && videosHasMore && userId) {
        loadMoreVideos(userId)
      }
    })
    
    observer.current.observe(node)
  }, [videosLoading, videosHasMore, loadMoreVideos, userId])

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      return
    }

    try {
      await deleteVideo(id)
      if (onDelete) onDelete(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  // Handle status toggle
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleVideoStatus(id)
      if (onToggleStatus) onToggleStatus(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  // Error state
  if (videosError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-600 dark:text-red-400">{videosError}</p>
        <button
          onClick={() => loadUserVideos(userId, true)}
          className="mt-2 text-red-600 dark:text-red-400 hover:underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  // Empty state
  if (videos.length === 0 && !videosLoading && !videosError) {
    const isOwnProfile = currentUserId === userId
    
    return (
      <div className="text-center py-12">
        <span className="material-icons text-6xl text-gray-400 mb-4 block">videocam</span>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {isOwnProfile ? 'Aucune vidéo' : 'Aucune vidéo publique'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isOwnProfile 
            ? "Vous n'avez pas encore publié de vidéos" 
            : "Cet utilisateur n'a pas encore publié de vidéos publiques"
          }
        </p>
        {isOwnProfile && (
          <button
            onClick={() => router.push('/publish/video')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Publier une vidéo
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {videos.length > 0 && (
        <>
          {/* Video View Mode Toggle */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setVideoViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center ${
                  videoViewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title="Vue grille"
              >
                <span className="material-icons text-sm leading-none">grid_view</span>
              </button>
              <button
                onClick={() => setVideoViewMode('list')}
                className={`px-3 py-2 rounded-md transition-colors flex items-center justify-center ${
                  videoViewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title="Vue liste"
              >
                <span className="material-icons text-sm leading-none">list</span>
              </button>
            </div>
          </div>

          {videoViewMode === 'grid' ? (
            <VideoGridView
              videos={videos}
              userId={userId}
              isLoading={videosLoading}
              hasMore={videosHasMore}
              onLoadMore={() => loadMoreVideos(userId)}
              onRefresh={() => loadUserVideos(userId, true)}
            />
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  ref={index === videos.length - 1 ? lastElementRef : null}
                >
                  <ProfileVideoCard
                    {...video}
                    onEdit={showActions && onEdit ? () => onEdit(video.id) : undefined}
                    onDelete={showActions ? () => handleDelete(video.id) : undefined}
                    onToggleStatus={showActions ? () => handleToggleStatus(video.id) : undefined}
                  />
                </div>
              ))}

              {videosLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Chargement...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

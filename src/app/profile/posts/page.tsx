'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import ProfilePostCard from '@/components/ProfilePostCard'
import ProfileVideoCard from '@/components/ProfileVideoCard'
import VideoGridView from '@/components/VideoGridView'
import { useAuth } from '@/contexts/AuthContext'
import { useUserContentStore } from '@/store/useUserContentStore'

export default function UserPostsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [videoViewMode, setVideoViewMode] = useState<'list' | 'grid'>('list')
  const {
    posts,
    videos,
    postsLoading,
    videosLoading,
    postsError,
    videosError,
    postsHasMore,
    videosHasMore,
    activeTab,
    setActiveTab,
    loadUserPosts,
    loadUserVideos,
    loadMorePosts,
    loadMoreVideos,
    deletePost,
    deleteVideo,
    togglePostStatus,
    toggleVideoStatus,
    resetStore
  } = useUserContentStore()

  const observer = useRef<IntersectionObserver | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, router])

  // Load initial data
  useEffect(() => {
    if (user?._id) {
      resetStore()
      loadUserPosts(user._id, true)
      loadUserVideos(user._id, true)
    }
  }, [user?._id, resetStore, loadUserPosts, loadUserVideos])

  // Infinite scroll setup
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (postsLoading || videosLoading || !node) return
    
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (activeTab === 'posts' && postsHasMore && user?._id) {
          loadMorePosts(user._id)
        } else if (activeTab === 'videos' && videosHasMore && user?._id) {
          loadMoreVideos(user._id)
        }
      }
    })
    
    observer.current.observe(node)
  }, [postsLoading, videosLoading, activeTab, postsHasMore, videosHasMore, loadMorePosts, loadMoreVideos, user?._id])

  // Handle delete with confirmation
  const handleDelete = async (id: string, type: 'post' | 'video') => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette ${type === 'post' ? 'publication' : 'vidéo'} ?`)) {
      return
    }

    try {
      if (type === 'post') {
        await deletePost(id)
      } else {
        await deleteVideo(id)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  // Handle status toggle
  const handleToggleStatus = async (id: string, type: 'post' | 'video') => {
    try {
      if (type === 'post') {
        await togglePostStatus(id)
      } else {
        await toggleVideoStatus(id)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  if (!user) {
    return null
  }

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mes contenus
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez vos publications et vidéos
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/publish')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span className="material-icons">add</span>
            <span className="hidden sm:inline">Publier</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-500 border-primary-500'
                : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-icons text-sm">campaign</span>
              Publications ({posts.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'videos'
                ? 'text-primary-500 border-primary-500'
                : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-icons text-sm">videocam</span>
              Vidéos ({videos.length})
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {postsError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{postsError}</p>
                <button
                  onClick={() => user?._id && loadUserPosts(user._id, true)}
                  className="mt-2 text-red-600 dark:text-red-400 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {posts.length === 0 && !postsLoading && !postsError && (
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4 block">campaign</span>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Aucune publication
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Vous n&apos;avez pas encore publié d&apos;annonces
                </p>
                <button
                  onClick={() => router.push('/publish')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Créer une publication
                </button>
              </div>
            )}

            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastElementRef : null}
              >
                <ProfilePostCard
                  {...post}
                  onEdit={() => router.push(`/publish/edit/${post.id}`)}
                  onDelete={() => handleDelete(post.id, 'post')}
                  onToggleStatus={() => handleToggleStatus(post.id, 'post')}
                />
              </div>
            ))}

            {postsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Chargement...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            {videosError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{videosError}</p>
                <button
                  onClick={() => user?._id && loadUserVideos(user._id, true)}
                  className="mt-2 text-red-600 dark:text-red-400 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {videos.length === 0 && !videosLoading && !videosError && (
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4 block">videocam</span>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Aucune vidéo
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Vous n&apos;avez pas encore publié de vidéos
                </p>
                <button
                  onClick={() => router.push('/publish/video')}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Publier une vidéo
                </button>
              </div>
            )}

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
                    userId={user?._id || ''}
                    isLoading={videosLoading}
                    hasMore={videosHasMore}
                    onLoadMore={() => user?._id && loadMoreVideos(user._id)}
                    onRefresh={() => user?._id && loadUserVideos(user._id, true)}
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
                          onEdit={() => router.push(`/videos/edit/${video.id}`)}
                          onDelete={() => handleDelete(video.id, 'video')}
                          onToggleStatus={() => handleToggleStatus(video.id, 'video')}
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
        )}
      </div>
    </DefaultLayout>
  )
}

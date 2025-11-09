'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import apiClient from '@/lib/axios'
import PostDetailLayout from '@/components/layouts/PostDetailLayout'
import BottomActionBar from '@/components/BottomActionBar'
import { getFullImageUrl } from '@/utils/imageUtils'
import { offeringOptions } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useChatHandler } from '@/utils/chatUtils'

interface PostDetailProps {
  postId: string
}

interface PostDetail {
  id: string
  title: string
  description: string
  user: {
    id: string
    name: string
    avatar: string | null
    isVerified: boolean
    email?: string // Added email field
  }
  mainPhoto: {
    url: string
  } | null
  additionalPhotos: {
    url: string
  }[]
  videos: {
    url: string
    originalName: string
    mimeType: string
    size: number
    duration: number
    id: string
  }[]
  isVip: boolean
  clientType: string
  appearance: string
  city: string
  neighborhood: string | null
  offerings: string[]
  travelOption: string
  services: {
    service: string
    price: number
  }[]
  createdAt: string
  phoneNumber: string
  whatsappNumber: string | null
  views: number
  likes?: string[]
  likesCount?: number
}

const PostDetailView: React.FC<PostDetailProps> = ({ postId }) => {
  const router = useRouter()
  const { user } = useAuth()
  
  // Chat handler
  const { handleChat: handleChatNavigation } = useChatHandler(router, user)
  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('photos')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [allMedia, setAllMedia] = useState<{url: string, type: 'photo' | 'video', videoData?: {
    originalName: string
    mimeType: string
    size: number
    duration: number
    id: string
  }}[]>([])
  const tabsRef = useRef<HTMLDivElement>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)
  // Like feature state
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState<number>(0)
  const [likeLoading, setLikeLoading] = useState(false)
  // Image preview modal state
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageIndex, setPreviewImageIndex] = useState(0)

  // Calculate age from appearance string, if available
  const extractAge = (appearance?: string): number => {
    if (!appearance) return 0
    const ageMatch = appearance.match(/\b(\d+)\s*(an|ans)\b/i)
    return ageMatch ? parseInt(ageMatch[1]) : 0
  }

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`/posts/${postId}`)
        const post = response.data as PostDetail;
        setPost(post)
        setLikeCount(post.likesCount || 0)
      } catch (err) {
        console.error('Error fetching post details:', err)
        setError('Impossible de charger les détails de l\'annonce')
      } finally {
        setLoading(false)
      }
    }

    // Fetch like status for current user
    const fetchLikeStatus = async () => {
      try {
        const res = await apiClient.get<{ isLiked: boolean }>(`/posts/${postId}/like-status`)
        setIsLiked(!!res.data.isLiked)
      } catch {
        setIsLiked(false)
      }
    }

    if (postId) {
      fetchPostDetails()
      // Only fetch like status if user is authenticated
      if (user) {
        fetchLikeStatus()
      }
    }
  }, [postId, user])

  useEffect(() => {
    // Combine main photo, additional photos, and videos into one array for navigation
    if (post?.mainPhoto || (post?.additionalPhotos && post?.additionalPhotos.length > 0) || (post?.videos && post?.videos.length > 0)) {
      const media: {url: string, type: 'photo' | 'video', videoData?: {
        originalName: string
        mimeType: string
        size: number
        duration: number
        id: string
      }}[] = []
      
      if (post?.mainPhoto) {
        media.push({url: post.mainPhoto.url, type: 'photo'})
      }
      if (post?.additionalPhotos) {
        post.additionalPhotos.forEach(photo => {
          media.push({url: photo.url, type: 'photo'})
        })
      }
      if (post?.videos) {
        post.videos.forEach(video => {
          media.push({url: video.url, type: 'video', videoData: video})
        })
      }
      
      setAllMedia(media)
    }
  }, [post])

  useEffect(() => {
    checkScrollIndicators()
    
    // Add scroll event listener
    const tabsContainer = tabsRef.current
    if (tabsContainer) {
      tabsContainer.addEventListener('scroll', checkScrollIndicators)
      window.addEventListener('resize', checkScrollIndicators)
    }
    
    return () => {
      if (tabsContainer) {
        tabsContainer.removeEventListener('scroll', checkScrollIndicators)
        window.removeEventListener('resize', checkScrollIndicators)
      }
    }
  }, [activeTab])

  // Function to check if scrolling indicators should be shown
  const checkScrollIndicators = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 10) // Small buffer
    }
  }

  // Scroll the tabs horizontally
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 100 // Adjust based on your tab width
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleShare = () => {
    if (navigator.share && typeof navigator.share === 'function') {
      navigator.share({
        title: post?.title || 'Annonce sur yamohub',
        text: post?.description?.substring(0, 100) || 'Découvrez cette annonce sur yamohub',
        url: window.location.href
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Lien copié dans le presse-papier'))
        .catch(() => alert('Impossible de copier le lien'))
    }
  }

  const handleWhatsapp = () => {
    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (post?.whatsappNumber) {
      let whatsappNumber = post.whatsappNumber.startsWith('+') 
        ? post.whatsappNumber.substring(1) 
        : post.whatsappNumber
      const message = `Salut 😊. Je viens de voir votre annonce sur https://yamohub.com et je suis intéressé par vos services`
      whatsappNumber = whatsappNumber.replace(/\s+/g, '') // Remove spaces if any
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else if (post?.phoneNumber) {
      // Use phone number as fallback
      let phoneNumber = post.phoneNumber.startsWith('+')
        ? post.phoneNumber.substring(1)
        : post.phoneNumber
      const message = `Salut 😊. Je viens de voir votre annonce sur www.yamohub.com et je suis intéressé par vos services`
      phoneNumber = phoneNumber.replace(/\s+/g, '') // Remove spaces if any
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  const handleCall = () => {
    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (post?.phoneNumber) {
      window.location.href = `tel:${post.phoneNumber}`
    }
  }

  const handleChat = () => {
    if (!post?.user.id) {
      return
    }
    handleChatNavigation(post.user.id)
  }

  const handleEmail = () => {
    // Check if user is authenticated
    if (!user) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (post?.user?.email) {
      // If the user has an email, open the mail app with their email address
      const subject = encodeURIComponent(`Message à propos de votre annonce sur yamohub`);
      const body = encodeURIComponent(`Bonjour ${post.user.name},\n\nJ'ai vu votre annonce sur yamohub et je suis intéressé(e).\n\nCordialement.`);
      window.location.href = `mailto:${post.user.email}?subject=${subject}&body=${body}`;
    } else {
      // If no email is available, redirect to the contact form
      router.push(`/contact/${post?.id}`);
    }
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (allMedia.length === 0) return
    
    if (direction === 'next') {
      setCurrentPhotoIndex((currentPhotoIndex + 1) % allMedia.length)
    } else {
      setCurrentPhotoIndex((currentPhotoIndex - 1 + allMedia.length) % allMedia.length)
    }
  }

  // Image preview handlers
  const openImagePreview = (index: number) => {
    // Only open preview for photos, not videos
    if (allMedia[index]?.type === 'photo') {
      setPreviewImageIndex(index)
      setShowImagePreview(true)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }
  }

  const closeImagePreview = () => {
    setShowImagePreview(false)
    // Re-enable body scrolling
    document.body.style.overflow = 'unset'
  }

  const navigatePreviewImage = useCallback((direction: 'prev' | 'next') => {
    // Filter only photos for preview navigation
    const photoIndices = allMedia
      .map((media, index) => media.type === 'photo' ? index : -1)
      .filter(index => index !== -1)
    
    const currentPhotoPosition = photoIndices.indexOf(previewImageIndex)
    
    if (direction === 'next') {
      const nextPosition = (currentPhotoPosition + 1) % photoIndices.length
      setPreviewImageIndex(photoIndices[nextPosition])
    } else {
      const prevPosition = (currentPhotoPosition - 1 + photoIndices.length) % photoIndices.length
      setPreviewImageIndex(photoIndices[prevPosition])
    }
  }, [allMedia, previewImageIndex])

  useEffect(() => {
    // Check on mount and whenever tab changes
    checkScrollIndicators();
    
    // Add resize observer to check indicators when element size changes
    if (tabsRef.current) {
      const currentTabsRef = tabsRef.current; // Store ref in a variable for cleanup
      const resizeObserver = new ResizeObserver(() => {
        checkScrollIndicators();
      });
      resizeObserver.observe(currentTabsRef);
      
      // Clean up
      return () => {
        resizeObserver.unobserve(currentTabsRef);
      };
    }
  }, [activeTab])

  // Handle keyboard events for image preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showImagePreview) {
        switch (event.key) {
          case 'Escape':
            closeImagePreview()
            break
          case 'ArrowLeft':
            navigatePreviewImage('prev')
            break
          case 'ArrowRight':
            navigatePreviewImage('next')
            break
        }
      }
    }

    if (showImagePreview) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showImagePreview, navigatePreviewImage])

  // Like/unlike handlers
  const handleLike = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/signin')
      return
    }
    
    if (likeLoading) return
    setLikeLoading(true)
    try {
      if (isLiked) {
        await apiClient.delete(`/posts/${postId}/like`)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await apiClient.post(`/posts/${postId}/like`)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (e) {
      // Optionally show error
      console.error('Error toggling like:', e)
    } finally {
      setLikeLoading(false)
    }
  }

  if (loading) {
    return (
      <PostDetailLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </PostDetailLayout>
    )
  }

  if (error || !post) {
    return (
      <PostDetailLayout>
        <div className="flex flex-col justify-center items-center h-[50vh]">
          <div className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            {error || "Annonce non trouvée"}
          </div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-primary-500 hover:underline"
          >
            <span className="material-icons mr-1">arrow_back_ios</span>
          </button>
        </div>
      </PostDetailLayout>
    )
  }

  // Format location
  const location = post.neighborhood 
    ? `${post.city}, ${post.neighborhood}` 
    : post.city

  // Get user age
  const age = extractAge(post.appearance) || 25 // Default to 25 if not found

  // Convert timestamp to relative time
  const getRelativeTime = (timestamp: string) => {
    const postDate = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} h`
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} j`
    }
  }

  return (
    <PostDetailLayout>
      <div className="pb-32 pt-16">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
              >
                <span className="material-icons text-gray-500 dark:text-gray-400">
                  arrow_back_ios
                </span>
              </button>
              
              
              <div className="ml-auto">
                <button 
                  onClick={() => router.push(`/report/${post.id}`)}
                  className="text-red-500 hover:text-red-600"
                >
                  {"Signaler l'annonce"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* User Info Section */}
        <section className="px-4 py-4 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center">
              <Link href={`/users/${post.user.id}`} className="flex items-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={post.user.avatar ? (getFullImageUrl(post.user.avatar) ?? `/images/avatars/default_${post.clientType}.png`): `/images/avatars/default_${post.clientType}.png`}
                      alt={post.user.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  {post.isVip && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                      <span className="material-icons text-xs text-white">
                        star
                      </span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <Link href={`/users/${post.user.id}`} className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {post.user.name}
                    </h2>
                  </Link>
                  {post.user.isVerified && (
                    <span className="material-icons text-blue-500 ml-1">
                      verified
                    </span>
                  )}
                  <span className="text-lg ml-2">
                    {age} ans
                  </span>
                  <span className="ml-auto text-gray-500 dark:text-gray-400">
                    {getRelativeTime(post.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center mt-1 text-gray-600 dark:text-gray-300">
                  <span className="material-icons text-gray-500 mr-1 text-sm">
                    location_on
                  </span>
                  <span className="text-sm">
                    {location}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Post description - just a short excerpt */}
            <div className="mt-4 text-gray-700 dark:text-gray-200">
              <p className="line-clamp-2">
                {post.title || post.description}
              </p>
            </div>
          </div>
        </section>
        
        {/* Tab Navigation - Updated with horizontal scroll indicators */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 relative">
          <div className="max-w-4xl mx-auto relative">
            {/* Left Scroll Indicator - Only shows when scrolled */}
            {showLeftScroll && (
              <button 
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md"
                aria-label="Scroll left"
              >
                <span className="material-icons text-xs text-gray-600 dark:text-gray-300">chevron_left</span>
              </button>
            )}
            
            <div 
              ref={tabsRef} 
              className="flex overflow-x-auto hide-scrollbar py-1" 
              onScroll={checkScrollIndicators}
            >
              <button 
                className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 ${
                  activeTab === 'photos' 
                    ? 'text-primary-500 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 border-transparent'
                }`}
                onClick={() => setActiveTab('photos')}
              >
                {post?.videos && post.videos.length > 0 ? 'Mes Photos & Vidéos' : 'Mes Photos'}
              </button>
              <button 
                className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 ${
                  activeTab === 'description' 
                    ? 'text-primary-500 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 border-transparent'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 ${
                  activeTab === 'tarifs' 
                    ? 'text-primary-500 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 border-transparent'
                }`}
                onClick={() => setActiveTab('tarifs')}
              >
                Mes Tarifs
              </button>
              <button 
                className={`py-3 px-4 font-medium whitespace-nowrap border-b-2 ${
                  activeTab === 'delires' 
                    ? 'text-primary-500 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 border-transparent'
                }`}
                onClick={() => setActiveTab('delires')}
              >
                Mes délires
              </button>
            </div>
            
            {/* Right Scroll Indicator - Always visible initially */}
            {showRightScroll && (
              <button 
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md"
                aria-label="Scroll right"
              >
                <span className="material-icons text-xs text-gray-600 dark:text-gray-300">chevron_right</span>
              </button>
            )}
          </div>
        </nav>
        
        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div>
                {/* Main media carousel with navigation arrows */}
                {allMedia.length > 0 ? (
                  <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-4">
                    {allMedia[currentPhotoIndex].type === 'photo' ? (
                      <div 
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => openImagePreview(currentPhotoIndex)}
                      >
                        <Image
                          src={getFullImageUrl(allMedia[currentPhotoIndex].url) ?? ''}
                          alt={post.title || 'Photo'}
                          fill
                          className="object-cover"
                        />
                        {/* Zoom indicator */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm flex items-center">
                          <span className="material-icons text-sm mr-1">zoom_in</span>
                          <span>Toucher pour agrandir</span>
                        </div>
                      </div>
                    ) : (
                      <video
                        key={allMedia[currentPhotoIndex].url} // Force re-render when video changes
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        poster={getFullImageUrl(allMedia[currentPhotoIndex].url + '?thumbnail=true')}
                      >
                        <source src={getFullImageUrl(allMedia[currentPhotoIndex].url) ?? ''} type={allMedia[currentPhotoIndex].videoData?.mimeType || 'video/mp4'} />
                        <track kind="captions" srcLang="fr" label="Français" />
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    )}
                    
                    {/* Left arrow navigation */}
                    {allMedia.length > 1 && (
                      <button 
                        onClick={() => navigatePhoto('prev')}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10"
                        aria-label="Previous media"
                      >
                        <span className="material-icons">chevron_left</span>
                      </button>
                    )}
                    
                    {/* Right arrow navigation */}
                    {allMedia.length > 1 && (
                      <button 
                        onClick={() => navigatePhoto('next')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center z-10"
                        aria-label="Next media"
                      >
                        <span className="material-icons">chevron_right</span>
                      </button>
                    )}
                    
                    {/* Media indicator dots */}
                    {allMedia.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {allMedia.map((_, index) => (
                          <button 
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentPhotoIndex 
                                ? 'bg-primary-500' 
                                : 'bg-primary-100 hover:bg-white/70'
                            }`}
                            aria-label={`Go to media ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Media gallery - horizontally scrollable */}
                {((post?.additionalPhotos && post.additionalPhotos.length > 0) || (post?.videos && post.videos.length > 0)) && (
                  <div className="overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex gap-2" style={{ minWidth: 'min-content' }}>
                      {/* Show main photo in gallery */}
                      {post?.mainPhoto && (
                        <div 
                          className="relative min-w-[100px] w-[100px] aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                          onClick={() => {
                            setCurrentPhotoIndex(0)
                            openImagePreview(0)
                          }}
                        >
                          <Image
                            src={getFullImageUrl(post.mainPhoto.url) ?? ''}
                            alt="Main photo"
                            fill
                            className="object-cover"
                          />
                          {currentPhotoIndex === 0 && (
                            <div className="absolute inset-0 border-2 border-primary-500 rounded-lg"></div>
                          )}
                        </div>
                      )}
                      
                      {/* Additional photos */}
                      {post.additionalPhotos?.map((photo, index) => {
                        const galleryIndex = post.mainPhoto ? index + 1 : index;
                        return (
                          <div 
                            key={`photo-${index}`} 
                            className="relative min-w-[100px] w-[100px] aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                            onClick={() => {
                              setCurrentPhotoIndex(galleryIndex)
                              openImagePreview(galleryIndex)
                            }}
                          >
                            <Image
                              src={getFullImageUrl(photo.url) ?? ''}
                              alt={`Photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {currentPhotoIndex === galleryIndex && (
                              <div className="absolute inset-0 border-2 border-primary-500 rounded-lg"></div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Videos */}
                      {post.videos?.map((video, index) => {
                        const galleryIndex = (post.mainPhoto ? 1 : 0) + (post.additionalPhotos?.length || 0) + index;
                        return (
                          <div 
                            key={`video-${index}`} 
                            className="relative min-w-[100px] w-[100px] aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                            onClick={() => setCurrentPhotoIndex(galleryIndex)}
                          >
                            <video
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            >
                              <source src={getFullImageUrl(video.url) ?? ''} type={video.mimeType} />
                            </video>
                            {/* Video play icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="material-icons text-white text-2xl">play_arrow</span>
                            </div>
                            {/* Video duration badge */}
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </div>
                            {currentPhotoIndex === galleryIndex && (
                              <div className="absolute inset-0 border-2 border-primary-500 rounded-lg"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {allMedia.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    Aucune photo ou vidéo disponible
                  </div>
                )}
              </div>
            )}
            
            {/* Description Tab - now showing the full description */}
            {activeTab === 'description' && (
              <div className="py-2">
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {post.description || "Aucune description disponible"}
                </p>
              </div>
            )}
            
            {/* Services/Tarifs Tab */}
            {activeTab === 'tarifs' && (
              <div className="space-y-2 py-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-lg">Services</div>
                  <div className="font-medium text-lg">Prix</div>
                </div>
                
                {post.services && post.services.length > 0 ? (
                  post.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="text-gray-800 dark:text-gray-200">
                        {service.service}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {service.price.toLocaleString()} FCFA
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                    Aucun service disponible
                  </div>
                )}
              </div>
            )}
            
            {/* Offerings/Délires Tab */}
            {activeTab === 'delires' && (
              <div className="py-2 grid grid-cols-2 gap-4">
                {post.offerings && post.offerings.length > 0 ? (
                  post.offerings.map((offering, index) => {
                    const offeringOption = offeringOptions.find(opt => opt.id === offering);
                    return (
                      <div key={index} className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <span className="material-icons text-gray-600 dark:text-gray-300">
                            {offeringOption?.icon || 'check_circle'}
                          </span>
                        </div>
                        <div className="text-gray-800 dark:text-gray-200">
                          {offeringOption?.label || offering}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-6 col-span-2">
                    Aucun délire disponible
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Bar - Updated to match design */}
        <div className="bg-primary-100 dark:bg-primary-500 py-3 px-4 fixed bottom-17 left-0 right-0 border-t border-pink-100 dark:border-pink-900/30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center transition-colors dark:text-white ${isLiked ? 'text-pink-500' : 'text-primary-500'} ${likeLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-label={isLiked ? 'Retirer le like' : 'Liker'}
              type="button"
            >
              <span className="material-icons mr-1">
                {isLiked ? 'favorite' : 'favorite_border'}
              </span>
              <span className="font-semibold">{likeCount}</span>
            </button>
            
            <div className="flex items-center text-gray-600 dark:text-white">
              <span className="material-icons mr-1">visibility</span>
              <span className="font-semibold">{post?.views?.toLocaleString() || '0'}{" Vues"}</span>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center text-gray-600 dark:text-white"
            >
              <span className="material-icons mr-1">share</span>
              <span>Partager</span>
            </button>
          </div>
        </div>
        
        {/* Bottom Action Bar */}
        <BottomActionBar
          onCall={handleCall}
          onWhatsapp={handleWhatsapp}
          onChat={handleChat}
          onEmail={handleEmail}
          disabled={{
            call: !post.phoneNumber,
            whatsapp: !post.whatsappNumber && !post.phoneNumber,
            chat: false,
            email: !post.user?.email
          }}
        />

        {/* Image Preview Modal */}
        {showImagePreview && allMedia[previewImageIndex]?.type === 'photo' && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center z-10"
              aria-label="Fermer"
            >
              <span className="material-icons">close</span>
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-10">
              {allMedia.filter(m => m.type === 'photo').findIndex((_) => 
                allMedia.findIndex(media => media.url === allMedia[previewImageIndex].url) === 
                allMedia.findIndex(media => media.type === 'photo' && media.url === _.url)
              ) + 1} / {allMedia.filter(m => m.type === 'photo').length}
            </div>

            {/* Main image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full">
                <Image
                  src={getFullImageUrl(allMedia[previewImageIndex].url) ?? ''}
                  alt={post.title || 'Photo'}
                  width={800}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  style={{ maxHeight: 'calc(100vh - 2rem)' }}
                />
              </div>
            </div>

            {/* Navigation arrows - only show if there are multiple photos */}
            {allMedia.filter(m => m.type === 'photo').length > 1 && (
              <>
                <button
                  onClick={() => navigatePreviewImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full w-12 h-12 flex items-center justify-center z-10"
                  aria-label="Photo précédente"
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <button
                  onClick={() => navigatePreviewImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full w-12 h-12 flex items-center justify-center z-10"
                  aria-label="Photo suivante"
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </>
            )}

            {/* Tap to close (mobile) */}
            <div 
              className="absolute inset-0 z-0"
              onClick={closeImagePreview}
              aria-label="Fermer en touchant"
            />
          </div>
        )}
      </div>
    </PostDetailLayout>
  )
}


export default PostDetailView

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFullImageUrl, getFullVideoUrl } from '@/utils/imageUtils';

interface ProfileVideoCardProps {
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
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

const ProfileVideoCard: React.FC<ProfileVideoCardProps> = ({
  id,
  title,
  description,
  videoUrl,
  thumbnailUrl,
  duration,
  views,
  likes,
  isActive,
  privacy,
  createdAt,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video preview effects - similar to VideoGridItem
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
    };

    const handleLoadedData = () => {
      // Set the video to loop only the first 5 seconds
      videoElement.currentTime = 0;
    };

    const handleTimeUpdate = () => {
      if (videoElement.currentTime >= 5) {
        videoElement.currentTime = 0;
      }
    };

    const handleError = () => {
      setIsVideoLoaded(true); // Show the poster/thumbnail instead
    };

    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !isVideoLoaded) return;

    if (isHovered) {
      videoElement.play().catch(console.error);
    } else {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [isHovered, isVideoLoaded]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Il y a quelques secondes';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-visible border border-gray-100 dark:border-gray-700 transition-all duration-200 relative ring-1 ring-pink-200 hover:ring-pink-300 ${!isActive ? 'opacity-60' : ''}`}>
      
      {/* Status Badge */}
      {!isActive && (
        <div className="absolute top-2 left-2 z-20">
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Désactivée
          </span>
        </div>
      )}

      {/* Privacy Badge */}
      {privacy === 'private' && (
        <div className="absolute top-2 left-2 z-20">
          <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <span className="material-icons text-xs">lock</span>
            Privée
          </span>
        </div>
      )}

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-30">
        <button
          onClick={() => setShowActions(!showActions)}
          className="bg-white dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <span className="material-icons text-gray-600 dark:text-gray-300 text-lg">more_vert</span>
        </button>
        
        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-40">
            <Link
              href={`/videos/${id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <span className="material-icons text-sm mr-2">play_circle</span>
              Voir la vidéo
            </Link>
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <span className="material-icons text-sm mr-2">edit</span>
                Modifier
              </button>
            )}
            {onToggleStatus && (
              <button
                onClick={onToggleStatus}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <span className="material-icons text-sm mr-2">
                  {isActive ? 'visibility_off' : 'visibility'}
                </span>
                {isActive ? 'Désactiver' : 'Activer'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <span className="material-icons text-sm mr-2">delete</span>
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-row min-h-[140px] relative">
        
        {/* Video Preview */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-28 sm:w-32 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700">
            {/* Thumbnail/Poster Image */}
            {thumbnailUrl ? (
              <Image
                src={getFullImageUrl(thumbnailUrl) || ''}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 112px, 128px"
                onError={({ currentTarget }) => {
                  currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-icons text-gray-400 text-2xl">videocam</span>
              </div>
            )}
            
            {/* Video overlay */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Video preview */}
              {videoUrl && (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={thumbnailUrl ? getFullImageUrl(thumbnailUrl) || '' : ''}
                >
                  <source src={getFullVideoUrl(videoUrl)} type="video/mp4" />
                </video>
              )}
              
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
              
              {/* Play button - hide on hover when video is playing */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered && isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-white/25 backdrop-blur-lg rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border border-white/40 hover:bg-white/35 hover:scale-110 transition-all duration-300 group">
                  <span className="material-icons text-white text-2xl drop-shadow-lg group-hover:animate-pulse">play_arrow</span>
                </div>
              </div>
              
              {/* Loading indicator for video */}
              {!isVideoLoaded && isHovered && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {/* Duration Badge */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pl-32 sm:pl-36">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="material-icons text-xs">videocam</span>
                  Vidéo
                </span>
                <span>•</span>
                <span className="capitalize">{privacy}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-xs mb-3 line-clamp-2">
            {description}
          </p>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="material-icons text-xs">visibility</span>
                <span>{views}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-icons text-xs">favorite</span>
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1 text-pink-500">
                <span className="material-icons text-xs">videocam</span>
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
            </div>
            
            <span className="text-xs">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Click overlay to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default ProfileVideoCard;

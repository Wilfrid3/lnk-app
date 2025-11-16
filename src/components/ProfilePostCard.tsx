import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProfilePostCardProps {
  id: string;
  title: string;
  description: string;
  city: string;
  clientType: string;
  price: number;
  views: number;
  likesCount: number;
  isActive: boolean;
  isFeatured: boolean;
  mainPhoto: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  additionalPhotos: {
    id: string;
    url: string;
    originalName: string;
  }[];
  videos: {
    id: string;
    url: string;
    originalName: string;
    duration?: number;
  }[];
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

const ProfilePostCard: React.FC<ProfilePostCardProps> = ({
  id,
  title,
  description,
  city,
  clientType,
  price,
  views,
  likesCount,
  isActive,
  isFeatured,
  mainPhoto,
  additionalPhotos,
  videos,
  createdAt,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const hasVideos = videos && videos.length > 0;
  const firstVideoUrl = hasVideos ? videos[0].url : undefined;
  const videoCount = videos?.length || 0;
  const totalPhotos = additionalPhotos?.length || 0;
  const featureImage = mainPhoto?.url;

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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-visible border border-gray-100 dark:border-gray-700 transition-all duration-200 relative ${hasVideos ? 'ring-1 ring-pink-200 hover:ring-pink-300' : ''} ${!isActive ? 'opacity-60' : ''}`}>
      
      {/* Status Badge */}
      {!isActive && (
        <div className="absolute top-2 left-2 z-20">
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Désactivée
          </span>
        </div>
      )}

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow">
            <span className="material-icons text-base text-white">star</span>
          </div>
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
          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-40">
            <Link
              href={`/posts/${id}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <span className="material-icons text-sm mr-2">visibility</span>
              Voir l&apos;annonce
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
        
        {/* Feature Image or Video Preview */}
        {(featureImage || (hasVideos && firstVideoUrl)) && (
          <div className="absolute top-0 left-0 bottom-0 w-28 sm:w-32 overflow-hidden">
            <div className="relative w-full h-full">
              {featureImage ? (
                <>
                  <Image
                    src={featureImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 112px, 128px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = '/images/featured/default_featured.png';
                    }}
                  />
                  
                  {/* Video Overlay for posts with feature image */}
                  {hasVideos && (
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Video preview background */}
                      {firstVideoUrl ? (
                        <video
                          className="absolute inset-0 w-full h-full object-cover opacity-70"
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          poster={firstVideoUrl + '#t=0.1'}
                        >
                          <source src={firstVideoUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-500/30 to-pink-600/40"></div>
                      )}
                      
                      {/* Enhanced gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                      
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/25 backdrop-blur-lg rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border border-white/40 hover:bg-white/35 hover:scale-110 transition-all duration-300 group">
                          <span className="material-icons text-white text-2xl drop-shadow-lg group-hover:animate-pulse">play_arrow</span>
                        </div>
                      </div>
                      
                      {/* Animation overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50"></div>
                    </div>
                  )}
                </>
              ) : (
                /* Video-only preview */
                hasVideos && firstVideoUrl && (
                  <div className="absolute inset-0 overflow-hidden">
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                      poster={firstVideoUrl + '#t=0.1'}
                    >
                      <source src={firstVideoUrl} type="video/mp4" />
                    </video>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/25 backdrop-blur-lg rounded-full w-12 h-12 flex items-center justify-center shadow-2xl border border-white/40 hover:bg-white/35 hover:scale-110 transition-all duration-300 group">
                        <span className="material-icons text-white text-2xl drop-shadow-lg group-hover:animate-pulse">play_arrow</span>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50"></div>
                  </div>
                )
              )}
              
              {/* Media Count Badges */}
              <div className="absolute bottom-1 right-1 flex flex-col gap-1">
                {hasVideos && videoCount > 0 && (
                  <div className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md">
                    {videoCount} vidéo{videoCount > 1 ? 's' : ''}
                  </div>
                )}
                {totalPhotos > 0 && (
                  <div className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md">
                    {totalPhotos + (mainPhoto ? 1 : 0)} photo{totalPhotos > 0 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`p-4 ${(featureImage || (hasVideos && firstVideoUrl)) ? 'pl-32 sm:pl-36' : ''}`}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="material-icons text-xs">location_on</span>
                  {city}
                </span>
                <span>•</span>
                <span>{clientType}</span>
                <span>•</span>
                <span className="font-medium text-primary-600 dark:text-primary-400">
                  {price && (price?.toLocaleString()+"FCFA")} 
                </span>
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
                <span>{likesCount}</span>
              </div>
              {/* Video indicator for posts without media preview */}
              {hasVideos && !featureImage && !firstVideoUrl && (
                <div className="flex items-center gap-1 text-pink-500">
                  <span className="material-icons text-xs animate-pulse">videocam</span>
                  <span className="font-medium">{videoCount} vidéo{videoCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400">
            {formatTimeAgo(createdAt)}
          </div>
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

export default ProfilePostCard;

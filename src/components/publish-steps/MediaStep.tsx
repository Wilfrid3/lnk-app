import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface MediaStepProps {
  mainPhoto: File | null;
  additionalPhotos: File[];
  videos: File[];
  onUpdateMainPhoto: (photo: File | null) => void;
  onUpdateAdditionalPhotos: (photos: File[]) => void;
  onUpdateVideos: (videos: File[]) => void;
}

const MediaStep: React.FC<MediaStepProps> = ({
  mainPhoto,
  additionalPhotos,
  videos,
  onUpdateMainPhoto,
  onUpdateAdditionalPhotos,
  onUpdateVideos
}) => {
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const additionalPhotosInputRef = useRef<HTMLInputElement>(null);
  const videosInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  const handleMainPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdateMainPhoto(e.target.files[0]);
    }
  };

  const handleAdditionalPhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      // Limit to 8 photos total
      const combinedPhotos = [...additionalPhotos, ...newPhotos].slice(0, 8);
      onUpdateAdditionalPhotos(combinedPhotos);
    }
  };

  const handleVideosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newVideos = Array.from(e.target.files);
      // Limit to 3 videos total
      const combinedVideos = [...videos, ...newVideos].slice(0, 3);
      onUpdateVideos(combinedVideos);
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    const updatedPhotos = [...additionalPhotos];
    updatedPhotos.splice(index, 1);
    onUpdateAdditionalPhotos(updatedPhotos);
  };

  const removeVideo = (index: number) => {
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);
    onUpdateVideos(updatedVideos);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <span className="material-icons mr-2 align-middle">photo_camera</span>
          Photos
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <span className="material-icons mr-2 align-middle">videocam</span>
          Vidéos
        </button>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Photo principale de l&apos;annonce</h2>
            <button
              type="button"
              onClick={() => mainPhotoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors w-full"
              style={{ height: '200px' }}
            >
              {mainPhoto ? (
                <div className="relative w-full h-full">
                  <Image
                    src={URL.createObjectURL(mainPhoto)}
                    alt="Main photo preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateMainPhoto(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <span className="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Téléchargez ou<br />Faites glisser la photo
                  </p>
                </>
              )}
              <input 
                type="file"
                ref={mainPhotoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleMainPhotoSelect}
              />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">
              Photos supplémentaires <span className="text-sm text-gray-500">(8 maximum)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Existing photos */}
              {additionalPhotos.map((photo, index) => (
                <div 
                  key={`photo-${photo.name}-${index}`}
                  className="relative aspect-square border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAdditionalPhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              ))}

              {/* Upload button - show only if less than 8 photos */}
              {additionalPhotos.length < 8 && (
                <button
                  type="button"
                  onClick={() => additionalPhotosInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <span className="material-icons text-2xl text-gray-400 mb-1">add_photo_alternate</span>
                  <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
                    Ajouter
                  </p>
                  <input
                    type="file"
                    ref={additionalPhotosInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalPhotosSelect}
                  />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div>
          <h2 className="text-lg font-medium mb-2">
            Vidéos <span className="text-sm text-gray-500">(3 maximum, 50MB chacune)</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Formats acceptés: MP4, MOV, AVI. Durée maximale: 60 secondes.
          </p>
          
          <div className="space-y-3">
            {/* Existing videos */}
            {videos.map((video, index) => (
              <div 
                key={`video-${video.name}-${index}`}
                className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="material-icons text-primary-500">play_arrow</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                        {video.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(video.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
                
                {/* Video preview */}
                <div className="mt-3">
                  <video
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                    preload="metadata"
                    muted
                  >
                    <source src={URL.createObjectURL(video)} type={video.type} />
                    <track kind="captions" srcLang="fr" label="Français" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              </div>
            ))}

            {/* Upload button - show only if less than 3 videos */}
            {videos.length < 3 && (
              <button
                type="button"
                onClick={() => videosInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors w-full"
              >
                <span className="material-icons text-4xl text-gray-400 mb-2">video_camera_back</span>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Téléchargez vos vidéos<br />
                  <span className="text-sm">MP4, MOV, AVI (max 50MB)</span>
                </p>
                <input
                  type="file"
                  ref={videosInputRef}
                  className="hidden"
                  accept="video/mp4,video/mov,video/avi"
                  multiple
                  onChange={handleVideosSelect}
                />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 text-pink-500 text-center">
        <p>Plus vos médias sont de haute qualité et professionnels, plus vous êtes mis(es) en avant !</p>
      </div>
    </div>
  );
};

export default MediaStep;

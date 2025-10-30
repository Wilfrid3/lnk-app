import React, { useRef } from 'react';
import Image from 'next/image';

interface PhotosStepProps {
  mainPhoto: File | null;
  additionalPhotos: File[];
  onUpdateMainPhoto: (photo: File | null) => void;
  onUpdateAdditionalPhotos: (photos: File[]) => void;
}

const PhotosStep: React.FC<PhotosStepProps> = ({
  mainPhoto,
  additionalPhotos,
  onUpdateMainPhoto,
  onUpdateAdditionalPhotos
}) => {
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const additionalPhotosInputRef = useRef<HTMLInputElement>(null);

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

  const removeAdditionalPhoto = (index: number) => {
    const updatedPhotos = [...additionalPhotos];
    updatedPhotos.splice(index, 1);
    onUpdateAdditionalPhotos(updatedPhotos);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Insérez la photo principale de l&apos;annonce</h2>
        <div
          onClick={() => mainPhotoInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
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
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Insérez les autres photos <span className="text-sm text-gray-500">(8 maximum)</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Existing photos */}
          {additionalPhotos.map((photo, index) => (
            <div 
              key={index} 
              className="relative aspect-square border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <Image
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => removeAdditionalPhoto(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>
          ))}

          {/* Upload button - show only if less than 8 photos */}
          {additionalPhotos.length < 8 && (
            <div
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
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-pink-500 text-center">
        <p>Plus vos photos sont de haute qualité et professionnelles, plus vous êtes mis(es) en avant !</p>
      </div>
    </div>
  );
};

export default PhotosStep;

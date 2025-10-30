import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFullImageUrl } from '@/utils/imageUtils';

export type UserCardProps = {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  vip?: boolean;
  verified?: boolean;
};

const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  avatar,
  coverImage,
  vip = false,
  verified = false,
}) => {
  const defaultAvatarSrc = '/images/avatars/default_tous.png';
  const defaultCoverSrc = '/images/featured/vedette_bg.png';
  
  const [avatarSrc, setAvatarSrc] = useState(
    getFullImageUrl(avatar) ?? defaultAvatarSrc
  );
  const [coverSrc, setCoverSrc] = useState(
    getFullImageUrl(coverImage) ?? defaultCoverSrc
  );

  return (
    <Link href={`/users/${id}`}>
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] w-full">
        {/* Cover Image Background */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={coverSrc}
            alt="Cover"
            width={300}
            height={192}
            className="object-cover w-full h-full"
            onError={() => {
              setCoverSrc(defaultCoverSrc)
            }}
          />
          
          {/* Dark gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          {/* Premium Badge - Top Left */}
          {vip && (
            <div className="absolute top-2 left-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-md px-1.5 py-0.5 flex items-center shadow-lg">
                <span className="material-icons text-xs text-white mr-0.5">star</span>
                <span className="text-xs font-bold text-white">Premium</span>
              </div>
            </div>
          )}

          {/* Avatar positioned in the center-top area */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-xl bg-white">
                <Image
                  src={avatarSrc}
                  alt={name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  onError={() => {
                    setAvatarSrc(defaultAvatarSrc)
                  }}
                />
              </div>
              
              {/* Verified badge on avatar */}
              {verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-lg">
                  <span className="material-icons text-xs text-white">verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Content positioned at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-white">
            {/* Name and verified status */}
            <div className="mb-1">
              <h3 className="text-white text-sm font-bold drop-shadow-lg mb-0.5 truncate">
                {name} {verified && <span className="inline-block w-4 h-4 bg-blue-500 rounded-full text-xs leading-4">✓</span>}
              </h3>
              {/* <p className="text-white/90 text-xs drop-shadow">
                (certifié)
              </p> */}
            </div>
            
            {/* Subscribers count */}
            <div className="mb-1">
              <p className="text-white text-xs font-semibold drop-shadow">
                123.5k abonnés
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center items-center space-x-2 text-white text-xs drop-shadow">
              <span>Rang: 7ème</span>
              <span>Vues: 405k</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;

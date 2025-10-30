import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type Post = {
  id: string;
  name: string;
  avatar: string;
  age: number;
  vip?: boolean;
  when: string;
  location: string;
  description: string;
  lookingFor: string;
  verified?: boolean;
  isAd?: boolean;
};

const PostCardOld: React.FC<Post> = ({
  id,
  name,
  avatar,
  age,
  vip = false,
  when,
  location,
  description,
  lookingFor,
  verified = false,
  isAd = false,
}) => {
  return (
    <Link href={`/posts/${id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-pink-200 transition-colors">
        {/* Ad Banner */}
        {isAd && (
          <div className="bg-primary-500 text-white text-xs font-semibold text-center py-0.5">
            SPONSORISÉ
          </div>
        )}

        {/* Card Content */}
        <div className="p-3">
          {/* User Info Header */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={avatar}
                    alt={name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                {vip && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <span className="material-icons text-[10px] text-white">
                      star
                    </span>
                  </div>
                )}
              </div>

              {/* Name, Age, Verification */}
              <div className="ml-2">
                <div className="flex items-center">
                  <span className="font-bold">{name}</span>
                  <span className="ml-1">{age}</span>
                  {verified && (
                    <span className="material-icons text-blue-500 text-sm ml-1">
                      verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {lookingFor}
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="text-gray-500 dark:text-gray-400 text-sm">{when}</div>
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-2">
            {description}
          </p>

          {/* Footer with Location */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="material-icons text-xs mr-1">location_on</span>
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCardOld;

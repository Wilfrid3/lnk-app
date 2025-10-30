// src/components/AdCard.tsx
'use client'
import React from 'react';
import Image from 'next/image';

export type Ad = {
  id: string;
  name: string;
  avatar: string;
  age: number;
  vip: boolean;
  when: string;
  location: string;
  description: string;
  lookingFor?: string;
  verified?: boolean;
};

const AdCard: React.FC<Ad> = ({
  name,
  avatar,
  age,
  vip,
  when,
  location,
  description,
  lookingFor,
  verified
}) => {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 relative">
      <div className="border-l-4 border-pink-500 pl-3 relative">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{name}</h3>
              {verified && (
                <span className="material-icons text-blue-500 ml-1 text-lg">verified</span>
              )}
              <span className="text-gray-500 text-sm ml-2">{when}</span>
            </div>
            <div className="flex items-center mt-0.5">
              <p className="text-sm mr-2">{age} ans</p>
              {vip && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                  VIP
                </span>
              )}
            </div>
          </div>
          
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image 
              src={avatar} 
              alt={name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-start mb-1">
            <span className="material-icons text-gray-500 text-sm mr-1">location_on</span>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
          
          <p className="text-sm mt-1">{description}</p>
          
          {lookingFor && (
            <p className="text-pink-500 text-sm mt-2">{lookingFor}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCard;

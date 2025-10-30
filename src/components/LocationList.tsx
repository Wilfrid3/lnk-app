// src/components/LocationList.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/store/useSearchStore';

export interface Location {
  name: string;
  count: number;
}

interface LocationListProps {
  items: Location[];
}

const LocationList: React.FC<LocationListProps> = ({ items }) => {
  const router = useRouter();
  const { setSelectedCity, setSelectedCountry } = useSearchStore();

  const handleLocationClick = (locationName: string) => {
    // Set the selected city in the store
    setSelectedCity(locationName);
    // Set country to Cameroon (default for these locations)
    setSelectedCountry('+237');
    // Navigate to search page
    router.push('/search');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((location, index) => (
        <button
          key={index}
          onClick={() => handleLocationClick(location.name)}
          className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-400 cursor-pointer text-left w-full"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="material-icons text-primary-500 mr-1">location_on</span>
              <span className="font-medium">{location.name}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{location.count}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default LocationList;

import React from 'react';

interface ServiceCategoryCardProps {
  icon: string;
  name: string;
  count: number;
  isSelected?: boolean;
  onClick: () => void;
}

const ServiceCategoryCard: React.FC<ServiceCategoryCardProps> = ({
  icon,
  name,
  count,
  isSelected = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-primary-500 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <span className="material-icons text-2xl mb-1">{icon}</span>
      <span className="text-sm font-medium">{name}</span>
      <span className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
        {count} résultats
      </span>
    </button>
  );
};

export default ServiceCategoryCard;

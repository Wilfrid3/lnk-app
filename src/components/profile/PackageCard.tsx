import React from 'react';
import { ServicePackage } from '@/types/User';

interface PackageCardProps {
  pkg: ServicePackage;
  onEdit: (pkg: ServicePackage) => void;
  onDelete: (id: string) => void;
  getServiceLabel: (serviceId: string) => string;
  getServiceIcon: (serviceId: string) => string;
  viewOnly?: boolean;
  actionButton?: React.ReactNode;
}

const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onEdit,
  onDelete,
  getServiceLabel,
  getServiceIcon,
  viewOnly = false,
  actionButton
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        <span className="material-icons text-2xl text-gray-400">schedule</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {pkg.title}
            {pkg.duration && (
              <span className="text-sm text-gray-500 ml-2">• {pkg.duration}</span>
            )}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            {pkg.services.map((serviceId) => (
              <span key={serviceId} className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full text-xs flex items-center gap-1">
                <span className="material-icons text-xs">{getServiceIcon(serviceId)}</span>
                {getServiceLabel(serviceId)}
              </span>
            ))}
          </div>
          {pkg.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {pkg.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-bold">
          {pkg.price.toLocaleString()} {pkg.currency}
        </div>
        
        {viewOnly ? (
          actionButton || <div></div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(pkg)}
              className="flex items-center gap-1 px-3 py-1 text-primary-600 hover:text-primary-700 text-sm"
            >
              <span className="material-icons text-sm">edit</span>
              Modifier
            </button>
            <button
              onClick={() => onDelete(pkg._id ?? pkg.id ?? '')}
              className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 text-sm"
            >
              <span className="material-icons text-sm">delete</span>
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageCard;

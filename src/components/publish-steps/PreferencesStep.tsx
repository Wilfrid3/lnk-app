import React from 'react';
import { clientTypes, appearances, offeringOptions } from '@/utils/constants';

interface PreferencesStepProps {
  clientType: string;
  appearance: string;
  offerings: string[];
  onUpdateClientType: (type: string) => void;
  onUpdateAppearance: (appearance: string) => void;
  onUpdateOfferings: (offerings: string[]) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({
  clientType,
  appearance,
  offerings,
  onUpdateClientType,
  onUpdateAppearance,
  onUpdateOfferings
}) => {
  const toggleOffering = (id: string) => {
    if (offerings.includes(id)) {
      onUpdateOfferings(offerings.filter(offering => offering !== id));
    } else {
      onUpdateOfferings([...offerings, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        {/* Client Type */}
        <div>
          <label htmlFor="clientType" className="block text-lg font-medium mb-2">
            Clients acceptés <span className="text-primary-500">*</span>
          </label>
          <div className="relative">
            <select
              id="clientType"
              value={clientType}
              onChange={(e) => onUpdateClientType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisissez</option>
              {clientTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <span className="material-icons text-gray-400">expand_more</span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <label htmlFor="appearance" className="block text-lg font-medium mb-2">
            Apparence
          </label>
          <div className="relative">
            <select
              id="appearance"
              value={appearance}
              onChange={(e) => onUpdateAppearance(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisissez (Noir, Brune...)</option>
              {appearances.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <span className="material-icons text-gray-400">expand_more</span>
            </div>
          </div>
        </div>

        {/* Offerings */}
        <div>
          <label className="block text-lg font-medium mb-3">
            Cochez ce que vous pouvez offrir
          </label>
          <div className="grid grid-cols-2 gap-3">
            {offeringOptions.map((option) => (
              <div 
                key={option.id}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id={option.id}
                  checked={offerings.includes(option.id)}
                  onChange={() => toggleOffering(option.id)}
                  className="h-5 w-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor={option.id} className="ml-2 flex items-center cursor-pointer">
                  <span className="material-icons mr-2 text-gray-500 text-lg">
                    {option.icon}
                  </span>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default PreferencesStep;

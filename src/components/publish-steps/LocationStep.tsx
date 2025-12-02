import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { citiesByCountryCode, neighborhoodsByCity, travelOptions } from '@/utils/constants';

interface LocationStepProps {
  city: string;
  neighborhood: string;
  travelOption: string;
  phoneNumber: string;
  whatsappNumber: string;
  countryCode: string;
  handleCountryCodeChange: (code: string) => void;
  onUpdateCity: (city: string) => void;
  onUpdateNeighborhood: (neighborhood: string) => void;
  onUpdateTravelOption: (option: string) => void;
  onUpdatePhoneNumber: (number: string) => void;
  onUpdateWhatsappNumber: (number: string) => void;
}

// Country codes with flags for phone number input
const countryCodes = [
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin' },
  { code: '+235', country: 'TD', flag: '🇹🇩', name: 'Tchad' },
]

const LocationStep: React.FC<LocationStepProps> = ({
  city,
  neighborhood,
  travelOption,
  phoneNumber,
  whatsappNumber,
  countryCode,
  handleCountryCodeChange,
  onUpdateCity,
  onUpdateNeighborhood,
  onUpdateTravelOption,
  onUpdatePhoneNumber,
  onUpdateWhatsappNumber
}) => {
  const { user } = useAuth();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Get neighborhoods based on selected city
  const availableNeighborhoods = city ?
    neighborhoodsByCity[city] || [] : [];

  // Determine the user's country code from their profile
  useEffect(() => {
    // Default to Cameroon if no country code is found
    let userCountryCode = '+237';

    if (user?.countryCode) {
      // If user has countryCode directly in their profile
      userCountryCode = user.countryCode;
    } else if (user?.phoneNumber) {
      // Try to extract country code from phone number
      const phoneCountryCodeRegex = /^(\+\d+)/;
      const phoneCountryCodeMatch = phoneCountryCodeRegex.exec(user.phoneNumber);
      if (phoneCountryCodeMatch) {
        userCountryCode = phoneCountryCodeMatch[1];
      }
    }

    // Get cities for the user's country code or fall back to Cameroon
    const cities = citiesByCountryCode[userCountryCode] || citiesByCountryCode['+237'];
    setAvailableCities(cities);
  }, [user]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    onUpdateCity(newCity);
    // Reset neighborhood when city changes
    onUpdateNeighborhood('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="space-y-6">
        {/* City Selection */}
        <div>
          <label htmlFor="city" className="block text-lg font-medium mb-2">
            Sélectionnez la ville <span className="text-primary-500">*</span>
          </label>
          <div className="relative">
            <select
              id="city"
              value={city}
              onChange={handleCityChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisissez</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <span className="material-icons text-gray-400">expand_more</span>
            </div>
          </div>
        </div>

        {/* Neighborhood Selection - Only show if city is selected */}
        {city && (
          <div>
            <label htmlFor="neighborhood" className="block text-lg font-medium mb-2">
              Sélectionnez le quartier
            </label>
            <div className="relative">
              <select
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => onUpdateNeighborhood(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choisissez</option>
                {availableNeighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <span className="material-icons text-gray-400">expand_more</span>
              </div>
            </div>
          </div>
        )}

        {/* Travel Options */}
        <div>
          <label htmlFor="travelOption" className="block text-lg font-medium mb-2">
            Déplacement <span className="text-primary-500">*</span>
          </label>
          <div className="relative">
            <select
              id="travelOption"
              value={travelOption}
              onChange={(e) => onUpdateTravelOption(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisissez</option>
              {travelOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <span className="material-icons text-gray-400">expand_more</span>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-lg font-medium mb-2">
            Numéro de téléphone (appel) <span className="text-primary-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onUpdatePhoneNumber(e.target.value)}
            placeholder="Saisissez le numéro d'appel"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* WhatsApp Number */}
        <div>
          <label htmlFor="whatsapp" className="block text-lg font-medium mb-2">
            Numéro de téléphone (WhatsApp)
          </label>
          <div className="flex">
            {/* Country Code Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center h-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-l-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <span className="mr-1">
                  {countryCodes.find(c => c.code === countryCode)?.flag}
                </span>
                <span>{countryCode}</span>
                <span className="ml-1">▼</span>
              </button>

              {/* Dropdown Menu */}
              {showCountryDropdown && (
                <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {countryCodes.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryCodeChange(country.code)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-left"
                      >
                        <span className="mr-2">{country.flag}</span>
                        <span className="mr-2">{country.code}</span>
                        <span>{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Input */}

            <input
              id="whatsapp"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => onUpdateWhatsappNumber(e.target.value)}
              placeholder="Saisissez le numéro WhatsApp"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="text-primary-500 text-sm">
          <p>Vous devez indiquer au moins un moyen pour vous contacter. Soit par appel ou par WhatsApp. Vous pouvez choisir par appel et WhatsApp si vous le désirez.</p>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

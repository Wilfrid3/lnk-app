'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import BottomSheet from '@/components/BottomSheet'
import ServiceCategoryCard from '@/components/ServiceCategoryCard'
import PostCard from '@/components/PostCard'
import UserCard, { UserCardProps } from '@/components/UserCard'
import { countries, citiesByCountryCode, appearanceFilters, userTypeFilters, partnerTypes, lgbtqOptions, physicalAttributes, chestSizes, bodyTypes, ageGroups } from '@/utils/constants'
import { User } from '@/services/usersService'
import { mapApiPostToCardProps } from '@/utils/postMappers'
import { ApiPost } from '@/services/postsService'
import { useSearchStore } from '@/store/useSearchStore'
import { useInfiniteSearch } from '@/hooks/useInfiniteSearch'

// Sample data
const categories = [
  { id: '1', name: 'Masseuses', icon: 'spa', count: 120 },
  { id: '2', name: 'Escortes', icon: 'luggage', count: 85 },
  { id: '3', name: 'Tourism', icon: 'flight', count: 48 },
  { id: '4', name: 'Rencontres', icon: 'favorite', count: 156 },
  { id: '5', name: 'Détente', icon: 'pool', count: 94 },
  { id: '6', name: 'Serveuses', icon: 'restaurant', count: 62 }
];

export default function SearchView() {
  // Get values from search store
  const { 
    selectedCity: storeCity, 
    selectedCountry: storeCountry, 
    searchQuery: storeQuery,
    resetSearch 
  } = useSearchStore();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false); // Collapsed by default
  
  // Search type state - posts or users
  const [searchType, setSearchType] = useState<'posts' | 'users'>('posts');
  
  // Filter state
  const [selectedCountry, setSelectedCountry] = useState('+237'); // Use phone code instead of country code
  const [selectedCity, setSelectedCity] = useState('');
  
  // Additional filter states from design
  const [selectedAppearance, setSelectedAppearance] = useState<string[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedLgbtq, setSelectedLgbtq] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedChestSize, setSelectedChestSize] = useState<string[]>([]);
  const [selectedBodyType, setSelectedBodyType] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  
  // Price filters for posts
  const [priceRange, setPriceRange] = useState([0, 100000]); // [min, max] in FCFA
  
  // Initialize search values from store when component mounts
  const [storeInitialized, setStoreInitialized] = useState(false);
  
  // Intersection observer ref for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Build search parameters for the infinite search hook - memoized to prevent infinite re-renders
  const searchParams = useMemo(() => ({
    query,
    city: selectedCity,
    userType: selectedUserTypes[0],
    clientType: selectedUserTypes[0],
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 100000 ? priceRange[1] : undefined,
    offerings: selectedAttributes,
    category: selectedCategory,
    appearance: selectedAppearance[0],
    verified: verifiedOnly,
    premium: premiumOnly,
    minAge: selectedAgeGroups.includes('jeune') ? 18 : selectedAgeGroups.includes('intermediaire') ? 28 : selectedAgeGroups.includes('mature') ? 38 : undefined,
    maxAge: selectedAgeGroups.includes('jeune') ? 27 : selectedAgeGroups.includes('intermediaire') ? 37 : undefined,
  }), [
    query,
    selectedCity,
    selectedUserTypes,
    priceRange,
    selectedAttributes,
    selectedCategory,
    selectedAppearance,
    verifiedOnly,
    premiumOnly,
    selectedAgeGroups
  ]);
  
  // Use the infinite search hook
  const {
    posts: searchResultPosts,
    users: searchResultUsers,
    loading: isSearching,
    error: searchError,
    hasMore,
    loadMore,
    totalItems
  } = useInfiniteSearch({
    searchType,
    initialLimit: 10,
    searchParams
  });
  
  // Convert API posts to PostCard props
  const searchResults = searchResultPosts.map((post: ApiPost) => mapApiPostToCardProps(post));
  
  // Convert API users to UserCard props
  const userResults: UserCardProps[] = searchResultUsers.map((user: User) => ({
    id: user._id,
    name: user.name || 'Utilisateur',
    avatar: user.avatar || '/images/avatars/default_tous.png',
    coverImage: user.coverImage,
    vip: user.isVip || false,
    verified: user.isVerified || false,
  }));
  
  useEffect(() => {
    if (!storeInitialized) {
      let hasStoreValues = false;
      
      if (storeCity) {
        setSelectedCity(storeCity);
        hasStoreValues = true;
      }
      if (storeCountry) {
        setSelectedCountry(storeCountry);
        hasStoreValues = true;
      }
      if (storeQuery) {
        setQuery(storeQuery);
        hasStoreValues = true;
      }
      
      // Reset the store after using the values
      if (hasStoreValues) {
        resetSearch();
      }
      
      setStoreInitialized(true);
    }
  }, [storeCity, storeCountry, storeQuery, resetSearch, storeInitialized]); // Include dependencies
  
  // Toggle selection for checkbox filters
  const toggleSelection = (
    id: string, 
    currentSelections: string[], 
    setSelections: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentSelections.includes(id)) {
      setSelections(currentSelections.filter(item => item !== id));
    } else {
      setSelections([...currentSelections, id]);
    }
  };
  
  // Handle search submit (simple form handler)
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // The search is automatically handled by the infinite search hook
  }, []);
  
  // Intersection observer ref for infinite scrolling
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isSearching) return;
    
    // Disconnect the previous observer if it exists
    if (observer.current) observer.current.disconnect();
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last item is visible and we have more items to load
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    // Start observing the last element
    if (node) observer.current.observe(node);
  }, [isSearching, hasMore, loadMore]);
  
  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    // Filters are automatically applied through the searchParams dependency
  };
  
  // Reset all filters to default values
  const resetFilters = () => {
    setSelectedCity('');
    setSelectedAppearance([]);
    setSelectedUserTypes([]);
    setSelectedPartners([]);
    setSelectedLgbtq([]);
    setSelectedAttributes([]);
    setSelectedChestSize([]);
    setSelectedBodyType([]);
    setSelectedAgeGroups([]);
    setVerifiedOnly(false);
    setPremiumOnly(false);
    setPriceRange([0, 100000]);
  };
  
  // Handle search type change
  const handleSearchTypeChange = (type: 'posts' | 'users') => {
    setSearchType(type);
  };
  
  // Categories click handler
  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      // In a real app, filter results based on category
    }
  };

  // Filter sections for the bottom sheet
  const renderFilterSection = (
    title: string,
    options: {id: string, label: string, icon?: string, color?: string, category?: string}[],
    selectedValues: string[],
    setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>,
    filterBy?: string
  ) => {
    const filteredOptions = filterBy 
      ? options.filter(option => option.category === filterBy)
      : options;
      
    if (filteredOptions.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <div className="grid grid-cols-2 gap-2">
          {filteredOptions.map(option => (
            <label 
              key={option.id} 
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                checked={selectedValues.includes(option.id)}
                onChange={() => toggleSelection(option.id, selectedValues, setSelectedValues)}
              />
              <span className="flex items-center text-gray-800 dark:text-gray-200">
                {option.color && (
                  <span 
                    className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: option.color }}
                  ></span>
                )}
                {option.icon && !option.color && (
                  <span className="material-icons text-sm mr-1">
                    {option.icon}
                  </span>
                )}
                <span className="text-sm">{option.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <style jsx>{`
        .range-slider-container {
          position: relative;
          height: 20px;
          margin: 0;
        }
        
        .range-slider-track {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
        }
        
        .dark .range-slider-track {
          background: #374151;
        }
        
        .range-slider-highlight {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 4px;
          background: #3b82f6;
          border-radius: 2px;
        }
        
        .range-slider-thumb {
          position: absolute;
          top: 0;
          width: 100%;
          height: 20px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
          margin: 0;
          cursor: pointer;
        }
        
        .range-slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.1s ease;
        }
        
        .range-slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        
        .range-slider-thumb::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        
        .range-slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          -moz-appearance: none;
        }
        
        .range-slider-thumb::-moz-range-track {
          background: transparent;
          border: none;
        }
        
        .dark .range-slider-thumb::-webkit-slider-thumb {
          border-color: #1f2937;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .dark .range-slider-thumb::-moz-range-thumb {
          border-color: #1f2937;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-20">
        {/* Search Header */}
        <div className="pt-2 pb-4">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <div className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="material-icons text-gray-400 dark:text-gray-500">search</span>
                </div>
                <input
                  type="search"
                  className="block w-full p-3 pl-10 pr-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white"
                  placeholder="Rechercher des services..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowFilters(true)}
                >
                  <span className="material-icons text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400">tune</span>
                </button>
              </div>
            </div>
          </form>

          {/* Location selector */}
          <div className="flex items-center mb-4 space-x-2 overflow-x-auto pb-1 hide-scrollbar">
            <div className="relative flex-shrink-0">
              <select 
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity(''); // Reset city when country changes
                }}
                className="bg-white dark:bg-gray-800 text-sm rounded-full py-2 pl-3 pr-7 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none text-gray-900 dark:text-white min-w-0"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name === 'Cameroun' ? 'Cameroun' :
                     country.name === 'France' ? 'France' :
                     country.name === 'Côte d\'Ivoire' ? 'C. d\'Ivoire' :
                     country.name === 'Sénégal' ? 'Sénégal' :
                     country.name === 'Burkina Faso' ? 'B. Faso' :
                     country.name === 'Gabon' ? 'Gabon' :
                     country.name === 'Congo' ? 'Congo' :
                     country.name === 'République démocratique du Congo' ? 'RD Congo' :
                     country.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <span className="material-icons text-gray-400 text-sm">expand_more</span>
              </div>
            </div>
            
            <div className="relative flex-shrink-0">
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white dark:bg-gray-800 text-sm rounded-full py-2 pl-3 pr-7 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none text-gray-900 dark:text-white min-w-0"
              >
                <option value="">Toutes les villes</option>
                {citiesByCountryCode[selectedCountry]?.map((city: string) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <span className="material-icons text-gray-400 text-sm">expand_more</span>
              </div>
            </div>
          </div>
          
          {/* Search Type Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => handleSearchTypeChange('posts')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                searchType === 'posts'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-icons text-sm mr-1">campaign</span>
              Annonces
            </button>
            <button
              onClick={() => handleSearchTypeChange('users')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
                searchType === 'users'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="material-icons text-sm mr-1">people</span>
              Utilisateurs
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-6" hidden={true}>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center justify-between w-full text-left mb-3 focus:outline-none"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catégories</h2>
            <span className={`material-icons text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
          {showCategories && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 animate-in slide-in-from-top-2 duration-200">
              {categories.map(category => (
                <ServiceCategoryCard
                  key={category.id}
                  icon={category.icon}
                  name={category.name}
                  count={category.count}
                  isSelected={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Search Results */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            {searchType === 'posts' ? 'Annonces' : 'Utilisateurs'} 
            {totalItems > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({totalItems} résultat{totalItems > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          
          {/* Render Posts */}
          {searchType === 'posts' && (
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                <div 
                  key={result.id} 
                  ref={index === searchResults.length - 1 ? lastElementRef : undefined}
                >
                  <PostCard {...result} />
                </div>
              ))}
            </div>
          )}
          
          {/* Render Users */}
          {searchType === 'users' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {userResults.map((user, index) => (
                <div 
                  key={user.id}
                  ref={index === userResults.length - 1 ? lastElementRef : undefined}
                >
                  <UserCard {...user} />
                </div>
              ))}
            </div>
          )}
          
          {/* Loading indicator for pagination */}
          {isSearching && (searchResults.length > 0 || userResults.length > 0) && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin mr-2">
                <span className="material-icons text-primary-500">refresh</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Chargement...</span>
            </div>
          )}
          
          {/* Initial loading state */}
          {isSearching && searchResults.length === 0 && userResults.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin mr-2">
                <span className="material-icons text-primary-500">refresh</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Recherche en cours...</span>
            </div>
          )}
          
          {/* No more results indicator */}
          {!hasMore && (searchResults.length > 0 || userResults.length > 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Vous avez atteint la fin des résultats disponibles.
              </p>
            </div>
          )}
          
          {/* No Results */}
          {!isSearching && searchResults.length === 0 && userResults.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <span className="material-icons text-gray-400 dark:text-gray-500 text-5xl mb-2">search_off</span>
              <p className="text-gray-500 dark:text-gray-400">Aucun résultat trouvé</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Essayez d&apos;autres mots-clés ou filtres</p>
            </div>
          )}
          
          {/* Error state */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
              {searchError}
            </div>
          )}
        </div>
        
        {/* Filter Bottom Sheet */}
        <BottomSheet isOpen={showFilters} onClose={() => setShowFilters(false)}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Faites votre choix en un clic !</h2>
              <button 
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="material-icons text-gray-700 dark:text-gray-300">close</span>
              </button>
            </div>
            
            {/* Filter Options based on the design */}
            <div className="overflow-y-auto max-h-[70vh] pr-1">
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                      checked={verifiedOnly}
                      onChange={() => setVerifiedOnly(v => !v)}
                  />
                  <span className="flex items-center text-gray-800 dark:text-gray-200">
                  <span className="material-icons text-sm mr-1">verified</span>
                  <span className="text-sm">Vérifié uniquement</span>
                  </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                        checked={premiumOnly}
                        onChange={() => setPremiumOnly(v => !v)}
                    />
                    <span className="flex items-center text-gray-800 dark:text-gray-200">
                  <span className="material-icons text-sm mr-1">star</span>
                  <span className="text-sm">Premium uniquement</span>
                </span>
                </label>
              </div>
              
              {/* Appearance Filter (replaces skin tones with gender-aware options) */}
              {renderFilterSection(
                "Apparence", 
                appearanceFilters, 
                selectedAppearance, 
                setSelectedAppearance
              )}
              
              {/* User Types Filter (new filter for homme/femme/couple/autres) */}
              {renderFilterSection(
                "Type d'utilisateur", 
                userTypeFilters, 
                selectedUserTypes, 
                setSelectedUserTypes
              )}
              
              {/* Price Range Filter (for posts only) */}
              {searchType === 'posts' && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                    Fourchette de prix (FCFA)
                  </h3>
                  <div className="px-3">
                    {/* Price range display */}
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{priceRange[0].toLocaleString()} FCFA</span>
                      <span>{priceRange[1].toLocaleString()} FCFA</span>
                    </div>
                    
                    {/* Range slider */}
                    <div className="range-slider-container mb-4">
                      <div className="range-slider-track"></div>
                      <div 
                        className="range-slider-highlight"
                        style={{ 
                          left: `${(priceRange[0] / 100000) * 100}%`,
                          width: `${((priceRange[1] - priceRange[0]) / 100000) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          if (newMin <= priceRange[1]) {
                            setPriceRange([newMin, priceRange[1]]);
                          }
                        }}
                        className="range-slider-thumb"
                        style={{ zIndex: priceRange[0] > 100000 - priceRange[1] ? 2 : 1 }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          if (newMax >= priceRange[0]) {
                            setPriceRange([priceRange[0], newMax]);
                          }
                        }}
                        className="range-slider-thumb"
                        style={{ zIndex: priceRange[0] > 100000 - priceRange[1] ? 1 : 2 }}
                      />
                    </div>
                    
                    {/* Price presets */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: '0-10K', range: [0, 10000] },
                        { label: '10-25K', range: [10000, 25000] },
                        { label: '25-50K', range: [25000, 50000] },
                        { label: '50K+', range: [50000, 100000] }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setPriceRange(preset.range)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Manual input fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prix minimum</label>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100000"
                          step="1000"
                          value={priceRange[0] || ''}
                          onChange={(e) => {
                            const newMin = parseInt(e.target.value) || 0;
                            if (newMin <= priceRange[1] && newMin >= 0 && newMin <= 100000) {
                              setPriceRange([newMin, priceRange[1]]);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value < 0) setPriceRange([0, priceRange[1]]);
                            if (value > priceRange[1]) setPriceRange([priceRange[1], priceRange[1]]);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prix maximum</label>
                        <input
                          type="number"
                          placeholder="100000"
                          min="0"
                          max="100000"
                          step="1000"
                          value={priceRange[1] || ''}
                          onChange={(e) => {
                            const newMax = parseInt(e.target.value) || 100000;
                            if (newMax >= priceRange[0] && newMax <= 100000 && newMax >= 0) {
                              setPriceRange([priceRange[0], newMax]);
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value) || 100000;
                            if (value > 100000) setPriceRange([priceRange[0], 100000]);
                            if (value < priceRange[0]) setPriceRange([priceRange[0], priceRange[0]]);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Partner Types */}
              {renderFilterSection(
                "Partenaires", 
                partnerTypes, 
                selectedPartners, 
                setSelectedPartners
              )}
              
              {/* LGBTQ Options */}
              {renderFilterSection(
                "LGBTQ", 
                lgbtqOptions, 
                selectedLgbtq, 
                setSelectedLgbtq
              )}
              
              {/* Intimate Attributes */}
              {renderFilterSection(
                "Partie intime", 
                physicalAttributes, 
                selectedAttributes, 
                setSelectedAttributes, 
                "intime"
              )}
              
              {/* Délires (Preferences) */}
              {renderFilterSection(
                "Délires", 
                physicalAttributes, 
                selectedAttributes, 
                setSelectedAttributes, 
                "delires"
              )}
              
              {/* Chest Size */}
              {renderFilterSection(
                "Poitrine", 
                chestSizes, 
                selectedChestSize, 
                setSelectedChestSize
              )}
              
              {/* Body Type */}
              {renderFilterSection(
                "Corpulence", 
                bodyTypes, 
                selectedBodyType, 
                setSelectedBodyType
              )}
              
              {/* Age Groups */}
              {renderFilterSection(
                "Age", 
                ageGroups, 
                selectedAgeGroups, 
                setSelectedAgeGroups
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={resetFilters}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
              >
                Réinitialiser
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </DefaultLayout>
  );
}

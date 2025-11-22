import { create } from 'zustand';

interface SearchStoreState {
  selectedCity: string | null;
  selectedCountry: string | null;
  searchQuery: string | null;
  setSelectedCity: (city: string) => void;
  setSelectedCountry: (country: string) => void;
  setSearchQuery: (query: string) => void;
  resetSearch: () => void;
  setSearchLocation: (city: string, country: string) => void;
}

export const useSearchStore = create<SearchStoreState>((set) => ({
  selectedCity: null,
  selectedCountry: null,
  searchQuery: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetSearch: () => set({ 
    selectedCity: null, 
    selectedCountry: null, 
    searchQuery: null 
  }),
  setSearchLocation: (city: string, country: string) => set({
  selectedCity: city,
  selectedCountry: country
})
}));

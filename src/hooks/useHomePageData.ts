import { create } from 'zustand'
import { getTopCities } from '@/services/postsService'
import type { Location } from '@/components/LocationList'

interface HomePageDataStore {
  locations: Location[] | null
  isLoading: boolean
  isInitialized: boolean
  setLocations: (locations: Location[]) => void
  loadLocations: () => Promise<void>
}

export const useHomePageDataStore = create<HomePageDataStore>((set) => ({
  locations: null,
  isLoading: false,
  isInitialized: false,
  
  setLocations: (locations) => set({ locations }),
  
  loadLocations: async () => {
    set({ isLoading: true })
    try {
      const cities = await getTopCities()
      const transformedLocations = cities.map(city => ({
        name: city.city,
        count: city.count,
      }))
      set({ locations: transformedLocations, isInitialized: true })
    } catch (error) {
      console.error('Failed to load top cities:', error)
      set({ isInitialized: true })
    } finally {
      set({ isLoading: false })
    }
  },
}))

export const useHomePageData = () => {
  const { locations, isLoading, isInitialized, loadLocations } = useHomePageDataStore()

  // Charger les données une seule fois au montage initial
  const shouldLoad = !isInitialized && !isLoading
  
  return {
    locations,
    isLoading: isLoading || (!isInitialized && locations === null),
    shouldLoad,
    loadLocations,
  }
}

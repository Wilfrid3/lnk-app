import { create } from 'zustand'
import apiClient from '@/lib/axios'

// Types for API services
interface ApiService {
  id: string;
  label: string;
  category: string;
  icon?: string;
  sortOrder: number;
}

interface ApiCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  sortOrder: number;
}

interface ServicesState {
  services: ApiService[]
  categories: ApiCategory[]
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  
  // Actions
  loadServices: () => Promise<void>
  getServiceById: (id: string) => ApiService | undefined
  getServicesByCategory: (categoryId: string) => ApiService[]
  clearError: () => void
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  categories: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  loadServices: async () => {
    const { isLoaded, isLoading } = get()
    
    // Don't load if already loaded or currently loading
    if (isLoaded || isLoading) return

    try {
      set({ isLoading: true, error: null })
      
      const response = await apiClient.get('/services')
      const data = response.data as {
        services: ApiService[]
        categories: ApiCategory[]
      }
      
      // Sort services and categories by sortOrder
      const sortedServices = [...data.services].sort((a, b) => a.sortOrder - b.sortOrder)
      const sortedCategories = [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder)
      
      set({
        services: sortedServices,
        categories: sortedCategories,
        isLoaded: true,
        isLoading: false,
        error: null
      })
    } catch (error: unknown) {
      console.error('Error loading services:', error)
      set({
        isLoading: false,
        error: 'Erreur lors du chargement des services'
      })
    }
  },

  getServiceById: (id: string) => {
    const { services } = get()
    return services.find(service => service.id === id)
  },

  getServicesByCategory: (categoryId: string) => {
    const { services } = get()
    if (categoryId === 'all') return services
    return services.filter(service => service.category === categoryId)
  },

  clearError: () => set({ error: null })
}))

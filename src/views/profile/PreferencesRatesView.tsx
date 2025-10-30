'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { User, ServicePackage } from '@/types/User'
import { clientTypes, appearances, appearanceLabels } from '@/utils/constants'
import { useServicesStore } from '@/store/useServicesStore'
import PackageCard from '@/components/profile/PackageCard'

export default function PreferencesRatesView() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'preferences' | 'packages'>('preferences')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Services from Zustand store
  const { 
    services, 
    categories, 
    isLoading: isLoadingServices, 
    loadServices 
  } = useServicesStore()
  
  // Form state for preferences
  const [formData, setFormData] = useState({
    clientType: '',
    appearance: '',
    offerings: [] as string[],
    availabilityHours: '',
    specialServices: '',
    paymentMethods: [] as string[],
    additionalNotes: ''
  })

  // State for packages
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [isCreatingPackage, setIsCreatingPackage] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({
    title: '',
    services: [],
    price: 0,
    currency: 'FCFA',
    duration: '',
    description: '',
    isActive: true
  })

  // Load user data and packages when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        clientType: user.clientType ?? '',
        appearance: user.appearance ?? '',
        offerings: user.offerings ?? [],
        availabilityHours: user.availabilityHours ?? '',
        specialServices: user.specialServices ?? '',
        paymentMethods: user.paymentMethods ?? [],
        additionalNotes: user.additionalNotes ?? ''
      })
      // Load packages from API
      loadPackages()
    }
    // Load services from Zustand store
    loadServices()
  }, [user, loadServices])

  // Load packages from API
  const loadPackages = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/users/profile/packages')
      const data = response.data as { packages: ServicePackage[] }
      setPackages(data.packages ?? [])
    } catch (error: unknown) {
      console.error('Error loading packages:', error)
      setErrorMessage('Erreur lors du chargement des packages.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const togglePaymentMethod = (method: string) => {
    if (formData.paymentMethods.includes(method)) {
      setFormData({
        ...formData,
        paymentMethods: formData.paymentMethods.filter(pm => pm !== method)
      })
    } else {
      setFormData({
        ...formData,
        paymentMethods: [...formData.paymentMethods, method]
      })
    }
  }

  const toggleServiceInPackage = (serviceId: string) => {
    const currentServices = newPackage.services || []
    
    if (currentServices.includes(serviceId)) {
      setNewPackage({
        ...newPackage,
        services: currentServices.filter(s => s !== serviceId)
      })
    } else if (currentServices.length < 6) {
      setNewPackage({
        ...newPackage,
        services: [...currentServices, serviceId]
      })
    }
  }

  const handlePackageChange = (
    field: keyof ServicePackage,
    value: string | number | boolean | string[] | undefined
  ) => {
    setNewPackage({
      ...newPackage,
      [field]: value
    })
  }

  const savePackage = async () => {
    if (!newPackage.title || !newPackage.services?.length || !newPackage.price) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires du package.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const packageData = {
        title: newPackage.title || '',
        services: newPackage.services || [],
        price: newPackage.price || 0,
        currency: newPackage.currency ?? 'FCFA',
        duration: newPackage.duration,
        description: newPackage.description,
        isActive: newPackage.isActive !== false
      }

      if (editingPackageId) {
        // Update existing package
        const response = await apiClient.put(`/users/profile/packages/${editingPackageId}`, packageData)
        const data = response.data as { package: ServicePackage }
        setPackages(packages.map(p => p._id === editingPackageId ? data.package : p))
      } else {
        // Create new package
        const response = await apiClient.post('/users/profile/packages', packageData)
        const data = response.data as { package: ServicePackage }
        setPackages([...packages, data.package])
      }

      resetPackageForm()
      setSuccessMessage('Package sauvegardé avec succès.')
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error('Error saving package:', error)
      setErrorMessage(err.response?.data?.message ?? 'Erreur lors de la sauvegarde du package.')
    } finally {
      setIsLoading(false)
    }
  }

  const deletePackage = async (packageId: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await apiClient.delete(`/users/profile/packages/${packageId}`)
      setPackages(packages.filter(p => p._id !== packageId))
      setSuccessMessage('Package supprimé avec succès.')
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error('Error deleting package:', error)
      setErrorMessage(err.response?.data?.message ?? 'Erreur lors de la suppression du package.')
    } finally {
      setIsLoading(false)
    }
  }

  const editPackage = (pkg: ServicePackage) => {
    setNewPackage(pkg)
    setEditingPackageId(pkg._id ?? pkg.id ?? null) // Handle both _id and id for backward compatibility
    setIsCreatingPackage(true)
    setActiveTab('packages')
  }

  const resetPackageForm = () => {
    setNewPackage({
      title: '',
      services: [],
      price: 0,
      currency: 'FCFA',
      duration: '',
      description: '',
      isActive: true
    })
    setEditingPackageId(null)
    setIsCreatingPackage(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      // Only update preferences, not packages (packages are handled separately)
      const dataToSubmit = {
        clientType: formData.clientType,
        appearance: formData.appearance,
        offerings: formData.offerings,
        availabilityHours: formData.availabilityHours,
        specialServices: formData.specialServices,
        paymentMethods: formData.paymentMethods,
        additionalNotes: formData.additionalNotes
      }
      
      // Make API call to update preferences only
      const response = await apiClient.patch('/users/profile/preferences-rates', dataToSubmit)
      
      // Update the user context with the response data
      if (response.data && typeof response.data === 'object') {
        setUser(response.data as User)
      }
      
      setSuccessMessage('Vos préférences ont été mises à jour avec succès.')
      setIsEditing(false)
      
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      console.error('Error updating preferences:', error)
      setErrorMessage(err.response?.data?.message ?? 'Une erreur est survenue lors de la mise à jour. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'cash', label: 'Espèces', icon: 'payments' },
    { id: 'mobile_money', label: 'Mobile Money', icon: 'phone_android' },
    { id: 'bank_transfer', label: 'Virement bancaire', icon: 'account_balance' },
    { id: 'crypto', label: 'Cryptomonnaie', icon: 'currency_bitcoin' }
  ]

  // Get appearance options with gender-appropriate labels
  const getAppearanceOptions = () => {
    if (!user?.userType) return appearances.map(value => ({ value, label: value }))
    
    const labels = appearanceLabels[user.userType as keyof typeof appearanceLabels]
    return appearances.map(value => ({
      value, // Store base value in database
      label: labels?.[value as keyof typeof labels] || value // Display gender-appropriate label
    }))
  }

  // Filter services by category
  const getFilteredServices = () => {
    if (selectedCategory === 'all') return services
    return services.filter(service => service.category === selectedCategory)
  }

  const getServiceLabel = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.label ?? serviceId
  }

  const getServiceIcon = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    return service?.icon ?? 'star'
  }

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-32">
        <div className="flex items-center mb-1">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
          >
            <span className="material-icons text-gray-500 dark:text-gray-400">
              arrow_back_ios
            </span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes délires et Mes tarifs</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1 mb-3">
          Gérez vos préférences et créez vos packages de services
        </p>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => {
              setActiveTab('preferences')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className={`flex-1 py-2.5 px-3 text-center font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'preferences'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="material-icons mr-1.5 text-lg">favorite</span>
            Mes délires
          </button>
          <button
            onClick={() => {
              if (!isLoadingServices) {
                setActiveTab('packages')
                setErrorMessage('')
                setSuccessMessage('')
              }
            }}
            disabled={isLoadingServices}
            className={`flex-1 py-2.5 px-3 text-center font-medium rounded-lg transition-colors flex items-center justify-center ${
              activeTab === 'packages'
                ? 'bg-primary-500 text-white'
                : isLoadingServices
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {isLoadingServices ? (
              <>
                <span className="material-icons animate-spin mr-1.5 text-lg">autorenew</span>
                Chargement...
              </>
            ) : (
              <>
                <span className="material-icons mr-1.5 text-lg">monetization_on</span>
                Mes tarifs ({packages.length})
              </>
            )}
          </button>
        </div>
        
        {/* Action Buttons - Only show on preferences tab */}
        {activeTab === 'preferences' && (
          <div className="flex space-x-3 mb-4 justify-end">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="preferences-rates-form"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center"
                >
                  {isLoading ? (
                    <>
                      <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-2">save</span>
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center"
              >
                <span className="material-icons mr-2">edit</span>
                <span>Modifier</span>
              </button>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
            <form id="preferences-rates-form" onSubmit={handleSubmit}>
              <div className="space-y-6">
                
                {/* Client Type */}
                <div>
                  <label htmlFor="clientType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clients acceptés
                  </label>
                  <div className="relative">
                    <select
                      id="clientType"
                      name="clientType"
                      value={formData.clientType}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none
                        ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                        text-gray-900 dark:text-white`}
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
                  <label htmlFor="appearance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Je suis (apparence)
                  </label>
                  {!user?.userType && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Les options d&apos;apparence s&apos;adaptent selon votre genre défini dans vos informations personnelles.
                    </p>
                  )}
                  <div className="relative">
                    <select
                      id="appearance"
                      name="appearance"
                      value={formData.appearance}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none
                        ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                        text-gray-900 dark:text-white`}
                    >
                      <option value="">Choisissez (selon votre genre)</option>
                      {getAppearanceOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <span className="material-icons text-gray-400">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Availability Hours */}
                <div>
                  <label htmlFor="availabilityHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heures de disponibilité
                  </label>
                  <input
                    id="availabilityHours"
                    name="availabilityHours"
                    type="text"
                    value={formData.availabilityHours}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ex: 9h-22h, 24h/24, Sur rendez-vous..."
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  />
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Méthodes de paiement acceptées
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={method.id}
                          checked={formData.paymentMethods.includes(method.id)}
                          onChange={() => isEditing && togglePaymentMethod(method.id)}
                          disabled={!isEditing}
                          className="h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={method.id} className="ml-2 flex items-center text-sm text-gray-900 dark:text-white">
                          <span className="material-icons mr-2 text-gray-500 text-lg">
                            {method.icon}
                          </span>
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Services */}
                <div>
                  <label htmlFor="specialServices" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Services spéciaux
                  </label>
                  <textarea
                    id="specialServices"
                    name="specialServices"
                    rows={3}
                    value={formData.specialServices}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Décrivez vos services spéciaux ou personnalisés..."
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes supplémentaires
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    rows={3}
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Informations importantes, conditions particulières..."
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Loading Services */}
            {isLoadingServices && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700 text-center">
                <span className="material-icons animate-spin text-4xl text-primary-500 mb-4">autorenew</span>
                <p className="text-gray-600 dark:text-gray-400">Chargement des services disponibles...</p>
              </div>
            )}
            
            {/* Package Management - Only show when services are loaded */}
            {!isLoadingServices && (
              <>
                {/* Services not available fallback */}
                {services.length === 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 text-center">
                    <span className="material-icons text-yellow-600 dark:text-yellow-400 text-4xl mb-2">warning</span>
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Services non disponibles
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                      Les services ne peuvent pas être chargés actuellement. Vous pouvez toujours voir vos packages existants.
                    </p>
                    <button
                      onClick={loadServices}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                    >
                      Réessayer
                    </button>
                  </div>
                )}

                {/* Add Package Button */}
                {!isCreatingPackage && services.length > 0 && (
                  <button
                    onClick={() => setIsCreatingPackage(true)}
                    className="w-full py-4 border-2 border-dashed border-primary-300 rounded-lg text-primary-600 hover:border-primary-400 hover:text-primary-700 transition-colors flex items-center justify-center"
                  >
                    <span className="material-icons mr-2">add</span>
                    Créer un nouveau package
                  </button>
                )}

            {/* Package Creator/Editor */}
            {isCreatingPackage && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingPackageId ? 'Modifier le package' : 'Nouveau package'}
                  </h3>
                  <button
                    onClick={resetPackageForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Package Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre du package
                    </label>
                    <input
                      type="text"
                      value={newPackage.title ?? ''}
                      onChange={(e) => handlePackageChange('title', e.target.value)}
                      placeholder="Ex: Package Intimité, Service VIP..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Price and Currency */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prix
                      </label>
                      <input
                        type="number"
                        value={newPackage.price ?? ''}
                        onChange={(e) => handlePackageChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Devise
                      </label>
                      <select
                        value={newPackage.currency ?? 'FCFA'}
                        onChange={(e) => handlePackageChange('currency', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newPackage.duration ?? ''}
                      onChange={(e) => handlePackageChange('duration', e.target.value)}
                      placeholder="Ex: 1h, 2h, Nuit complète..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Services Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Services inclus ({newPackage.services?.length ?? 0}/6 max)
                    </label>
                    
                    {/* Category Filter */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedCategory === 'all'
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Tous
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center ${
                              selectedCategory === category.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            style={{
                              backgroundColor: selectedCategory === category.id ? undefined : `${category.color}20`,
                              borderColor: selectedCategory === category.id ? undefined : category.color
                            }}
                          >
                            <span className="material-icons text-xs mr-1">{category.icon}</span>
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Services Grid */}
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getFilteredServices().map((service) => {
                          const isSelected = newPackage.services?.includes(service.id) || false
                          const isDisabled = !isSelected && (newPackage.services?.length ?? 0) >= 6
                          
                          let buttonClass = 'p-2 rounded-lg text-left text-sm transition-colors flex items-center '
                          if (isSelected) {
                            buttonClass += 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-300'
                          } else if (isDisabled) {
                            buttonClass += 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          } else {
                            buttonClass += 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                          
                          return (
                            <button
                              key={service.id}
                              onClick={() => !isDisabled && toggleServiceInPackage(service.id)}
                              disabled={isDisabled}
                              className={buttonClass}
                            >
                              <span className="material-icons text-sm mr-2">{service.icon}</span>
                              {service.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      value={newPackage.description ?? ''}
                      onChange={(e) => handlePackageChange('description', e.target.value)}
                      placeholder="Décrivez votre package..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={resetPackageForm}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={savePackage}
                      disabled={!newPackage.title || !newPackage.services?.length || !newPackage.price}
                      className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
                    >
                      {editingPackageId ? 'Modifier' : 'Créer'} le package
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Packages */}
            {packages.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mes packages ({packages.length})
                </h3>
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg._id ?? pkg.id}
                    pkg={pkg}
                    onEdit={editPackage}
                    onDelete={deletePackage}
                    getServiceLabel={getServiceLabel}
                    getServiceIcon={getServiceIcon}
                  />
                ))}
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}


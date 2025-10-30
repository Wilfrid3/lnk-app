'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { User } from '@/types/User'
import { getFullImageUrl } from '@/utils/imageUtils'

export default function PersonalInfoView() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [coverError, setCoverError] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    age: '',
    userType: '',
    bio: ''
  })
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Process phone number to correctly separate country code and number
      let phoneNumberWithoutCode = '';
      let countryCode = user.countryCode || '+237';
      
      if (user.phoneNumber) {
        // If we have a country code, use it
        if (user.countryCode) {
          // Remove country code from the beginning of the phone number if it exists
          phoneNumberWithoutCode = user.phoneNumber.startsWith(user.countryCode) 
            ? user.phoneNumber.substring(user.countryCode.length) 
            : user.phoneNumber;
          countryCode = user.countryCode;
        } else {
          // Extract country code from phone number if possible
          const match = user.phoneNumber.match(/^(\+\d+)(.*)$/);
          if (match) {
            countryCode = match[1];
            phoneNumberWithoutCode = match[2];
          } else {
            // If no country code format is found, just use the full number
            phoneNumberWithoutCode = user.phoneNumber;
          }
        }
      }
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: phoneNumberWithoutCode,
        countryCode: countryCode,
        age: user.age?.toString() || '',
        userType: user.userType || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  // Function to get user type label
  const getUserTypeLabel = (userType: string): string => {
    switch (userType) {
      case 'homme': return 'Homme';
      case 'femme': return 'Femme';
      case 'couple': return 'Couple';
      default: return 'Autres';
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide.')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La taille de l\'image ne doit pas dépasser 5MB.')
      return
    }

    setIsUploadingAvatar(true)
    setErrorMessage('')
    setSuccessMessage('')
    setAvatarError(false)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiClient.patch('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update user with the response data
      if (response.data && typeof response.data === 'object') {
        setUser(response.data as User)
      }

      setSuccessMessage('Photo de profil mise à jour avec succès.')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setErrorMessage('Erreur lors du téléchargement de la photo de profil.')
    } finally {
      setIsUploadingAvatar(false)
      // Reset the input
      event.target.value = ''
    }
  }

  // Handle cover image upload
  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide.')
      return
    }

    // Validate file size (10MB limit for cover)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('La taille de l\'image ne doit pas dépasser 10MB.')
      return
    }

    setIsUploadingCover(true)
    setErrorMessage('')
    setSuccessMessage('')
    setCoverError(false)

    try {
      const formData = new FormData()
      formData.append('cover', file)

      const response = await apiClient.patch('/users/profile/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update user with the response data
      if (response.data && typeof response.data === 'object') {
        setUser(response.data as User)
      }

      setSuccessMessage('Photo de couverture mise à jour avec succès.')
    } catch (error) {
      console.error('Error uploading cover image:', error)
      setErrorMessage('Erreur lors du téléchargement de la photo de couverture.')
    } finally {
      setIsUploadingCover(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')
    
    try {
      // Only include fields that have been changed
      const initialData = {
        name: user?.name || '',
        bio: user?.bio || '',
        age: user?.age?.toString() || '',
        userType: user?.userType || '',
      }
        // Create an object with only the changed fields
      const changedData: Record<string, string | number | undefined> = {}
      
      // Check name field
      if (formData.name !== initialData.name) {
        changedData.name = formData.name
      }
      
      // Check bio field
      if (formData.bio !== initialData.bio) {
        changedData.bio = formData.bio
      }
      
      // Check age field and convert to number if present
      if (formData.age !== initialData.age) {
        changedData.age = formData.age ? parseInt(formData.age) : undefined
      }
      
      // Check userType field
      if (formData.userType !== initialData.userType) {
        changedData.userType = formData.userType
      }
      
      // Only make the API call if there are changes
      if (Object.keys(changedData).length > 0) {
        // Make API call to update user information with only changed fields
        await apiClient.patch('/users/profile', changedData)
      }
      
      // Get the updated user data to ensure we have the latest version
      const response = await apiClient.get('/auth/me')
      
      // Update the user context with the properly typed data
      if (response.data && typeof response.data === 'object') {
        // Cast the response data to User type
        setUser(response.data as User)
      }
      
      setSuccessMessage('Vos informations ont été mises à jour avec succès.')
      setIsEditing(false)
      
      // Optionally refresh the page or fetch updated user data
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrorMessage('Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Informations</h1>
        </div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400 mt-1">
              Consultez et modifiez vos informations personnelles
            </p>
        </div>

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

        {/* Cover Image and Avatar Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-primary-500 to-primary-600">
            {user?.coverImage && !coverError ? (
              <Image
                src={getFullImageUrl(user.coverImage) || ''}
                alt="Photo de couverture"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setCoverError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white text-sm opacity-75">Photo de couverture</span>
              </div>
            )}
            
            {/* Cover Image Upload Button */}
            <div className="absolute top-4 right-4">
              <input
                type="file"
                id="coverImageInput"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
              <label
                htmlFor="coverImageInput"
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center"
              >
                {isUploadingCover ? (
                  <span className="material-icons animate-spin text-sm">autorenew</span>
                ) : (
                  <span className="material-icons text-sm">photo_camera</span>
                )}
              </label>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-16 relative">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 overflow-hidden relative">
                  {user?.avatar && !avatarError ? (
                    <Image
                      src={getFullImageUrl(user.avatar) || ''}
                      alt="Photo de profil"
                      fill
                      className="object-cover"
                      sizes="96px"
                      onError={() => setAvatarError(true)}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="material-icons text-gray-500 dark:text-gray-400 text-3xl">person</span>
                    </div>
                  )}
                </div>
                
                {/* Avatar Upload Button */}
                <div className="absolute -bottom-1 -right-1">
                  <input
                    type="file"
                    id="avatarInput"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatarInput"
                    className="bg-primary-500 hover:bg-primary-600 text-white p-1.5 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border-2 border-white dark:border-gray-800"
                  >
                    {isUploadingAvatar ? (
                      <span className="material-icons animate-spin text-sm">autorenew</span>
                    ) : (
                      <span className="material-icons text-sm">edit</span>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-white truncate">
                    {user?.name || 'Nom non défini'}
                  </h2>
                  <p className="text-sm text-white/90 font-medium">
                    {getUserTypeLabel(user?.userType || '')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Image Upload Tips */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>• Photo de profil: Max 5MB (JPG, PNG, GIF)</p>
              <p>• Photo de couverture: Max 10MB (JPG, PNG, GIF)</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* User Type */}
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de compte
                </label>
                {!user?.userType || !['homme', 'femme', 'couple', 'autres'].includes(user.userType) ? (
                  // Interactive selection for users without a valid type
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.userType === 'homme'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="homme"
                        className="sr-only"
                        checked={formData.userType === 'homme'}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                      <span>Homme</span>
                    </label>

                    <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.userType === 'femme'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="femme"
                        className="sr-only"
                        checked={formData.userType === 'femme'}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                      <span>Femme</span>
                    </label>

                    <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.userType === 'couple'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="couple"
                        className="sr-only"
                        checked={formData.userType === 'couple'}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                      <span>Couple</span>
                    </label>

                    <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.userType === 'autres'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-primary-300'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="autres"
                        className="sr-only"
                        checked={formData.userType === 'autres'}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                      <span>Autres</span>
                    </label>
                  </div>
                ) : (
                  // Read-only display for users with valid type
                  <input
                    id="userType"
                    type="text"
                    value={getUserTypeLabel(formData.userType)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                    disabled
                  />
                )}
              </div>
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom & Prénom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                    text-gray-900 dark:text-white`}
                />
              </div>              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || !!user?.email}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  />
                  {user?.isEmailVerified ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-icons text-green-500" title="Email vérifié">verified</span>
                    </div>
                  ) : user?.email ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-icons text-yellow-500" title="Email non vérifié">error_outline</span>
                    </div>
                  ) : null}
                </div>                {user?.email && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    L&apos;email ne peut pas être modifié une fois défini. Contactez le support pour toute modification.
                  </p>
                )}
              </div>              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de téléphone
                </label>
                <div className="flex">
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    disabled={!isEditing || !!user?.phoneNumber}
                    className={`w-24 px-3 py-3 rounded-l-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  >
                    <option value="+237">🇨🇲 +237</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+226">🇧🇫 +226</option>
                    <option value="+241">🇬🇦 +241</option>
                    <option value="+242">🇨🇬 +242</option>
                    <option value="+243">🇨🇩 +243</option>
                  </select>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing || !!user?.phoneNumber}
                    className={`flex-1 px-4 py-3 rounded-r-lg border border-gray-300 dark:border-gray-700 border-l-0 focus:outline-none focus:ring-1 focus:ring-primary-500 
                      ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                      text-gray-900 dark:text-white`}
                  />
                </div>
                {user?.phoneNumber && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Le numéro de téléphone ne peut pas être modifié une fois défini. Contactez le support pour toute modification.
                  </p>
                )}
                {!user?.isPhoneVerified && user?.phoneNumber && (
                  <div className="mt-1 flex items-center text-yellow-500 text-sm">
                    <span className="material-icons text-sm mr-1">error_outline</span>
                    <span>Numéro non vérifié</span>
                  </div>
                )}
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Age
                </label>
                <select
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                    text-gray-900 dark:text-white`}
                >
                  <option value="">Sélectionner</option>
                  {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age} ans</option>
                  ))}
                </select>
              </div>

              {/* Bio / About Me */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  À propos de moi
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 
                    ${!isEditing ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} 
                    text-gray-900 dark:text-white`}
                  placeholder={isEditing ? "Parlez un peu de vous..." : ""}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
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
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  )
}
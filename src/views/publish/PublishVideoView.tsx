'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import Image from 'next/image'
import apiClient from '@/lib/axios'

interface VideoFormData {
  title: string
  description: string
  videoFile: File | null
  thumbnailFile: File | null
}

export default function PublishVideoView() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    videoFile: null,
    thumbnailFile: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setErrorMessage('Veuillez sélectionner un fichier vidéo valide')
        return
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrorMessage('La vidéo ne peut pas dépasser 100MB')
        return
      }
      
      setFormData(prev => ({ ...prev, videoFile: file }))
      setVideoPreview(URL.createObjectURL(file))
      setErrorMessage(null)
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Veuillez sélectionner une image valide pour la vignette')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('La vignette ne peut pas dépasser 10MB')
        return
      }
      
      setFormData(prev => ({ ...prev, thumbnailFile: file }))
      setThumbnailPreview(URL.createObjectURL(file))
      setErrorMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // Validation
    if (!formData.title.trim()) {
      setErrorMessage('Le titre est requis')
      return
    }
    
    if (!formData.description.trim()) {
      setErrorMessage('La description est requise')
      return
    }
    
    if (!formData.videoFile) {
      setErrorMessage('Veuillez sélectionner une vidéo')
      return
    }
    
    // Thumbnail is optional - API can work without it
    // if (!formData.thumbnailFile) {
    //   setErrorMessage('Veuillez sélectionner une vignette')
    //   return
    // }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Create FormData for file upload to match API expectations
      const formDataToSend = new FormData()
      
      // Video metadata as JSON string (as expected by API)
      const videoData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: [], // Could add tags input later
        privacy: 'public' as const
      }
      
      formDataToSend.append('videoData', JSON.stringify(videoData))
      formDataToSend.append('videoFile', formData.videoFile)
      if (formData.thumbnailFile) {
        formDataToSend.append('thumbnail', formData.thumbnailFile)
      }

      // Submit the video
      await apiClient.post('/videos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Redirect to success page
      router.push('/publish/video/success')
    } catch (error: unknown) {
      console.error('Error publishing video:', error)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      setErrorMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.title.trim() && 
                    formData.description.trim() && 
                    formData.videoFile
                    // thumbnailFile is now optional

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Publier une vidéo
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Partagez votre contenu vidéo avec la communauté
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Upload */}
              <div>
                <label htmlFor="video-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vidéo *
                </label>
                {!videoPreview ? (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-gray-700"
                  >
                    <span className="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-2 block">
                      video_library
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Cliquez pour sélectionner une vidéo
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      MP4, MOV, AVI (max 100MB)
                    </p>
                  </button>
                ) : (
                  <div className="relative">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-80 rounded-lg"
                      muted
                    >
                      <track kind="captions" src="" srcLang="fr" label="Français" />
                    </video>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, videoFile: null }))
                        setVideoPreview(null)
                        if (videoInputRef.current) {
                          videoInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                )}
                <input
                  id="video-upload"
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label htmlFor="thumbnail-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vignette (optionnel)
                </label>
                {!thumbnailPreview ? (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-gray-700"
                  >
                    <span className="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-2 block">
                      image
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Cliquez pour sélectionner une vignette
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG, PNG, GIF (max 10MB)
                    </p>
                  </button>
                ) : (
                  <div className="relative">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      width={400}
                      height={240}
                      className="w-full max-h-60 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, thumbnailFile: null }))
                        setThumbnailPreview(null)
                        if (thumbnailInputRef.current) {
                          thumbnailInputRef.current.value = ''
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <span className="material-icons text-sm">close</span>
                    </button>
                  </div>
                )}
                <input
                  id="thumbnail-upload"
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre *
                </label>
                <input
                  id="title-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Donnez un titre accrocheur à votre vidéo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.title.length}/100 caractères
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description-input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre vidéo..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 caractères
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                    isFormValid && !isLoading
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                      {' '}
                      Publication...
                    </span>
                  ) : (
                    'Publier la vidéo'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

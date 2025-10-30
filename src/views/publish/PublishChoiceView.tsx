'use client'

import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'

export default function PublishChoiceView() {
  const router = useRouter()

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section - Compact on mobile */}
          <div className="text-center mb-4 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-2 sm:mb-4">
              <span className="material-icons text-lg sm:text-2xl text-primary-600 dark:text-primary-400">
                add_circle
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Publier du contenu
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
              Choisissez le type de contenu que vous souhaitez partager
            </p>
          </div>

          {/* Choice Indicator - Smaller on mobile */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
              <span className="material-icons text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                touch_app
              </span>
              <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                2 options - Touchez pour choisir
              </span>
            </div>
          </div>

          {/* Options Grid - Optimized for mobile viewport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            {/* Regular Post - More Prominent */}
            <button
              onClick={() => router.push('/publish/post')}
              className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg sm:rounded-xl shadow-lg border-2 border-primary-200 dark:border-primary-700 p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group text-left focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            >
              {/* Popular Badge */}
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg">
                POPULAIRE
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-primary-500 dark:bg-primary-600 mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <span className="material-icons text-lg sm:text-2xl lg:text-3xl text-white">
                    edit
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Annonce Complète
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-4">
                  Annonce professionnelle avec tous les détails
                </p>
                
                {/* Compact feature list for mobile */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4">
                  <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 text-left">
                    <li className="flex items-center">
                      <span className="material-icons text-green-500 text-xs sm:text-sm mr-1 sm:mr-2">check_circle</span>
                      <span className="truncate">Services et tarifs détaillés</span>
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-green-500 text-xs sm:text-sm mr-1 sm:mr-2">check_circle</span>
                      <span className="truncate">Galerie photos et vidéos</span>
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-green-500 text-xs sm:text-sm mr-1 sm:mr-2">check_circle</span>
                      <span className="truncate">Localisation et disponibilités</span>
                    </li>
                  </ul>
                </div>
                <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                  💡 Recommandé
                </div>
              </div>
            </button>

            {/* Video Post - Simpler */}
            <button
              onClick={() => router.push('/publish/video')}
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group text-left focus:outline-none focus:ring-4 focus:ring-purple-500/30"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-purple-500 dark:bg-purple-600 mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <span className="material-icons text-lg sm:text-2xl lg:text-3xl text-white">
                    video_library
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Vidéo Rapide
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-2 sm:mb-4">
                  Publication vidéo simple et rapide
                </p>
                
                {/* Compact feature list for mobile */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mb-2 sm:mb-4">
                  <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 text-left">
                    <li className="flex items-center">
                      <span className="material-icons text-purple-500 text-xs sm:text-sm mr-1 sm:mr-2">play_circle</span>
                      <span className="truncate">Upload de fichier vidéo</span>
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-purple-500 text-xs sm:text-sm mr-1 sm:mr-2">image</span>
                      <span className="truncate">Vignette automatique</span>
                    </li>
                    <li className="flex items-center">
                      <span className="material-icons text-purple-500 text-xs sm:text-sm mr-1 sm:mr-2">flash_on</span>
                      <span className="truncate">Publication instantanée</span>
                    </li>
                  </ul>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  ⚡ En 30 secondes
                </div>
              </div>
            </button>
          </div>

          {/* Help Section - Compact on mobile */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <span className="material-icons text-blue-600 dark:text-blue-400 mt-0.5 text-sm sm:text-base">
                info
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-xs sm:text-sm">
                  Besoin d&apos;aide pour choisir ?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  <strong>Annonce :</strong> Services professionnels • <strong>Vidéo :</strong> Contenu rapide
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <span className="material-icons mr-1 sm:mr-2 text-sm">arrow_back</span>{' '}
              Retour
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

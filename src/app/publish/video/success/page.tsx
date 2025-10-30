'use client'

import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/layouts/DefaultLayout'

export default function PublishVideoSuccessPage() {
  const router = useRouter()

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <span className="material-icons text-2xl text-green-600 dark:text-green-400">
                check_circle
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Vidéo publiée avec succès !
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Votre vidéo a été publiée et est maintenant visible par la communauté.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => router.push('/videos')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voir les vidéos
            </button>
            <button
              onClick={() => router.push('/publish/video')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Publier une autre vidéo
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Voir mon profil
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

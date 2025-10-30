'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublishLayout from '@/components/layouts/PublishLayout';

export default function PublishSuccessPage() {
  const router = useRouter();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <PublishLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-md mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm text-center">
          <div className="mb-6 flex justify-center">
            <span className="material-icons text-6xl text-green-500">check_circle</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Publication réussie !</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre annonce a été publiée avec succès. Elle est maintenant visible pour tous les utilisateurs.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/"
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            
            <Link
              href="/profile/posts"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Voir mes annonces
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Vous serez redirigé vers la page d&apos;accueil dans quelques secondes...
        </div>
      </div>
    </PublishLayout>
  );
}

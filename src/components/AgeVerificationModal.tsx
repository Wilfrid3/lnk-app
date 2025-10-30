'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgeVerification } from '@/contexts/AgeVerificationContext';

export default function AgeVerificationModal() {
  const { isVerified, verify, decline, isExemptPath, tempExempt } = useAgeVerification();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  
  // Handler for viewing terms
  const handleViewTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to terms page
    router.push('/terms');
  };
  
  // Handler for viewing privacy policy
  const handleViewPrivacy = (e: React.MouseEvent) => {
    e.preventDefault()
    // Navigate to privacy page
    router.push('/privacy');
  };
  
  // Handle verification after accepting terms
  const handleVerify = () => {
    if (termsAccepted) {
      verify();
    }
  };
  
  // Don't show the modal if:
  // 1. User is already verified, or
  // 2. Current path is exempt, or 
  // 3. User is temporarily exempted to view terms/privacy
  if (isVerified || isExemptPath || tempExempt) {
    return null;
  }

  return (
    <div 
      id="age-verification-modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Black overlay with opacity */}
      <div className="absolute inset-0 bg-black opacity-80"></div>
      
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-auto shadow-2xl overflow-hidden relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Vérification de l&apos;âge requise
          </h2>
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ce site contient du contenu destiné aux adultes (18+). En continuant, vous confirmez que :
            </p>
            
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Vous avez 18 ans ou plus</li>
              <li>La visualisation de contenu pour adultes est légale dans votre région</li>
              <li>Vous ne partagerez pas ce contenu avec des mineurs</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <label className="flex items-start">
              <input 
                type="checkbox" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)} 
                className="mt-1 h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                J&apos;ai lu et j&apos;accepte les{' '}
                <button 
                  onClick={handleViewTerms}
                  className="text-primary-500 hover:underline"
                >
                  conditions générales
                </button>
                {' '}et la{' '}
                <button 
                  onClick={handleViewPrivacy}
                  className="text-primary-500 hover:underline"
                >
                  politique de confidentialité
                </button>
              </span>
            </label>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={decline}
              className="w-full py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg text-sm"
            >
              Quitter
            </button>
            
            <button 
              onClick={handleVerify}
              disabled={!termsAccepted}
              className={`w-full py-3 px-4 bg-primary-500 text-white font-medium rounded-lg text-sm ${
                termsAccepted 
                  ? 'hover:bg-primary-600' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              J&apos;ai 18+ ans - Continuer
            </button>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            En cliquant sur &quot;Continuer&quot;, vous confirmez avoir lu et accepté nos conditions d&apos;utilisation.
          </div>
        </div>
      </div>
    </div>
  );
}


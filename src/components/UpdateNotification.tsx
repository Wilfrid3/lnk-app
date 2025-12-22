'use client'

import React, { useState, useEffect } from 'react'
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'

export default function UpdateNotification() {
  const { updateAvailable, installing, skipWaiting } = useServiceWorkerUpdate()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setShow(true)
    }
  }, [updateAvailable])

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 z-50 animate-slideUp">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Mise à jour disponible</h3>
          <p className="text-xs text-blue-100">Une nouvelle version de l'application est disponible. Mettez à jour pour accéder aux dernières fonctionnalités.</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-blue-200 hover:text-white transition-colors mt-1"
        >
          ✕
        </button>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={skipWaiting}
          disabled={installing}
          className="flex-1 bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2"
        >
          {installing ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              Mise à jour...
            </>
          ) : (
            'Mettre à jour'
          )}
        </button>
        <button
          onClick={() => setShow(false)}
          disabled={installing}
          className="bg-blue-500 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-3 rounded text-sm transition-colors"
        >
          Plus tard
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  backUrl = '/'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with app logo and optional back button */}
      <header className="w-full p-4 flex items-center justify-center relative">
        {showBackButton && (
          <Link href={backUrl} className="absolute left-4">
            <span className="material-icons text-gray-600 dark:text-gray-400">arrow_back</span>
          </Link>
        )}

        <div className="flex items-center justify-center">
          <div className="text-xl sm:text-3xl font-semibold flex items-center text-gray-900 dark:text-white">
            <Image
              src="/images/Vector.png"
              alt="Le Yamo Logo"
              width={40}
              height={60}
              style={{ width: '160px', height: '40px' }}
              priority
              unoptimized
              quality={100}
              loading="eager"
              className="mr-2"
            />
          </div>
        </div>
      </header>

      {/* Main content with page title */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Main content */}
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} yamohub. Tous droits réservés.
      </footer>
    </div>
  )
}

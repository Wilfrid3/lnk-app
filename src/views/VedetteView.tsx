'use client'

import React from 'react'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import InfiniteFeaturedUsers from '@/components/InfiniteFeaturedUsers'
import Link from 'next/link'

export default function VedetteView() {
  return (
    <DefaultLayout>
      <main className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        {/* Page Header with back button */}
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-2">
            <span className="material-icons text-gray-500 dark:text-gray-400">
              arrow_back_ios
            </span>
          </Link>
          <h1 className="text-xl font-bold text-primary-500 flex items-center">
            <span className="material-icons mr-2">workspace_premium</span>{' '}
            En Vedette cette semaine
          </h1>
        </div>

        {/* Featured Users with Infinite Scroll */}
        <InfiniteFeaturedUsers />
      </main>
    </DefaultLayout>
  )
}


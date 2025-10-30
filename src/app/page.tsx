// src/app/page.tsx
import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/utils/seo'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = generateSEOMetadata({
  title: 'YamoZone - Plateforme de Services d\'Accompagnement Premium au Cameroun',
  description: 'Découvrez YamoZone, la plateforme leader de services d\'accompagnement premium au Cameroun. Profils vérifiés, services de qualité à Yaoundé, Douala et dans tout le pays.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamozone.com',
  type: 'website',
  image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamozone.com'}/images/full_logo.png`,
})

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageClient />
    </Suspense>
  )
}
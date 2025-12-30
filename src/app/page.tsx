// src/app/page.tsx
import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/utils/seo'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = generateSEOMetadata({
  title: 'YamoHub - Plateforme de Services d\'Accompagnement Premium au Cameroun',
  description: "SITE N°1 D'ESCORTES, DE RENCONTRES ET DE NDOLO EN LIGNE AU CAMEROUN. CRÉEZ VOTRE ANNONCE SIMPLEMENT. FILLES CHAUDES AU CAMEROUN. NYASS ET PIMENT",
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
  type: 'website',
  image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'}/images/logof.png`,
})

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageClient />
    </Suspense>
  )
}
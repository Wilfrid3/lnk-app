// src/app/HomePageClient.tsx
'use client'

import React, { useState, useEffect } from 'react'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import FeaturedUserCarousel from '@/components/FeaturedUserCarousel'
import LocationList from '@/components/LocationList'
import Link from 'next/link'
import InfinitePostList from '@/components/InfinitePostList'
import Head from 'next/head'

import type { User } from '@/services/usersService'
import type { Location } from '@/components/LocationList'
import { useHomePageData } from '@/hooks/useHomePageData'

// — static stubs for now; replace with your Zustand-powered hooks later
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const featuredUsers: User[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    id: '1',
    name: 'Ada Ricelle',
    avatar: '/images/avatars/avatar.png',
    age: 25,
    userType: 'escort',
    city: 'Yaoundé',
    bio: 'Professionnelle expérimentée, disponible pour accompagnement de qualité.',
    isPremium: true,
    isVip: true,
    isVerified: true,
    followersCount: 1589,
    views: 405000,
    offerings: ['companionship', 'massage'],
    appearance: 'Métis',
    clientType: 'homme',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    id: '2',
    name: 'Lea Marie',
    avatar: '/images/avatars/avatar.png',
    age: 23,
    userType: 'escort',
    city: 'Douala',
    bio: 'Jeune femme élégante et cultivée pour vos événements.',
    isPremium: false,
    isVip: false,
    isVerified: false,
    followersCount: 850,
    views: 210000,
    offerings: ['companionship'],
    appearance: 'Africaine',
    clientType: 'homme',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-05T12:15:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439013',
    id: '3',
    name: 'Maya Elodie',
    avatar: '/images/avatars/avatar.png',
    age: 28,
    userType: 'escort',
    city: 'Yaoundé',
    bio: 'Top profil avec une excellente réputation et de nombreux avis positifs.',
    isPremium: true,
    isVip: true,
    isVerified: true,
    followersCount: 2987,
    views: 502000,
    offerings: ['companionship', 'massage', 'escort'],
    appearance: 'Métis',
    clientType: 'tous',
    createdAt: '2023-12-10T14:00:00Z',
    updatedAt: '2024-01-25T09:45:00Z',
  },
]

const popularLocations: Location[] = [
  { name: 'Yaoundé', count: 8_569 },
  { name: 'Douala', count: 7_589 },
  { name: 'Bafoussam', count: 869 },
  { name: 'Kribi', count: 569 },
]

export default function HomePageClient() {
  const { locations: cachedLocations, shouldLoad, loadLocations } = useHomePageData()
  const [locations, setLocations] = useState<Location[]>(popularLocations)

  useEffect(() => {
    // Si les données sont déjà chargées en cache, utiliser le cache
    if (cachedLocations) {
      setLocations(cachedLocations)
      return
    }

    // Charger les données seulement si elles n'ont jamais été chargées
    if (shouldLoad) {
      loadLocations()
    }
  }, [shouldLoad, cachedLocations, loadLocations])
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'YamoHub - Accueil',
    description: 'Découvrez les meilleurs profils d\'accompagnement premium au Cameroun. Services vérifiés à Yaoundé, Douala et dans tout le pays.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Services d\'accompagnement premium',
      description: 'Liste des profils et services d\'accompagnement disponibles',
      numberOfItems: locations.reduce((sum, loc) => sum + loc.count, 0),
      itemListElement: locations.map((location, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Place',
          name: location.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: location.name,
            addressCountry: 'CM',
          },
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
      }],
    },
  }

   if (!cachedLocations && locations.length === popularLocations.length) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
        />
      </Head>
      <DefaultLayout>
        <main className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-8">
          {/* Featured this week */}
          <section className="mb-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="section-title">
                <span className="material-icons text-primary-500 mr-1 text-xl">workspace_premium</span>{' '}
                Profils en Vedette cette semaine
              </h2>
              <Link href="/vedette" className="section-link">
                Voir plus →
              </Link>
            </div>
            <FeaturedUserCarousel users={[]} />
          </section>

          {/* Popular Locations */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="section-title">
                <span className="material-icons text-primary-500 mr-1 text-xl">location_on</span>{' '}
                Lieux les plus sollicités
              </h2>
              <Link href="/search" className="section-link">
                Voir plus →
              </Link>
            </div>
            <LocationList items={locations} />
          </section>

          {/* We've removed the redundant "Annonces mises en avant" section */}
          
          {/* Recent Posts (Infinite Scroll) */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="section-title">
                <span className="material-icons text-primary-500 mr-1 text-xl">view_list</span>{' '}
                Annonces récentes
              </h2>
            </div>
            <InfinitePostList />
          </section>
        </main>
      </DefaultLayout>
    </>
  )
}

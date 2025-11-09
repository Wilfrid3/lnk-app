// src/utils/seo.ts
import type { Metadata } from 'next'

export interface SEOData {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  locale?: string
  siteName?: string
  noIndex?: boolean
  canonical?: string
}

export const DEFAULT_SEO: SEOData = {
  title: 'yamohub - Plateforme de Services d\'Accompagnement Premium au Cameroun',
  description: 'Découvrez yamohub, la plateforme leader de services d\'accompagnement premium au Cameroun. Profils vérifiés, services de qualité à Yaoundé, Douala et dans tout le pays.',
  image: '/images/full_logo.png',
  type: 'website',
  siteName: 'yamohub',
  locale: 'fr_FR',
}

export function generateMetadata(seoData: Partial<SEOData> = {}): Metadata {
  const data = { ...DEFAULT_SEO, ...seoData }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'
  
  // Generate dynamic Open Graph image if no specific image provided
  let ogImage = data.image
  if (!ogImage || ogImage === '/images/full_logo.png') {
    const ogParams = new URLSearchParams({
      title: data.title,
      description: data.description,
      type: data.type || 'default'
    })
    ogImage = `${baseUrl}/api/og?${ogParams.toString()}`
  }
  
  // For adult content sites, be careful with robots directives
  const robots = data.noIndex 
    ? 'noindex, nofollow, noarchive, nosnippet' 
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

  return {
    metadataBase: new URL(baseUrl),
    title: data.title,
    description: data.description,
    robots,
    
    // Canonical URL to prevent duplicate content
    alternates: data.canonical ? {
      canonical: data.canonical
    } : undefined,

    // Open Graph tags for social sharing
    openGraph: {
      title: data.title,
      description: data.description,
      type: (data.type || 'website') as 'website' | 'article' | 'profile',
      url: data.url,
      siteName: data.siteName,
      locale: data.locale,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: data.title,
      }],
      ...(data.type === 'article' && {
        publishedTime: data.publishedTime,
        modifiedTime: data.modifiedTime,
        authors: data.author ? [data.author] : undefined,
        tags: data.tags,
      }),
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: [ogImage],
      creator: data.author ? `@${data.author}` : undefined,
    },

    // Additional metadata
    keywords: data.tags?.join(', '),
    
    // Verification and other meta tags
    other: {
      'content-language': data.locale?.replace('_', '-') || 'fr-FR',
      'age-rating': 'adult',
      'rating': 'RTA-5042-1996-1400-1577-RTA',
      'content-rating': '18+',
      'audience': 'adult',
    },
  }
}

export interface StructuredDataInput {
  // Common fields
  id?: string
  name?: string
  title?: string
  description?: string
  bio?: string
  image?: string
  url?: string
  createdAt?: string
  updatedAt?: string
  
  // User/Person specific
  avatar?: string
  city?: string
  offerings?: string[]
  skills?: string[]
  followersCount?: number
  
  // Post/Article specific
  user?: {
    id: string
    name: string
  }
  
  // Organization specific
  contactPoint?: unknown
  address?: unknown
}

export function generateStructuredData(
  type: 'Organization' | 'WebSite' | 'Person' | 'Article', 
  data: StructuredDataInput
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'
  
  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'yamohub',
        description: 'Plateforme de services d\'accompagnement premium au Cameroun',
        url: baseUrl,
        logo: `${baseUrl}/images/full_logo.png`,
        sameAs: [
          // Add social media profiles if available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['French', 'English'],
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'CM',
          addressLocality: 'Yaoundé',
        },
      }

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'yamohub',
        description: 'Plateforme de services d\'accompagnement premium au Cameroun',
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    case 'Person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: data.name,
        description: data.bio || data.description,
        image: data.avatar || data.image,
        url: `${baseUrl}/users/${data.id}`,
        address: data.city ? {
          '@type': 'PostalAddress',
          addressLocality: data.city,
          addressCountry: 'CM',
        } : undefined,
        knowsAbout: data.offerings || data.skills,
        agentInteractionStatistic: data.followersCount ? {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/FollowAction',
          userInteractionCount: data.followersCount,
        } : undefined,
      }

    case 'Article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        url: `${baseUrl}/posts/${data.id}`,
        datePublished: data.createdAt,
        dateModified: data.updatedAt || data.createdAt,
        author: {
          '@type': 'Person',
          name: data.user?.name,
          url: `${baseUrl}/users/${data.user?.id}`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'yamohub',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/full_logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${baseUrl}/posts/${data.id}`,
        },
      }

    default:
      return null
  }
}

export const CAMEROON_CITIES = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Kribi', 'Bamenda', 'Garoua', 
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kumba', 'Limbe'
]

export function generateLocationKeywords(city?: string): string[] {
  const baseKeywords = [
    'Cameroun', 'escort', 'accompagnement', 'services premium',
    'professionnel', 'discret', 'qualité', 'vérifiée'
  ]
  
  if (city) {
    return [
      ...baseKeywords,
      city,
      `escort ${city}`,
      `accompagnement ${city}`,
      `services ${city}`,
    ]
  }
  
  return [
    ...baseKeywords,
    ...CAMEROON_CITIES.map(c => `escort ${c}`),
  ]
}

export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  
  // Find the last complete word within the limit
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

export function sanitizeForSEO(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

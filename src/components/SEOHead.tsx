// src/components/SEOHead.tsx
'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  article?: {
    author?: string
    publishedTime?: string
    modifiedTime?: string
    tags?: string[]
  }
  noIndex?: boolean
  canonicalUrl?: string
}

export default function SEOHead({
  title,
  description,
  image,
  imageAlt,
  article,
  noIndex = false,
  canonicalUrl,
}: SEOHeadProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yamozone.com'
  const fullUrl = canonicalUrl || `${baseUrl}${pathname}`
  
  // Default values
  const seoTitle = title || 'YamoZone - Services d\'Accompagnement Premium au Cameroun'
  const seoDescription = description || 'Découvrez YamoZone, la plateforme leader de services d\'accompagnement premium au Cameroun. Profils vérifiés, services de qualité.'
  const seoImage = image || `${baseUrl}/images/full_logo.png`
  const seoImageAlt = imageAlt || 'YamoZone - Plateforme Premium'

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:alt" content={seoImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="YamoZone" />
      <meta property="og:locale" content="fr_FR" />
      
      {/* Article specific tags */}
      {article && (
        <>
          {article.author && <meta property="article:author" content={article.author} />}
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:image:alt" content={seoImageAlt} />
      
      {/* Additional Meta Tags for Adult Content */}
      <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
      <meta name="content-rating" content="adult" />
      <meta name="audience" content="adult" />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="fr-FR" />
      
      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="YamoZone" />
      
      {/* Theme Colors */}
      <meta name="theme-color" content="#d97706" />
      <meta name="msapplication-TileColor" content="#d97706" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/favicon.png" />
      
      {/* Preload critical resources */}
      <link rel="preload" href="/images/full_logo.png" as="image" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Head>
  )
}

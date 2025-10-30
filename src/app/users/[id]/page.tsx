import { Suspense } from 'react'
import type { Metadata } from 'next'
import UserDetailView from '@/views/users/UserDetailView'
import { generateMetadata as generateSEOMetadata, generateLocationKeywords, sanitizeForSEO, truncateDescription } from '@/utils/seo'
import { getUserById } from '@/services/usersService'
import { getFullImageUrl } from '@/utils/imageUtils'

type UserParams = { id: string }

/**
 * Generate dynamic metadata for user detail pages using real user data
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<UserParams>
}): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yamozone.com'

  try {
    // Fetch the actual user data
    const user = await getUserById(id)
    
    // Sanitize and prepare SEO data
    const userName = sanitizeForSEO(user.name)
    const bio = user.bio ? truncateDescription(sanitizeForSEO(user.bio), 160) : ''
    const city = user.city || 'Cameroun'
    const offerings = user.offerings || []
    const age = user.age || null
    
    // Generate location and service-based keywords
    const locationKeywords = generateLocationKeywords(city)
    const serviceKeywords = offerings.map(service => `${service} ${city}`).slice(0, 5)
    const keywords = [
      ...locationKeywords,
      ...serviceKeywords,
      user.userType,
      'professionnel',
      'accompagnement',
      user.isVerified ? 'vérifiée' : '',
      user.isVip ? 'VIP' : '',
      user.isPremium ? 'premium' : ''
    ].filter(Boolean)

    // Get the best image for social sharing
    const featuredImage = user.avatar 
      ? getFullImageUrl(user.avatar)
      : user.coverImage 
        ? getFullImageUrl(user.coverImage)
        : `${baseUrl}/api/og?${new URLSearchParams({
            title: userName,
            description: `Profil ${user.isVerified ? 'vérifié' : 'professionnel'} à ${city}`,
            type: 'profile',
            city,
            verified: user.isVerified.toString(),
            vip: user.isVip.toString(),
            premium: user.isPremium.toString(),
            age: age?.toString() || '',
            offerings: offerings.slice(0, 3).join(',')
          }).toString()}`

    // Enhanced title for better SEO
    const seoTitle = `${userName}${age ? `, ${age} ans` : ''} | ${offerings.slice(0, 2).join(', ')} à ${city} | YamoZone`
    
    // Enhanced description with location and service info
    const seoDescription = bio || `Découvrez le profil ${user.isVerified ? 'vérifié' : 'professionnel'} de ${userName} à ${city}. ${offerings.slice(0, 3).join(', ')}. ${user.isVip ? 'Service VIP premium.' : 'Services de qualité.'} ${user.followersCount ? `${user.followersCount} abonnés.` : ''} Contactez maintenant sur YamoZone.`

    return generateSEOMetadata({
      title: seoTitle,
      description: seoDescription,
      url: `${baseUrl}/users/${id}`,
      type: 'profile',
      image: featuredImage,
      canonical: `${baseUrl}/users/${id}`,
      author: userName,
      publishedTime: user.createdAt,
      modifiedTime: user.updatedAt,
      tags: keywords
    })
  } catch (error) {
    console.error('Error generating metadata for user:', error)
    
    // Fallback metadata if user fetch fails
    return generateSEOMetadata({
      title: `Profil Premium | Services d'Accompagnement au Cameroun`,
      description: 'Découvrez ce profil vérifié de services d\'accompagnement premium au Cameroun. Professionnel, discret et de qualité.',
      url: `${baseUrl}/users/${id}`,
      type: 'profile',
      canonical: `${baseUrl}/users/${id}`,
      tags: [
        'escort', 'accompagnement', 'services premium', 'Cameroun',
        'professionnel', 'vérifiée', 'discret', 'qualité'
      ]
    })
  }
}

/**
 * The page component - server component for better SEO
 */
export default async function UserDetailPage({
  params,
}: {
  params: Promise<UserParams>
}) {
  const { id } = await params

  // We could also pass user data as props if needed for initial render
  // const user = await getUserById(id).catch(() => null)

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>}>
      <UserDetailView userId={id} />
    </Suspense>
  )
}

import { Suspense } from 'react'
import type { Metadata } from 'next'
import Loading from '@/components/Loading'
import PostDetailView from '@/views/posts/PostDetailView'
import { generateMetadata as generateSEOMetadata, generateLocationKeywords, sanitizeForSEO, truncateDescription } from '@/utils/seo'
import { getPostById } from '@/services/postsService'
import { getFullImageUrl } from '@/utils/imageUtils'

type PostParams = { id: string }

/**
 * Generate dynamic metadata for post detail pages using real post data
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<PostParams>
}): Promise<Metadata> {
  const { id } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yamozone.com'

  try {
    // Fetch the actual post data
    const post = await getPostById(id)
    
    // Sanitize and prepare SEO data
    const title = sanitizeForSEO(post.title)
    const description = truncateDescription(sanitizeForSEO(post.description), 160)
    const userName = sanitizeForSEO(post.user.name)
    const city = post.city
    const offerings = post.offerings
    
    // Generate location and service-based keywords
    const locationKeywords = generateLocationKeywords(city)
    const serviceKeywords = offerings.map(service => `${service} ${city}`).slice(0, 5)
    const keywords = [
      ...locationKeywords,
      ...serviceKeywords,
      'professionnel',
      'discret',
      'qualité',
      post.user.isVerified ? 'vérifiée' : '',
      post.isVip ? 'VIP' : '',
      'isPremium' in post && post.isPremium ? 'premium' : ''
    ].filter(Boolean)

    // Get the best image for social sharing
    const featuredImage = post.mainPhoto?.url 
      ? getFullImageUrl(post.mainPhoto.url)
      : post.additionalPhotos?.[0]?.url 
        ? getFullImageUrl(post.additionalPhotos[0].url)
        : `${baseUrl}/api/og?${new URLSearchParams({
            title,
            description: `${userName} à ${city}`,
            type: 'post',
            city,
            verified: post.user.isVerified.toString(),
            vip: post.isVip.toString(),
            premium: ('isPremium' in post && post.isPremium) ? 'true' : 'false',
            offerings: post.offerings.slice(0, 3).join(',')
          }).toString()}`

    // Enhanced title for better SEO
    const seoTitle = `${title} | ${userName} à ${city} | Services Premium Cameroun`
    
    // Enhanced description with location and service info
    const seoDescription = `${description} Profil ${post.user.isVerified ? 'vérifié' : 'professionnel'} à ${city}. ${offerings.slice(0, 3).join(', ')}. ${post.isVip ? 'Service VIP.' : ''} Contactez maintenant sur YamoZone.`

    return generateSEOMetadata({
      title: seoTitle,
      description: seoDescription,
      url: `${baseUrl}/posts/${id}`,
      type: 'article',
      image: featuredImage,
      canonical: `${baseUrl}/posts/${id}`,
      author: userName,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      tags: keywords
    })
  } catch (error) {
    console.error('Error generating metadata for post:', error)
    
    // Fallback metadata if post fetch fails
    return generateSEOMetadata({
      title: `Annonce Premium ${id} | Services d'Accompagnement au Cameroun`,
      description: 'Découvrez cette annonce premium de services d\'accompagnement vérifiés. Profil professionnel, services de qualité et discrétion garantie.',
      url: `${baseUrl}/posts/${id}`,
      type: 'article',
      canonical: `${baseUrl}/posts/${id}`,
      tags: [
        'escort', 'accompagnement', 'services premium', 'Cameroun',
        'professionnel', 'vérifiée', 'discret', 'qualité'
      ]
    })
  }
}

/**
 * The page component must also be async
 * so that `params` (a Promise) can be awaited.
 */
export default async function PostDetailPage({
  params,
}: {
  params: Promise<PostParams>
}) {
  const { id } = await params

  return (
    <Suspense fallback={<Loading />}>
      <PostDetailView postId={id} />
    </Suspense>
  )
}
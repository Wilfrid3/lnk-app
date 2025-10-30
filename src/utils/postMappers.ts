import { ApiPost } from '@/services/postsService';
import { Post as PostCardProps } from '@/components/PostCard';
import { getFullImageUrl } from '@/utils/imageUtils';
import { offeringOptions } from '@/utils/constants';

/**
 * Helper function to convert client type to its display value
 */
export const getClientTypeDisplay = (clientType: string): string => {
  switch (clientType.toLowerCase()) {
    case 'femme':
      return 'Femme';
    case 'homme':
      return 'Homme';
    case 'couple':
      return 'Couple';
    case 'tous':
      return 'Tous';
    default:
      return 'Personne';
  }
};

/**
 * Helper function to get offering labels from offering IDs
 */
export const getOfferingLabels = (offeringIds: string[]): string[] => {
  return offeringIds.map(id => {
    const offering = offeringOptions.find(opt => opt.id === id);
    return offering ? offering.label : id;
  });
};

/**
 * Converts API post data to PostCard component props
 */
export const mapApiPostToCardProps = (post: ApiPost): PostCardProps => {
  // Format the date for the "when" field - showing how long ago the post was created
  const postDate = new Date(post.createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  
  let when: string;
  if (diffInMinutes < 60) {
    when = `${diffInMinutes} min`;
  } else if (diffInMinutes < 24 * 60) {
    when = `${Math.floor(diffInMinutes / 60)} h`;
  } else {
    when = `${Math.floor(diffInMinutes / (60 * 24))} j`;
  }
  
  // Format the location string
  const location = post.neighborhood 
    ? `${post.city}, ${post.neighborhood}` 
    : post.city;
  
  // Extract the user's age from the appearance field if possible
  let age = 0;
  const ageRegex = /\b(\d+)\s*(an|ans)\b/i;
  const ageMatch = ageRegex.exec(post.appearance ?? '');
  if (ageMatch) {
    age = parseInt(ageMatch[1]);
  }  // We're now using the imported getFullImageUrl function from imageUtils.ts
  
  // Get offering labels using the helper function
  const offeringLabels = getOfferingLabels(post.offerings);
  
  // Return the mapped props
  // console.log('Mapped PostCard Props:', post.user.isPremium, post.user.isVip, post.user.name);
  return {
    id: post.id,
    name: post.user.name,
    avatar: getFullImageUrl(post.user.avatar) ?? `/images/avatars/default_${post.clientType}.png`, // Fallback avatar
    featureImage: getFullImageUrl(post.mainPhoto?.url),
    age: age || 25, // Default to 25 if no age found
    vip: post.user.isVip,
    when,
    location,
    description: post.description,
    lookingFor: `Délires: ${offeringLabels.join(', ')}`,
    verified: post.user.isVerified,
    isAd: post.isAd,
    premium: post.user.isPremium,
    views: post.views,
    likes: post.likesCount,
    hasVideos: post.videos && post.videos.length > 0,
    videoCount: post.videos?.length || 0,
    firstVideoUrl: post.videos && post.videos.length > 0 ? getFullImageUrl(post.videos[0].url) : undefined,
  };
};
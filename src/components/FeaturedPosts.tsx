import React, { useEffect, useState } from 'react';
import PostCard from '@/components/PostCard';
import { getFeaturedPosts, ApiPost } from '@/services/postsService';
import { mapApiPostToCardProps } from '@/utils/postMappers';

const FeaturedPosts = () => {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedPosts = async () => {
      try {
        const featuredPosts = await getFeaturedPosts();
        setPosts(featuredPosts);
      } catch (err) {
        console.error('Failed to load featured posts:', err);
        setError('Failed to load featured posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (posts?.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        Aucune annonce mise en avant pour le moment.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map(post => (
        <PostCard key={post.id} {...mapApiPostToCardProps(post)} />
      ))}
    </div>
  );
};

export default FeaturedPosts;
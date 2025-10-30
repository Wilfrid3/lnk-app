import { NextRequest, NextResponse } from 'next/server';

// Mock video data for testing
const mockVideos = [
  {
    id: '1',
    title: 'Sample Video 1',
    description: 'This is a sample video description for testing the video player.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/images/avatars/default_homme.png',
      isVerified: true
    },
    stats: {
      likes: 1234,
      comments: 56,
      shares: 23,
      views: 12345
    },
    isLiked: false,
    duration: 596,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Sample Video 2',
    description: 'Another sample video for testing the swipe functionality.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    user: {
      id: '2',
      name: 'Jane Smith',
      avatar: '/images/avatars/default_femme.png',
      isVerified: false
    },
    stats: {
      likes: 2345,
      comments: 78,
      shares: 45,
      views: 23456
    },
    isLiked: true,
    duration: 653,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Sample Video 3',
    description: 'A third sample video to test pagination and loading more content.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    user: {
      id: '3',
      name: 'Mike Johnson',
      avatar: '/images/avatars/default_homme.png',
      isVerified: true
    },
    stats: {
      likes: 3456,
      comments: 90,
      shares: 67,
      views: 34567
    },
    isLiked: false,
    duration: 15,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const excludes = searchParams.get('excludes'); // Video ID to exclude from results
    
    // Filter out excluded video if specified
    let filteredVideos = mockVideos;
    if (excludes) {
      filteredVideos = mockVideos.filter(video =>  !excludes.includes(video.id));
    }
    
    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      videos: paginatedVideos,
      hasMore: endIndex < filteredVideos.length,
      total: filteredVideos.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

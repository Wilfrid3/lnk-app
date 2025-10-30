import { NextRequest, NextResponse } from 'next/server';

// Video type definition
type VideoPrivacy = 'public' | 'private';

interface MockVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  duration: number;
  createdAt: string;
  privacy: VideoPrivacy;
}

// Mock video data
const mockVideos: MockVideo[] = [
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
    createdAt: new Date().toISOString(),
    privacy: 'public'
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
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    privacy: 'public'
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
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    privacy: 'public'
  },
  // Add the specific video ID from your test case
  {
    id: '68b4c9e4e397a1b375618ade',
    title: 'Shared Video Example',
    description: 'This is the video that was shared via link.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    user: {
      id: '4',
      name: 'Alice Cooper',
      avatar: '/images/avatars/default_femme.png',
      isVerified: true
    },
    stats: {
      likes: 5678,
      comments: 123,
      shares: 89,
      views: 56789
    },
    isLiked: false,
    duration: 888,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    privacy: 'public'
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params.id;
    
    // Find the video by ID
    const video = mockVideos.find(v => v.id === videoId);
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if video is private (in a real app, you'd check user permissions)
    if (video.privacy === 'private') {
      return NextResponse.json(
        { error: 'Video is private' },
        { status: 403 }
      );
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

// Handle video view tracking
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params.id;
    
    // In a real app, you'd track the view in your database
    console.log(`Video ${videoId} view tracked`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking video view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

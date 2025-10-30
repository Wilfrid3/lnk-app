import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const videoId = params.id;
    
    // In a real app, you'd increment the view count in your database
    console.log(`Video ${videoId} view tracked`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

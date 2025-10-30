import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    
    console.log('Removing push subscription:', endpoint)
    
    // Remove subscription from database
    // In production, you would remove from your database
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully' 
    })
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

interface StoredSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userId: string
  createdAt: string
}

// In a real app, you would store subscriptions in your database
const subscriptions: StoredSubscription[] = []

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    console.log('Received push subscription:', subscription)
    
    // Store subscription in database
    // In production, you would:
    // 1. Associate with user ID
    // 2. Store in database
    // 3. Handle duplicate subscriptions
    subscriptions.push({
      ...subscription,
      userId: 'current-user-id', // Get from auth context
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully' 
    })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

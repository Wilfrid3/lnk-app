import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Handler for GET requests to check verification status
export async function GET() {
  // Get the verification cookie
  const cookieStore = await cookies()
  const verified = cookieStore.get('age_verified')?.value === 'true';
  
  return new Response(
    JSON.stringify({ verified }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Handler for POST requests to set verification status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.verified === true) {
      // Set a secure HTTP-only cookie that expires in 30 days
      // await the cookie store, then set:
        const cookieStore = await cookies()
      cookieStore.set({
        name: 'age_verified',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error setting age verification:', error);
    
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handler for DELETE requests to clear verification status
export async function DELETE() {
  // Delete the verification cookie
  const cookieStore = await cookies()
  cookieStore.delete('age_verified');
  
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

import { NextRequest, NextResponse } from 'next/server'

// Cette version doit être mise à jour à chaque déploiement
// Vous pouvez utiliser un hash du commit ou un timestamp
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || new Date().toISOString()

export async function GET(request: NextRequest) {
  // Désactiver le cache pour cette réponse
  const response = NextResponse.json(
    {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, public, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  )

  return response
}

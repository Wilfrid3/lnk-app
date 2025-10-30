// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters from URL
    const title = searchParams.get('title') || 'YamoZone'
    const description = searchParams.get('description') || 'Services d\'accompagnement premium au Cameroun'
    const type = searchParams.get('type') || 'default' // default, profile, post, category
    const city = searchParams.get('city') || ''
    const verified = searchParams.get('verified') === 'true'
    const vip = searchParams.get('vip') === 'true'
    const premium = searchParams.get('premium') === 'true'
    const age = searchParams.get('age') || ''
    const offerings = searchParams.get('offerings')?.split(',').slice(0, 3) || []
    
    // Base styles
    const baseStyles = {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1f2937',
      backgroundImage: 'linear-gradient(to bottom right, #1f2937, #374151)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }

    return new ImageResponse(
      (
        <div style={baseStyles}>
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '60px',
              maxWidth: '1000px',
              position: 'relative',
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#d97706',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  fontSize: '40px',
                  fontWeight: 'bold',
                }}
              >
                Y
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#d97706',
                }}
              >
                YamoZone
              </div>
            </div>

            {/* Main Title */}
            <div
              style={{
                fontSize: type === 'profile' ? '48px' : '56px',
                fontWeight: 'bold',
                lineHeight: 1.2,
                marginBottom: '24px',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            {/* Age for profiles */}
            {type === 'profile' && age && (
              <div
                style={{
                  fontSize: '20px',
                  color: '#d1d5db',
                  marginBottom: '16px',
                }}
              >
                {age} ans
              </div>
            )}

            {/* Description */}
            <div
              style={{
                fontSize: '24px',
                color: '#d1d5db',
                lineHeight: 1.4,
                maxWidth: '800px',
                marginBottom: '40px',
              }}
            >
              {description}
            </div>

            {/* Type-specific elements */}
            {type === 'profile' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                {/* Verification badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    border: '2px solid #d97706',
                  }}
                >
                  {verified && <div style={{ fontSize: '18px', color: '#d97706' }}>✓ Vérifié</div>}
                  {vip && <div style={{ fontSize: '18px', color: '#d97706' }}>👑 VIP</div>}
                  {premium && <div style={{ fontSize: '18px', color: '#d97706' }}>⭐ Premium</div>}
                  {city && <div style={{ fontSize: '18px', color: '#d97706' }}>📍 {city}</div>}
                </div>
                
                {/* Offerings */}
                {offerings.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {offerings.map((offering, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'rgba(107, 114, 128, 0.3)',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '16px',
                          color: '#f3f4f6',
                        }}
                      >
                        {offering}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {type === 'post' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {city && (
                  <div
                    style={{
                      backgroundColor: 'rgba(217, 119, 6, 0.2)',
                      padding: '12px 24px',
                      borderRadius: '30px',
                      fontSize: '18px',
                      color: '#d97706',
                      border: '1px solid #d97706',
                    }}
                  >
                    📍 {city}
                  </div>
                )}
                
                {/* Post offerings */}
                {offerings.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {offerings.map((offering, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'rgba(107, 114, 128, 0.3)',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '16px',
                          color: '#f3f4f6',
                        }}
                      >
                        {offering}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {type === 'category' && (
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {['Yaoundé', 'Douala', 'Bafoussam', 'Kribi'].map((cityName) => (
                  <div
                    key={cityName}
                    style={{
                      backgroundColor: 'rgba(217, 119, 6, 0.2)',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '16px',
                      color: '#d97706',
                    }}
                  >
                    {cityName}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '30px',
              fontSize: '16px',
              color: '#9ca3af',
            }}
          >
            yamozone.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Unknown error'
    console.log(`Error generating OG image: ${error}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}

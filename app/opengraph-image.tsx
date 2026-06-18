import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const alt = 'Digitribe — Build and grow agency for DTC and SaaS founders'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0a0e27',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          <span style={{ color: '#f0ede5', fontSize: 48, fontWeight: 800, letterSpacing: '-1px' }}>
            Digi
          </span>
          <span style={{ color: '#ff5b3a', fontSize: 48, fontWeight: 800, letterSpacing: '-1px' }}>
            tribe
          </span>
          <span style={{ color: '#ff5b3a', fontSize: 48, fontWeight: 800 }}>.</span>
        </div>

        {/* Main headline */}
        <div
          style={{
            color: '#f0ede5',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: '-1.5px',
          }}
        >
          Build and grow agency for DTC and SaaS founders
        </div>

        {/* Sub line */}
        <div style={{ color: '#c4c1b8', fontSize: 24, marginTop: 32, fontWeight: 400 }}>
          Code, content, conversions — under one roof. · digitribe.world
        </div>

        {/* Decorative Pulse dots (3-circle brand mark) */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            position: 'absolute',
            bottom: 80,
            right: 80,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#ff5b3a',
            }}
          />
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#f0ede5',
            }}
          />
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#f0ede5',
            }}
          />
        </div>

        {/* Subtle top-right accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: '#ff5b3a',
            opacity: 0.04,
          }}
        />
      </div>
    ),
    { ...size }
  )
}

import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const alt = 'Free 30-minute audit — Digitribe'
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
        {/* Subtle top-right accent circle */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 360,
            height: 360,
            borderRadius: '50%',
            backgroundColor: '#ff5b3a',
            opacity: 0.04,
          }}
        />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <span style={{ color: '#f0ede5', fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Digi
          </span>
          <span style={{ color: '#ff5b3a', fontSize: 36, fontWeight: 800, letterSpacing: '-0.5px' }}>
            tribe.
          </span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            color: '#ff5b3a',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          FREE · 30 MINUTES · NO PITCH
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#f0ede5',
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 900,
            letterSpacing: '-1px',
          }}
        >
          We'll audit your site, your ads, and your funnel — free.
        </div>

        {/* Sub line */}
        <div
          style={{
            color: '#c4c1b8',
            fontSize: 22,
            marginTop: 24,
            maxWidth: 700,
          }}
        >
          Book in under 2 minutes. Walk away with a punch list either way.
        </div>

        {/* 3-dot brand mark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            position: 'absolute',
            bottom: 80,
            right: 80,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#ff5b3a',
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#f0ede5',
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#f0ede5',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}

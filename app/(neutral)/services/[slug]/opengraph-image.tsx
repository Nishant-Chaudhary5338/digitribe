import { ImageResponse } from '@vercel/og'
import { services } from '@/lib/data/services'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<ImageResponse> {
  const { slug } = await params
  const service = services.find((s) => s.slug === slug)

  const headline = service?.name ?? 'Our Services'
  const eyebrow = service ? service.category.toUpperCase() : 'SERVICES'
  const sub = service
    ? `From €${service.startingPriceEur.toLocaleString()} · ${service.timeline}`
    : 'Design, build, grow — under one roof.'

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
          <span
            style={{
              color: '#f0ede5',
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            Digi
          </span>
          <span
            style={{
              color: '#ff5b3a',
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            tribe.
          </span>
        </div>

        {/* Eyebrow - service category */}
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
          {eyebrow}
        </div>

        {/* Headline - service name */}
        <div
          style={{
            color: '#f0ede5',
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: '-1.5px',
          }}
        >
          {headline}
        </div>

        {/* Sub - pricing and timeline */}
        <div
          style={{
            color: '#c4c1b8',
            fontSize: 22,
            marginTop: 28,
            maxWidth: 700,
            fontWeight: 400,
          }}
        >
          {sub}
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

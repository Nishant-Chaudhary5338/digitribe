// Reusable layout for @vercel/og ImageResponse
// Import this component and inline its JSX inside an ImageResponse call.

interface OgImageLayoutProps {
  eyebrow?: string
  headline: string
  sub?: string
  showMark?: boolean
}

export function OgImageLayout({
  eyebrow,
  headline,
  sub,
  showMark = true,
}: OgImageLayoutProps) {
  return (
    <div
      style={{
        backgroundColor: '#0A0E27',
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
          backgroundColor: '#FF5B3A',
          opacity: 0.04,
        }}
      />

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
        <span style={{ color: '#F0EDE5', fontSize: 36, fontWeight: 800 }}>Digi</span>
        <span style={{ color: '#FF5B3A', fontSize: 36, fontWeight: 800 }}>tribe.</span>
      </div>

      {/* Eyebrow */}
      {eyebrow && (
        <div
          style={{
            color: '#FF5B3A',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {eyebrow}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          color: '#F0EDE5',
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: 900,
          letterSpacing: '-1px',
        }}
      >
        {headline}
      </div>

      {/* Sub line */}
      {sub && (
        <div
          style={{
            color: '#C4C1B8',
            fontSize: 22,
            marginTop: 24,
            maxWidth: 700,
          }}
        >
          {sub}
        </div>
      )}

      {/* 3-dot brand mark */}
      {showMark && (
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
              backgroundColor: '#FF5B3A',
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#F0EDE5',
              }}
            />
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#F0EDE5',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

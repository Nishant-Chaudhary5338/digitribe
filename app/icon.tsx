import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0E27',
          borderRadius: 8,
        }}
      >
        {/* 3-dot mark */}
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="8" fill="#FF5B3A" />
          <circle cx="8" cy="38" r="8" fill="#F0EDE5" />
          <circle cx="40" cy="38" r="8" fill="#F0EDE5" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

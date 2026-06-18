import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0E27',
          borderRadius: 40,
        }}
      >
        <svg width="110" height="110" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="8" fill="#FF5B3A" />
          <circle cx="8" cy="38" r="8" fill="#F0EDE5" />
          <circle cx="40" cy="38" r="8" fill="#F0EDE5" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

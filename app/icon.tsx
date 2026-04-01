import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FF6633',
          color: 'white',
          fontSize: 18,
          fontWeight: 900,
          borderRadius: '25%', // More rounded/playful Look
          fontFamily: 'sans-serif',
          letterSpacing: '-0.05em',
        }}
      >
        UV
      </div>
    ),
    { ...size }
  )
}

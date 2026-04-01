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
          fontSize: 16,
          fontWeight: 800,
          borderRadius: 8,
          fontFamily: 'sans-serif',
        }}
      >
        UV
      </div>
    ),
    { ...size }
  )
}

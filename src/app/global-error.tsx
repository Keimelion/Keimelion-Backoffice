'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error('Root layout error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ maxWidth: '32rem', color: '#666' }}>
          A critical error prevented the application from loading. Please refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}

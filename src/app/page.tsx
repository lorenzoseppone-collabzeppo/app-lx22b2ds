'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.replace('/registro.html')
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#f0eef5',
    }}>
      <p style={{ color: '#888', fontSize: '16px' }}>Reindirizzamento al Registro Presenze...</p>
    </div>
  )
}

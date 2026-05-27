'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    window.location.replace('/api/app');
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      background: '#1a1a2e',
      color: 'white',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.2)',
        borderTop: '4px solid #ffd700',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Caricamento Registro di Classe...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '6rem', 
        margin: '0',
        color: '#16a34a'
      }}>
        🌱
      </h1>
      <h2 style={{ 
        color: '#374151', 
        marginBottom: '1rem',
        fontSize: '2rem'
      }}>
        404 - Page Not Found
      </h2>
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '2rem',
        maxWidth: '500px',
        fontSize: '1.1rem'
      }}>
        Oops! The page you&apos;re looking for seems to have grown somewhere else in our garden.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link 
          href="/"
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
        >
          🏠 Go Home
        </Link>
        <Link 
          href="/dashboard"
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          📊 Dashboard
        </Link>
        <Link 
          href="/my-devices"
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
        >
          📱 My Devices
        </Link>
      </div>
    </div>
  );
}

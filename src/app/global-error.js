'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ 
            color: '#dc2626', 
            marginBottom: '1rem',
            fontSize: '2rem'
          }}>
            🚨 Application Error
          </h1>
          <p style={{ 
            color: '#7f1d1d', 
            marginBottom: '1.5rem',
            maxWidth: '500px',
            fontSize: '1.1rem'
          }}>
            A critical error occurred in the Smart Garden application. Please refresh the page or contact support.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
            >
              🔄 Restart Application
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
            >
              🔄 Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: '2rem', 
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '800px',
              border: '1px solid #d1d5db'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                🔍 Error Details (Development Only)
              </summary>
              <pre style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                overflow: 'auto',
                marginTop: '0.5rem',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #e5e7eb'
              }}>
                {error?.message || 'Unknown error'}
                {error?.stack && '\n\nStack trace:\n' + error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}

'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      margin: '2rem',
      border: '1px solid #fecaca'
    }}>
      <h2 style={{ 
        color: '#dc2626', 
        marginBottom: '1rem',
        fontSize: '1.5rem'
      }}>
        🚨 Something went wrong!
      </h2>
      <p style={{ 
        color: '#7f1d1d', 
        marginBottom: '1.5rem',
        maxWidth: '500px'
      }}>
        An unexpected error occurred while loading this page. Please try refreshing or contact support if the problem persists.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
        >
          🔄 Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          🏠 Go Home
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details style={{ 
          marginTop: '2rem', 
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '600px'
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: '500', color: '#374151' }}>
            🔍 Error Details (Development Only)
          </summary>
          <pre style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
            overflow: 'auto',
            marginTop: '0.5rem',
            whiteSpace: 'pre-wrap'
          }}>
            {error?.message || 'Unknown error'}
            {error?.stack && '\n\nStack trace:\n' + error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

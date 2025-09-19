export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="loading-spinner" />
      <h2 style={{ 
        color: '#16a34a', 
        marginBottom: '0.5rem',
        fontSize: '1.25rem'
      }}>
        🌱 Loading Smart Garden...
      </h2>
      <p style={{ 
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        Please wait while we load your garden data
      </p>
    </div>
  );
}

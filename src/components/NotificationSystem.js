'use client';

import { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const { type, message, duration = 5000 } = event.detail;
      addNotification(type, message, duration);
    };

    window.addEventListener('showToast', handleNotification);
    return () => window.removeEventListener('showToast', handleNotification);
  }, []);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, type, message, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="notification"
          style={{ 
            backgroundColor: getNotificationColor(notification.type),
            color: 'white',
            padding: '12px 16px',
            margin: '8px 0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative',
            zIndex: 1000
          }}
        >
          <span style={{ fontSize: '18px' }}>
            {getNotificationIcon(notification.type)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {notification.message}
            </div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.8,
              fontFamily: 'monospace'
            }}>
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '1'}
            onMouseOut={(e) => e.target.style.opacity = '0.7'}
          >
            ×
          </button>
        </div>
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          pointer-events: none;
        }
        
        .notification {
          pointer-events: auto;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification:hover {
          transform: translateX(-5px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (type, message, duration) => {
  const event = new CustomEvent('showNotification', {
    detail: { type, message, duration }
  });
  window.dispatchEvent(event);
};

export default NotificationSystem;

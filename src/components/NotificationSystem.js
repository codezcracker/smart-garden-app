'use client';

import { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

        useEffect(() => {
            console.log('🔔 NotificationSystem component mounted!');
            
            // Clear any existing notifications on mount
            setNotifications([]);
            
            // Listen for custom notification events
            const handleNotification = (event) => {
              console.log('🔔 NotificationSystem received event:', event.detail);
              const { type, message, duration = 5000 } = event.detail;
              addNotification(type, message, duration);
            };

            console.log('🔔 NotificationSystem setting up event listener');
            window.addEventListener('showToast', handleNotification);
            
            // Clear notifications on page visibility change (refresh)
            const handleVisibilityChange = () => {
              if (document.visibilityState === 'visible') {
                console.log('🔔 Page became visible - clearing notifications');
                setNotifications([]);
              }
            };
            
            // Clear notifications before page unload (refresh/close)
            const handleBeforeUnload = () => {
              console.log('🔔 Page unloading - clearing notifications');
              setNotifications([]);
            };
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('beforeunload', handleBeforeUnload);
            
            return () => {
              console.log('🔔 NotificationSystem cleaning up event listener');
              window.removeEventListener('showToast', handleNotification);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
              window.removeEventListener('beforeunload', handleBeforeUnload);
            };
          }, []);

  const addNotification = (type, message, duration = 5000) => {
    console.log('🔔 Adding notification:', { type, message, duration });
    const id = Date.now() + Math.random();
    const notification = { id, type, message, timestamp: new Date() };
    
    setNotifications(prev => {
      const newNotifications = [...prev, notification];
      console.log('🔔 Notification state updated:', newNotifications);
      return newNotifications;
    });

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
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    }}>
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#4caf50',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 10000,
          pointerEvents: 'none'
        }}>
          🔔 {notifications.length} notification(s)
        </div>
      )}
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            backgroundColor: getNotificationColor(notification.type),
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'slideInRight 0.3s ease-out',
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>
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
              transition: 'opacity 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.target.style.opacity = '1'}
            onMouseOut={(e) => e.target.style.opacity = '0.7'}
          >
            ×
          </button>
        </div>
      ))}
      
      <style jsx>{`
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

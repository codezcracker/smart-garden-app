'use client';

import { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    console.log('🔔 NotificationSystem component mounted!');
    
    // Listen for custom notification events
    const handleNotification = (event) => {
      console.log('🔔 NotificationSystem received event:', event.detail);
      const { type, message, duration = 5000 } = event.detail;
      addNotification(type, message, duration);
    };

    console.log('🔔 NotificationSystem setting up event listener');
    window.addEventListener('showToast', handleNotification);
    return () => {
      console.log('🔔 NotificationSystem cleaning up event listener');
      window.removeEventListener('showToast', handleNotification);
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
    <div className="notification-container">
      {notifications.length > 0 && (
        <div className="notification-counter">
          🔔 {notifications.length} notification(s)
        </div>
      )}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="notification"
          style={{ backgroundColor: getNotificationColor(notification.type) }}
        >
          <span className="notification-icon">
            {getNotificationIcon(notification.type)}
          </span>
          <div className="notification-content">
            <div className="notification-message">
              {notification.message}
            </div>
            <div className="notification-time">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
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
          z-index: 9999;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        
        .notification-counter {
          position: fixed;
          top: 10px;
          right: 10px;
          background: #4caf50;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10000;
          pointer-events: none;
        }
        
        .notification {
          pointer-events: auto;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 500px;
          animation: slideInRight 0.3s ease-out;
          position: relative;
        }
        
        .notification-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-message {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .notification-time {
          font-size: 12px;
          opacity: 0.8;
          font-family: monospace;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }
        
        .notification-close:hover {
          opacity: 1;
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

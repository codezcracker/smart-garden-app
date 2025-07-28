'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from './NotificationProvider';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
  };

  const getNotificationColorClass = (type) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        {/* Bell Icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="m13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="notification-dropdown-content">
          {/* Header */}
          <div className="dropdown-header">
            <h3 className="dropdown-title">Notifications</h3>
            {notifications.length > 0 && (
              <div className="dropdown-actions">
                <button
                  onClick={markAllAsRead}
                  className="dropdown-action-btn"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="dropdown-action-btn"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="dropdown-content">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <div className="empty-title">No notifications</div>
                <div className="empty-subtitle">You&apos;re all caught up!</div>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{notification.title}</h4>
                        <span className="notification-time">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className={`notification-type ${notification.type}`}>
                        {notification.type}
                      </div>
                    </div>
                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Dropdown Styles */}
      <style jsx>{`
        .notification-dropdown {
          position: relative;
        }

        .notification-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: none;
          color: #5f6368;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .notification-button:hover {
          background-color: #f1f3f4;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ea4335;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .notification-dropdown-content {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 360px;
          max-height: 480px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
          border: 1px solid #e8eaed;
          overflow: hidden;
          z-index: 200;
        }

        .dropdown-header {
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid #e8eaed;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dropdown-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #202124;
        }

        .dropdown-actions {
          display: flex;
          gap: 0.5rem;
        }

        .dropdown-action-btn {
          padding: 0.25rem 0.75rem;
          background: none;
          border: 1px solid #dadce0;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #5f6368;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dropdown-action-btn:hover {
          background: #f8f9fa;
          border-color: #5f6368;
        }

        .dropdown-content {
          max-height: 24rem;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          color: #202124;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .empty-subtitle {
          color: #5f6368;
          font-size: 0.875rem;
        }

        .notification-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f3f4;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s ease;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: #f8f9ff;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notification-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #202124;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #5f6368;
        }

        .notification-message {
          font-size: 0.875rem;
          color: #5f6368;
          line-height: 1.4;
          margin: 0;
        }

        .notification-type {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notification-type.success { color: #137333; }
        .notification-type.warning { color: #f29900; }
        .notification-type.error { color: #d93025; }
        .notification-type.info { color: #1a73e8; }

        .unread-indicator {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #1a73e8;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
} 
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

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || '📢';
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <div className="notification-icon-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="bell-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="m13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="notification-dropdown-content">
          <div className="dropdown-header">
            <h3 className="dropdown-title">Notifications</h3>
            {notifications.length > 0 && (
              <div className="dropdown-actions">
                <button onClick={markAllAsRead} className="dropdown-action-btn">
                  Mark all read
                </button>
                <button onClick={clearAll} className="dropdown-action-btn clear-btn">
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="dropdown-content">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <div className="empty-title">No notifications</div>
                <div className="empty-subtitle">You&apos;re all caught up!</div>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4 className="notification-title">{notification.title}</h4>
                        <span className="notification-time">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))}
                {notifications.length > 5 && (
                  <div className="view-all">
                    <button className="view-all-btn">
                      View all {notifications.length} notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-dropdown {
          position: relative;
        }

        .notification-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: none;
          color: #5f6368;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s ease;
        }

        .notification-button:hover {
          background-color: #f1f3f4;
          transform: scale(1.05);
        }

        .notification-icon-container {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff4444;
          color: white;
          border-radius: 8px;
          padding: 1px 4px;
          font-size: 0.65rem;
          font-weight: 600;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(255, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
        }

        .notification-dropdown-content {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          max-height: 420px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e8eaed;
          overflow: hidden;
          z-index: 200;
          animation: dropdownAppear 0.2s ease-out;
        }

        @keyframes dropdownAppear {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f1f3f4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbfc;
        }

        .dropdown-title {
          font-size: 1rem;
          font-weight: 600;
          color: #202124;
          margin: 0;
        }

        .dropdown-actions {
          display: flex;
          gap: 6px;
        }

        .dropdown-action-btn {
          padding: 4px 8px;
          background: none;
          border: 1px solid #dadce0;
          border-radius: 16px;
          font-size: 0.7rem;
          color: #5f6368;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .dropdown-action-btn:hover {
          background: #f8f9fa;
          border-color: #5f6368;
        }

        .clear-btn:hover {
          background: #fef7f7;
          border-color: #d93025;
          color: #d93025;
        }

        .dropdown-content {
          max-height: 300px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
        }

        .empty-icon {
          font-size: 2rem;
          margin-bottom: 12px;
          opacity: 0.6;
        }

        .empty-title {
          color: #202124;
          font-weight: 500;
          margin-bottom: 4px;
          font-size: 0.9rem;
        }

        .empty-subtitle {
          color: #5f6368;
          font-size: 0.8rem;
        }

        .notifications-list {
          padding: 4px 0;
        }

        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f8f9fa;
          cursor: pointer;
          position: relative;
          transition: background-color 0.2s ease;
          display: flex;
          gap: 12px;
          align-items: flex-start;
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

        .notification-icon {
          font-size: 1.2rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .notification-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #202124;
          margin: 0;
          line-height: 1.3;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #5f6368;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .notification-message {
          font-size: 0.75rem;
          color: #5f6368;
          line-height: 1.3;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .unread-dot {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: #1a73e8;
          border-radius: 50%;
        }

        .view-all {
          padding: 8px 16px;
          border-top: 1px solid #f1f3f4;
          background: #fafbfc;
        }

        .view-all-btn {
          width: 100%;
          padding: 8px;
          background: none;
          border: none;
          color: #1a73e8;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .view-all-btn:hover {
          background: #f8f9fa;
        }

        /* Custom scrollbar */
        .dropdown-content::-webkit-scrollbar {
          width: 4px;
        }

        .dropdown-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dropdown-content::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 2px;
        }

        .dropdown-content::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }
      `}</style>
    </div>
  );
} 
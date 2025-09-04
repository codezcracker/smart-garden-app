'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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

  const profileMenuItems = [
    {
      label: 'My Profile',
      icon: '👤',
      action: () => console.log('Navigate to profile'),
      shortcut: 'Ctrl+P'
    },
    {
      label: 'Account Settings',
      icon: '⚙️',
      action: () => console.log('Navigate to settings'),
      shortcut: 'Ctrl+,'
    },
    {
      label: 'My Garden',
      icon: '🌱',
      action: () => console.log('Navigate to my garden'),
      shortcut: 'Ctrl+G'
    },
    {
      label: 'Preferences',
      icon: '🎛️',
      action: () => console.log('Navigate to preferences')
    },
    {
      label: 'Theme',
      icon: theme === 'light' ? '🌙' : '☀️',
      action: toggleTheme,
      isThemeToggle: true
    },
    { type: 'divider' },
    {
      label: 'Help & Support',
      icon: '❓',
      action: () => console.log('Navigate to help')
    },
    {
      label: 'Keyboard Shortcuts',
      icon: '⌨️',
      action: () => console.log('Show shortcuts'),
      shortcut: 'Ctrl+/'
    },
    {
      label: 'Send Feedback',
      icon: '📝',
      action: () => console.log('Send feedback')
    },
    { type: 'divider' },
    {
      label: 'Sign Out',
      icon: '🚪',
      action: () => console.log('Sign out'),
      danger: true
    }
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    }
    if (!item.isThemeToggle) {
      setIsOpen(false);
    }
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
        title="Profile & Settings"
      >
        <div className="profile-avatar">
          <div className="avatar-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="status-indicator"></div>
        </div>
      </button>

      {isOpen && (
        <div className="profile-dropdown-content">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="user-details">
                <div className="user-name">Garden Master</div>
                <div className="user-email">gardener@smartgarden.com</div>
              </div>
            </div>
          </div>

          <div className="dropdown-content">
            {profileMenuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="menu-divider"></div>;
              }

              return (
                <button
                  key={index}
                  className={`menu-item ${item.danger ? 'danger' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="menu-item-left">
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <span className="menu-shortcut">{item.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .profile-dropdown {
          position: relative;
        }

        .profile-button {
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
          padding: 0;
        }

        .profile-button:hover {
          background-color: #f1f3f4;
          transform: scale(1.05);
        }

        .profile-avatar {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e8eaed;
          transition: all 0.2s ease;
        }

        .profile-button:hover .profile-avatar {
          border-color: #5f6368;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .avatar-inner {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          background: #34a853;
          border: 2px solid white;
          border-radius: 50%;
        }

        .profile-dropdown-content {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          max-height: 450px;
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
          padding: 16px;
          border-bottom: 1px solid #f1f3f4;
          background: #fafbfc;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid #e8eaed;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #202124;
          margin-bottom: 2px;
        }

        .user-email {
          font-size: 0.75rem;
          color: #5f6368;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-content {
          padding: 8px 0;
          max-height: 350px;
          overflow-y: auto;
        }

        .menu-item {
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s ease;
          font-size: 0.8rem;
          color: #202124;
        }

        .menu-item:hover {
          background: #f8f9fa;
        }

        .menu-item.danger {
          color: #d93025;
        }

        .menu-item.danger:hover {
          background: #fef7f7;
        }

        .menu-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .menu-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .menu-label {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .menu-shortcut {
          font-size: 0.7rem;
          color: #5f6368;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e8eaed;
          font-family: monospace;
          flex-shrink: 0;
        }

        .menu-divider {
          height: 1px;
          background: #f1f3f4;
          margin: 8px 0;
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
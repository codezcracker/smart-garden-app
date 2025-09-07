'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function ProfileDropdown({ user, isLoggedIn, theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/auth/login';
  };

  const getProfileMenuItems = () => {
    if (isLoggedIn && user) {
      return [
        {
          label: 'My Profile',
          icon: '👤',
          action: () => console.log('Navigate to profile'),
          shortcut: 'Ctrl+P'
        },
        {
          label: 'Account Settings',
          icon: '⚙️',
          action: () => console.log('Navigate to account settings'),
          shortcut: 'Ctrl+,'
        },
        { type: 'divider' },
        {
          label: 'Sign Out',
          icon: '🚪',
          action: handleLogout,
          danger: true
        }
      ];
    } else {
      return [
        {
          label: 'Sign In',
          icon: '🔐',
          action: () => window.location.href = '/auth/login'
        },
        {
          label: 'Sign Up',
          icon: '📝',
          action: () => window.location.href = '/auth/register'
        },
        { type: 'divider' },
        {
          label: 'Help & Support',
          icon: '❓',
          action: () => console.log('Navigate to help')
        }
      ];
    }
  };

  const profileMenuItems = getProfileMenuItems();

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
      {isLoggedIn ? (
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
      ) : (
        <button
          className="user-account-button"
          onClick={() => setIsOpen(!isOpen)}
          title="User Account"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>User Account</span>
        </button>
      )}

      {isOpen && (
        <div className="profile-dropdown-content">
          {isLoggedIn && user && (
            <div className="dropdown-header">
              <div className="user-info">
                <div className="user-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="user-details">
                  <div className="user-name">{user.firstName} {user.lastName}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
            </div>
          )}

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

        .user-account-button {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 3px 12px rgba(76, 175, 80, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .user-account-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .user-account-button:hover::before {
          left: 100%;
        }

        .user-account-button:hover {
          background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .user-account-button:active {
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba(76, 175, 80, 0.3);
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
          background: ${isLoggedIn 
            ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' 
            : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
          };
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
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .user-account-button {
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
            border-radius: 10px;
          }
          
          .user-account-button span {
            display: none;
          }
          
          .user-account-button svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
} 
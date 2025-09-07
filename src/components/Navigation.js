'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { useState, useEffect } from 'react';

export default function Navigation({ children = null }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.nav-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  // Complete app definitions - IoT Smart Garden System
  const apps = [
    // Row 1 - Core Features
    {
      name: 'Home',
      href: '/',
      icon: '🏠',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      description: 'Smart Garden Demo'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📱',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      description: 'IoT Dashboard'
    },
    {
      name: 'Login',
      href: '/auth/login',
      icon: '🔐',
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      description: 'User Login'
    },
    {
      name: 'Register',
      href: '/auth/register',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      description: 'Sign Up'
    },
    // Row 2 - Plant Features
    {
      name: 'Plants',
      href: '/plants',
      icon: '🌱',
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      description: 'Plant Database'
    },
    {
      name: 'Compare',
      href: '/plants/comparison',
      icon: '⚖️',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      description: 'Plant Comparison'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
      description: 'Data Analytics'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #795548 0%, #5d4037 100%)',
      description: 'System Settings'
    }
  ];

  const getCurrentPageTitle = () => {
    const currentApp = apps.find(app => app.href === pathname);
    return currentApp ? currentApp.name : 'Smart Garden';
  };

  return (
    <div className="navigation-wrapper">
      <header className="modern-header">
        <div className="header-left">
          <Link href="/" className="app-logo">
            <div className="logo-icon">🌱</div>
            <span className="logo-text">Smart Garden</span>
          </Link>
        </div>
        
        <div className="header-right">
          <NotificationDropdown />
          <ProfileDropdown />
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button 
            className="menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Open menu"
          >
            <div className="menu-icon">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </button>
        </div>
      </header>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <div className="nav-menu-overlay">
          <div className="nav-menu-container">
            <div className="nav-menu-header">
              <h2>Smart Garden</h2>
              <button 
                className="close-menu"
                onClick={() => setIsMenuOpen(false)}
                title="Close menu"
              >
                ✕
              </button>
            </div>
            
            <div className="nav-menu-content">
              <div className="nav-apps-grid">
                {apps.map((app, index) => (
                  <Link
                    key={index}
                    href={app.href}
                    className="nav-app-card"
                    style={{ '--gradient': app.gradient }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="app-icon">{app.icon}</div>
                    <div className="app-info">
                      <h3 className="app-name">{app.name}</h3>
                      <p className="app-description">{app.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

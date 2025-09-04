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

  // Minimal app definitions - only core features
  const apps = [
    // Row 1 - Core Features
    {
      name: 'Dashboard',
      href: '/',
      icon: '🏠',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Home'
    },
    {
      name: 'Plants',
      href: '/plants',
      icon: '🌱',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Browse Plants'
    },
    {
      name: 'Compare',
      href: '/plants/comparison',
      icon: '⚖️',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Compare Plants'
    },
    // Row 2 - Analytics
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Data Insights'
    }
  ];

  const getCurrentPageTitle = () => {
    const currentApp = apps.find(app => app.href === pathname);
    return currentApp ? currentApp.name : 'Smart Garden';
  };

  return (
    <div className="navigation-wrapper">
      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-left">
          <Link href="/" className="app-logo">
            <div className="logo-icon">🌱</div>
            <span className="logo-text">Smart Garden</span>
          </Link>
        </div>
        
        <div className="header-center">
          <div className="page-info">
            <h1 className="page-title">{getCurrentPageTitle()}</h1>
            <span className="page-subtitle">Smart Garden Management</span>
          </div>
        </div>
        
        <div className="header-right">
          <NotificationDropdown />
          <ProfileDropdown />
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
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

      {/* iPad-Style Menu Overlay with Glassmorphism */}
      {isMenuOpen && (
        <div className="menu-overlay">
          <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>
          <div className="nav-menu-container">
            <div className="menu-content">
              <div className="menu-header">
                <h2 className="menu-title">Apps</h2>
                <button 
                  className="close-menu-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="apps-grid">
                {apps.map((app, index) => (
                  <Link
                    key={app.href}
                    href={app.href}
                    className={`app-icon ${pathname === app.href ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ '--delay': `${index * 0.03}s` }}
                  >
                    <div 
                      className="app-icon-bg"
                      style={{ background: app.gradient }}
                    >
                      <span className="app-emoji">{app.icon}</span>
                    </div>
                    <span className="app-name">{app.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

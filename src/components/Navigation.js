'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import NotificationDropdown from './NotificationDropdown';
import { useState } from 'react';

export default function Navigation({ children = null }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="navigation-wrapper">
      <header className="top-navigation">
        {/* Left - Logo and Navigation Tabs */}
        <div className="nav-left">
          <div className="logo-container">
            <div className="logo">P</div>
          </div>
          
          <nav className="nav-tabs">
            <Link 
              href="/analytics" 
              className={`nav-tab ${pathname === '/analytics' ? 'active' : ''}`}
            >
              Analytics
            </Link>
            <Link 
              href="/" 
              className={`nav-tab ${pathname === '/' ? 'active' : ''}`}
            >
              <span className="status-dot"></span>
              My Plant
            </Link>
          </nav>
        </div>

        {/* Center - Search Bar */}
        <div className="nav-center">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
            <button className="search-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Right - Notifications and User */}
        <div className="nav-right">
          <NotificationDropdown />
          <div className="user-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%234285f4'/%3E%3Cpath d='M20 12c0-2.2-1.8-4-4-4s-4 1.8-4 4c0 2.2 1.8 4 4 4s4-1.8 4-4zM8 24c0-4.4 3.6-8 8-8s8 3.6 8 8' fill='white'/%3E%3C/svg%3E" alt="User Avatar" />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
} 
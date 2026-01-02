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
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

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

  // Dynamic app definitions based on login status
  const getApps = () => {
    if (isLoggedIn) {
      // Base apps for all logged-in users
      const baseApps = [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: '📊',
          gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          description: 'IoT Dashboard'
        },
        {
          name: 'Garden Config',
          href: '/garden-config',
          icon: '⚙️',
          gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          description: 'Configure Your Gardens'
        },
        {
          name: 'My Devices',
          href: '/my-devices',
          icon: '💻',
          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          description: 'Manage Your IoT Devices'
        },
        {
          name: 'Device Plan',
          href: '/device-plan',
          icon: '⚡',
          gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          description: 'Device Design'
        },
        {
          name: 'Garden Planner',
          href: '/garden-planner',
          icon: '🌿',
          gradient: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
          description: 'Plan Sensor Placement'
        },
        {
          name: 'Garden Designer',
          href: '/garden-designer',
          icon: '🎨',
          gradient: 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)',
          description: 'Interactive Design Tool'
        },
        {
          name: 'Sensor Dashboard',
          href: '/sensor-dashboard',
          icon: '📈',
          gradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
          description: 'Animated Garden Dashboard'
        },
        {
          name: 'Interactive Garden',
          href: '/interactive-garden',
          icon: '🌳',
          gradient: 'linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%)',
          description: 'Manage Your Virtual Garden'
        },
        {
          name: 'Automation',
          href: '/automation',
          icon: '🤖',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          description: 'Automation Settings'
        },
      ];

      // Add role-specific apps
      if (user && user.role === 'super_admin') {
        baseApps.push(
          {
            name: 'Admin Panel',
            href: '/admin',
                icon: '🔐',
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            description: 'Super Admin Panel'
          },
          {
            name: 'User Management',
            href: '/admin/users',
                icon: '👤',
            gradient: 'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)',
            description: 'Manage All Users'
          },
          {
            name: 'Manager Control',
            href: '/admin/managers',
                icon: '👔',
            gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
            description: 'Manage Managers'
          },
              {
                name: 'Firmware Update',
                href: '/firmware-update',
                icon: '📦',
                gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                description: 'OTA Firmware Updates'
          },
        );
      } else if (user && user.role === 'manager') {
        baseApps.push(
          {
            name: 'Manager Panel',
            href: '/manager',
                icon: '🎯',
            gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
            description: 'Manager Dashboard'
          },
          {
            name: 'My Clients',
            href: '/manager/clients',
                icon: '👨‍👩‍👧‍👦',
            gradient: 'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)',
            description: 'Manage Assigned Clients'
          },
              {
                name: 'Firmware Update',
                href: '/firmware-update',
                icon: '📦',
                gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                description: 'OTA Firmware Updates'
          },
        );
      }

      return baseApps;
    } else {
      // Apps for non-logged-in users - public features
      return [
        {
          name: 'Home',
          href: '/',
          icon: '🏠',
          gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          description: 'Smart Garden Demo'
        },
        {
          name: 'Plants',
          href: '/plants',
          icon: '🌺',
          gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
          description: 'Plant Database'
        },
        {
          name: 'Sensor Dashboard',
          href: '/sensor-dashboard',
          icon: '📈',
          gradient: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
          description: 'Animated Garden Dashboard'
        },
        {
          name: 'Interactive Garden',
          href: '/interactive-garden',
          icon: '🌳',
          gradient: 'linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%)',
          description: 'Manage Your Virtual Garden'
        }
      ];
    }
  };

  const apps = getApps();

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
          
          {/* Main navigation links for non-authenticated users only */}
          {!isLoggedIn && (
            <nav className="main-nav">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
              <Link href="/plants" className={`nav-link ${pathname === '/plants' ? 'active' : ''}`}>
                Plants
              </Link>
              <Link href="/plants/comparison" className={`nav-link ${pathname === '/plants/comparison' ? 'active' : ''}`}>
                Compare
              </Link>
            </nav>
          )}
        </div>
        
        <div className="header-right">
          {isLoggedIn && <NotificationDropdown />}
          
          {/* Theme toggle button - only for logged-in users */}
          {isLoggedIn && (
            <button 
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          )}
          
          <ProfileDropdown user={user} isLoggedIn={isLoggedIn} theme={theme} toggleTheme={toggleTheme} />
          
          {isLoggedIn && (
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
          )}
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import NotificationDropdown from './NotificationDropdown';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Plants', href: '/plants', icon: '🌱' },
    { name: 'World Map', href: '/plants/world-map', icon: '🌍' },
    { name: 'Fast Growing', href: '/plants/fast-growing', icon: '⚡' },
    { name: 'Hierarchy', href: '/hierarchy', icon: '🌳' },
    { name: 'Sensors', href: '/sensors', icon: '📡' },
    { name: 'Automation', href: '/automation', icon: '⚙️' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Weather', href: '/weather', icon: '🌤️' },
  ];

  return (
    <header className="bg-gray-800 dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-green-400">Smart Garden</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors no-underline px-3 py-2 rounded-md ${
                  pathname === item.href
                    ? 'text-green-400 bg-gray-700 dark:bg-gray-700'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden xl:inline">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <button 
              onClick={toggleTheme}
              className="text-yellow-400 flex items-center space-x-1 hover:text-yellow-300 transition-colors p-2 rounded-md hover:bg-gray-700"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="text-sm hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white p-2 rounded-md hover:bg-gray-700"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 text-base font-medium transition-colors no-underline px-3 py-2 rounded-md ${
                    pathname === item.href
                      ? 'text-green-400 bg-gray-700 dark:bg-gray-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                  }`}
                  style={{ textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 
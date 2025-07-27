'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import NotificationDropdown from './NotificationDropdown';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
    <header className="bg-gray-800 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-green-400">Smart Garden</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors no-underline ${
                  pathname === item.href
                    ? 'text-green-400'
                    : 'text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white'
                }`}
                style={{ textDecoration: 'none' }}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <button 
              onClick={toggleTheme}
              className="text-yellow-400 flex items-center space-x-1 hover:text-yellow-300 transition-colors"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 
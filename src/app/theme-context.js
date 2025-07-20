'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app">
        <header className="header">
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                <h1>🌱 Smart Garden</h1>
              </div>
              <ul className="nav-menu">
                <li><a href="/" className="nav-link">Dashboard</a></li>
                <li><a href="/plants" className="nav-link">Plants</a></li>
                <li><a href="/sensors" className="nav-link">Sensors</a></li>
                <li><a href="/automation" className="nav-link">Automation</a></li>
                <li><a href="/analytics" className="nav-link">Analytics</a></li>
              </ul>
              <button 
                className="theme-toggle hover-scale"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                <span className="icon">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
            </nav>
          </div>
        </header>
        <main className="main">
          {children}
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 
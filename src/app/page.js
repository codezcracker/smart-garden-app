'use client';

import { useState, useEffect } from 'react';
import './dashboard.css';

export default function Dashboard() {
  const [plantStats, setPlantStats] = useState({
    total: 0,
    healthy: 0,
    needsAttention: 0,
    growthRate: 0
  });
  const [recentPlants, setRecentPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch plant statistics from MongoDB
  useEffect(() => {
    const fetchPlantStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/plants-mongodb?limit=12');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.plants) {
            const plants = data.plants;
            setRecentPlants(plants.slice(0, 8)); // Show 8 recent plants
            
            // Calculate stats (simulated for demo)
            setPlantStats({
              total: data.pagination?.total || 0,
              healthy: Math.floor((data.pagination?.total || 0) * 0.85),
              needsAttention: Math.floor((data.pagination?.total || 0) * 0.15),
              growthRate: 12
            });
          }
        }
      } catch (error) {
        console.error('Error fetching plant stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantStats();
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const quickActions = [
    { 
      icon: '🌱', 
      label: 'Browse Plants', 
      description: 'Explore 390k+ plants',
      href: '/plants',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      icon: '⚖️', 
      label: 'Compare Plants', 
      description: 'Side-by-side comparison',
      href: '/plants/comparison',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    { 
      icon: '📊', 
      label: 'View Analytics', 
      description: 'Data insights & trends',
      href: '/analytics',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  const stats = [
    { 
      label: 'Total Plants', 
      value: plantStats.total.toLocaleString(), 
      icon: '🌱', 
      color: 'green',
      change: '+2.3%',
      trend: 'up'
    },
    { 
      label: 'Healthy Plants', 
      value: plantStats.healthy.toLocaleString(), 
      icon: '✅', 
      color: 'blue',
      change: '+5.1%',
      trend: 'up'
    },
    { 
      label: 'Need Attention', 
      value: plantStats.needsAttention.toLocaleString(), 
      icon: '⚠️', 
      color: 'orange',
      change: '-12%',
      trend: 'down'
    },
    { 
      label: 'Growth Rate', 
      value: `+${plantStats.growthRate}%`, 
      icon: '📈', 
      color: 'purple',
      change: '+3.2%',
      trend: 'up'
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="modern-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-greeting">
                <h1 className="hero-title">
                  <span className="emoji">🌱</span>
                  Welcome to Smart Garden
                </h1>
                <p className="hero-subtitle">
                  Your intelligent plant management system with 390,000+ plant database
                </p>
              </div>
              
              <div className="hero-time">
                <div className="time-display">
                  <span className="current-time">{formatTime(currentTime)}</span>
                  <span className="current-date">{formatDate(currentTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className={`hero-stat-card ${stat.color}`}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                    <div className={`stat-change ${stat.trend}`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <div className="container">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <a 
                key={index} 
                href={action.href}
                className="quick-action-card"
                style={{ '--gradient': action.color }}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3 className="action-label">{action.label}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Database Overview */}
      <section className="database-overview-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Plant Database Overview</h2>
            <a href="/plants" className="view-all-link">
              Explore All Plants →
            </a>
          </div>
          
          <div className="database-stats">
            <div className="database-stat-card">
              <div className="stat-icon">🗄️</div>
              <div className="stat-content">
                <div className="stat-value">390,000+</div>
                <div className="stat-label">Plant Records</div>
                <div className="stat-description">Comprehensive database</div>
              </div>
            </div>
            
            <div className="database-stat-card">
              <div className="stat-icon">🔍</div>
              <div className="stat-content">
                <div className="stat-value">Advanced</div>
                <div className="stat-label">Search System</div>
                <div className="stat-description">3+ character minimum</div>
              </div>
            </div>
            
            <div className="database-stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <div className="stat-value">Fast</div>
                <div className="stat-label">Performance</div>
                <div className="stat-description">MongoDB Atlas powered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Plants */}
      <section className="recent-plants-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Plants</h2>
            <a href="/plants" className="view-all-link">
              View All →
            </a>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading plants...</p>
            </div>
          ) : (
            <div className="plants-showcase">
              <div className="plants-grid">
                {recentPlants.map((plant, index) => (
                  <div key={`${plant.id}-${index}`} className="plant-card">
                    <div className="plant-header">
                      <span className="plant-emoji">{plant.emoji}</span>
                      <div className="plant-category">{plant.category}</div>
                    </div>
                    <div className="plant-body">
                      <h4 className="plant-name">{plant.commonName || plant.scientificName}</h4>
                      <p className="plant-scientific">{plant.scientificName}</p>
                      <div className="plant-details">
                        <span className="plant-family">{plant.family}</span>
                        {plant.primaryUse && (
                          <span className="plant-use">{plant.primaryUse}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Smart Garden Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Plant Database</h3>
              <p>Access 390,000+ plant records with detailed information, care instructions, and growing tips.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚖️</div>
              <h3>Plant Comparison</h3>
              <p>Compare plants side-by-side across multiple categories to make informed decisions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Track your gardengarden's performanceapos;s performance with detailed analytics and growth insights.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Find plants quickly with our intelligent search system and advanced filtering.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

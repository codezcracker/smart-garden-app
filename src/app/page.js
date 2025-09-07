'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update active section based on scroll position
      const sections = sectionRefs.current;
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index) => {
    const section = sectionRefs.current[index];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="parallax-container">
      {/* Navigation Dots */}
      <div className="parallax-nav">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            className={`nav-dot ${activeSection === index ? 'active' : ''}`}
            onClick={() => scrollToSection(index)}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section 
        ref={(el) => (sectionRefs.current[0] = el)}
        className="parallax-section hero-section"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Smart Garden
              <span className="highlight">Protection</span>
            </h1>
            <p className="hero-subtitle">
              Advanced AI-powered system that monitors, protects, and nurtures your plants
              with intelligent watering and environmental control
            </p>
            <div className="hero-buttons">
              <Link href="/plants" className="btn-primary">
                Explore Plants
              </Link>
              <Link href="/analytics" className="btn-secondary">
                View Analytics
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="plant-3d-container">
              <div className="plant-3d">🌱</div>
              <div className="protection-shield"></div>
              <div className="water-drops">
                <div className="drop"></div>
                <div className="drop"></div>
                <div className="drop"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-background">
          <div className="floating-element element-1">🌿</div>
          <div className="floating-element element-2">💧</div>
          <div className="floating-element element-3">🌱</div>
          <div className="floating-element element-4">🌿</div>
          <div className="floating-element element-5">💧</div>
        </div>
      </section>

      {/* Plant Protection Section */}
      <section 
        ref={(el) => (sectionRefs.current[1] = el)}
        className="parallax-section protection-section"
      >
        <div className="section-content">
          <div className="section-header">
            <h2 className="section-title">
              Intelligent Plant <span className="highlight">Protection</span>
            </h2>
            <p className="section-subtitle">
              Our AI system continuously monitors your plants and takes proactive measures
              to ensure their health and growth
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
              <div className="feature-icon">🛡️</div>
              <h3>Disease Detection</h3>
              <p>Advanced computer vision identifies early signs of plant diseases and pest infestations</p>
              <div className="feature-stats">
                <span className="stat">99.2%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
            
            <div className="feature-card" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
              <div className="feature-icon">🌡️</div>
              <h3>Climate Control</h3>
              <p>Maintains optimal temperature, humidity, and light conditions for each plant species</p>
              <div className="feature-stats">
                <span className="stat">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
            
            <div className="feature-card" style={{ transform: `translateY(${scrollY * -0.2}px)` }}>
              <div className="feature-icon">🔔</div>
              <h3>Smart Alerts</h3>
              <p>Instant notifications when your plants need attention or environmental adjustments</p>
              <div className="feature-stats">
                <span className="stat">Real-time</span>
                <span className="stat-label">Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Watering System Section */}
      <section 
        ref={(el) => (sectionRefs.current[2] = el)}
        className="parallax-section watering-section"
      >
        <div className="section-content">
          <div className="watering-demo">
            <div className="demo-container">
              <div className="plant-pot">
                <div className="soil-level"></div>
                <div className="plant">🌱</div>
                <div className="water-sensor"></div>
                <div className="moisture-indicator"></div>
              </div>
              <div className="irrigation-system">
                <div className="water-tank">
                  <div className="water-level" style={{ height: `${Math.max(20, 80 - scrollY * 0.1)}%` }}></div>
                </div>
                <div className="pipes">
                  <div className="pipe"></div>
                  <div className="pipe"></div>
                  <div className="pipe"></div>
                </div>
                <div className="sprinkler">
                  <div className="water-spray"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="watering-info">
            <h2 className="section-title">
              Smart <span className="highlight">Watering</span> System
            </h2>
            <div className="watering-features">
              <div className="watering-feature">
                <div className="feature-number">01</div>
                <div className="feature-content">
                  <h3>Soil Moisture Analysis</h3>
                  <p>Advanced sensors measure soil moisture levels and pH to determine optimal watering needs</p>
                </div>
              </div>
              
              <div className="watering-feature">
                <div className="feature-number">02</div>
                <div className="feature-content">
                  <h3>Precision Irrigation</h3>
                  <p>Automated drip irrigation system delivers the exact amount of water each plant needs</p>
                </div>
              </div>
              
              <div className="watering-feature">
                <div className="feature-number">03</div>
                <div className="feature-content">
                  <h3>Weather Integration</h3>
                  <p>Adjusts watering schedules based on weather forecasts and seasonal changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monitoring Section */}
      <section 
        ref={(el) => (sectionRefs.current[3] = el)}
        className="parallax-section monitoring-section"
      >
        <div className="section-content">
          <div className="monitoring-dashboard">
            <h2 className="section-title">
              Real-time <span className="highlight">Monitoring</span>
            </h2>
            <div className="dashboard-grid">
              <div className="metric-card">
                <div className="metric-icon">💧</div>
                <div className="metric-value">85%</div>
                <div className="metric-label">Soil Moisture</div>
                <div className="metric-trend up">↗ +5%</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🌡️</div>
                <div className="metric-value">22°C</div>
                <div className="metric-label">Temperature</div>
                <div className="metric-trend stable">→ Stable</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">💡</div>
                <div className="metric-value">450</div>
                <div className="metric-label">Light Level</div>
                <div className="metric-trend up">↗ +12%</div>
              </div>
              
              <div className="metric-card">
                <div className="metric-icon">🌱</div>
                <div className="metric-value">12</div>
                <div className="metric-label">Healthy Plants</div>
                <div className="metric-trend up">↗ +2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section 
        ref={(el) => (sectionRefs.current[4] = el)}
        className="parallax-section cta-section"
      >
        <div className="section-content">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your <span className="highlight">Garden</span>?
            </h2>
            <p className="cta-subtitle">
              Join thousands of gardeners who trust our smart system to protect and nurture their plants
            </p>
            <div className="cta-buttons">
              <Link href="/plants" className="btn-primary large">
                Start Your Smart Garden
              </Link>
              <Link href="/analytics" className="btn-outline large">
                View Live Demo
              </Link>
            </div>
            <div className="cta-stats">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Happy Gardeners</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Plant Survival Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

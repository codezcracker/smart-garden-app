'use client';

import { useState, useEffect } from 'react';
import './dashboard.css';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Main Content Area */}
      <div className="main-content-area">
        <div className="plant-section">
          <div className="plant-header">
            <h1 className="plant-title">Bird of Paradise Plant</h1>
            <p className="plant-subtitle">Real-time monitoring and health analysis</p>
          </div>
          
          <div className="plant-image-wrapper">
            <div className="plant-container">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='leafGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234CAF50;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%238BC34A;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3C!-- Main stem --%3E%3Cpath d='M200 280 L200 180' stroke='%23388E3C' stroke-width='8' fill='none'/%3E%3C!-- Large leaves --%3E%3Cpath d='M200 200 Q150 150 120 120 Q140 100 180 90 Q160 80 140 60 Q160 40 200 50 Q240 40 260 60 Q240 80 220 90 Q260 100 280 120 Q250 150 200 200' fill='url(%23leafGradient)'/%3E%3Cpath d='M200 180 Q160 140 140 110 Q160 90 190 80 Q170 70 150 50 Q170 30 200 40 Q230 30 250 50 Q230 70 210 80 Q240 90 260 110 Q240 140 200 180' fill='url(%23leafGradient)'/%3E%3C!-- Flower structure --%3E%3Ccircle cx='200' cy='80' r='15' fill='%23FFD700'/%3E%3Ccircle cx='200' cy='80' r='8' fill='%23FF8C00'/%3E%3C!-- Small leaves --%3E%3Cpath d='M200 160 Q180 140 170 120 Q180 110 190 105 Q185 100 175 85 Q185 75 200 80 Q215 75 225 85 Q215 100 210 105 Q220 110 230 120 Q220 140 200 160' fill='%234CAF50'/%3E%3C/svg%3E" 
                alt="Bird of Paradise Plant" 
                className="plant-image"
              />
              
              {/* Data Overlays */}
              <div className="data-overlay chl-a-overlay">
                <div className="data-label">Chl A</div>
                <div className="data-value">2.4 mg/g</div>
              </div>
              
              <div className="data-overlay chl-b-overlay">
                <div className="data-label">Chl B</div>
                <div className="data-value">1.8 mg/g</div>
              </div>
              
              <div className="data-overlay soil-overlay">
                <div className="data-label">Soil Health</div>
                <div className="data-value">85%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* Growth Analysis Card */}
        <div className="sidebar-card growth-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Growth Analysis</h3>
              <p className="card-subtitle">Monthly progress tracking</p>
            </div>
            <button className="card-dropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
          
          <div className="growth-chart-container">
            <div className="growth-chart">
              <div className="chart-gradient">
                <div className="growth-point" style={{height: '60%'}}></div>
                <div className="growth-point" style={{height: '75%'}}></div>
                <div className="growth-point" style={{height: '85%'}}></div>
                <div className="growth-point" style={{height: '90%'}}></div>
                <div className="growth-point" style={{height: '95%'}}></div>
                <div className="growth-point" style={{height: '100%'}}></div>
              </div>
              <div className="chart-months">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Details Card */}
        <div className="sidebar-card details-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Plant Details</h3>
              <p className="card-subtitle">Current conditions</p>
            </div>
            <button className="expand-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
          </div>
          
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-item">
                <div className="detail-icon">🌡️</div>
                <div className="detail-info">
                  <div className="detail-label">Temperature</div>
                  <div className="detail-value">22°C</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">💧</div>
                <div className="detail-info">
                  <div className="detail-label">Humidity</div>
                  <div className="detail-value">65%</div>
                </div>
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-item">
                <div className="detail-icon">☀️</div>
                <div className="detail-info">
                  <div className="detail-label">Light</div>
                  <div className="detail-value">Bright</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🌱</div>
                <div className="detail-info">
                  <div className="detail-label">Growth</div>
                  <div className="detail-value">+12%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plants Monitored Card */}
        <div className="sidebar-card audio-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Plants Monitored</h3>
              <p className="card-subtitle">Real-time audio feedback</p>
            </div>
            <button className="card-dropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
          
          <div className="audio-visualizer">
            <div className="waveform">
              <div className="bar" style={{height: "20%"}}></div>
              <div className="bar" style={{height: "45%"}}></div>
              <div className="bar" style={{height: "60%"}}></div>
              <div className="bar" style={{height: "80%"}}></div>
              <div className="bar" style={{height: "65%"}}></div>
              <div className="bar" style={{height: "40%"}}></div>
              <div className="bar" style={{height: "75%"}}></div>
              <div className="bar" style={{height: "90%"}}></div>
              <div className="bar" style={{height: "55%"}}></div>
              <div className="bar" style={{height: "30%"}}></div>
              <div className="bar" style={{height: "70%"}}></div>
              <div className="bar" style={{height: "85%"}}></div>
            </div>
          </div>
          
          <div className="audio-controls">
            <div className="speed-control">
              <span>1x</span>
            </div>
            <div className="audio-time">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
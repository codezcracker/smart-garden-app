'use client';

import { useState, useEffect } from 'react';
import './dashboard.css';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your garden dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar Navigation */}
      <div className="left-sidebar">
        <div className="sidebar-nav">
          <div className="nav-icon active">
            <span>🏠</span>
          </div>
          <div className="nav-icon">
            <span>🌱</span>
          </div>
          <div className="nav-icon">
            <span>📊</span>
          </div>
          <div className="nav-icon">
            <span>⚙️</span>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="nav-icon">
            <span>↗️</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Plant Display Section */}
        <div className="plant-section">
          <div className="plant-header">
            <h1 className="plant-title">Bird of Paradise Plant</h1>
            <p className="plant-subtitle">Lush, glossy, tropical green leaves.</p>
          </div>
          
          <div className="plant-image-wrapper">
            <div className="plant-container">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3ClinearGradient id='pot' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f5f5f5'/%3E%3Cstop offset='100%25' style='stop-color:%23e0e0e0'/%3E%3C/linearGradient%3E%3C/defs%3E%3C!-- Pot --%3E%3Cellipse cx='200' cy='350' rx='80' ry='20' fill='%23d0d0d0'/%3E%3Cpath d='M120 350 L140 280 L260 280 L280 350 Z' fill='url(%23pot)' stroke='%23ccc' stroke-width='2'/%3E%3C!-- Soil --%3E%3Cellipse cx='200' cy='280' rx='70' ry='12' fill='%238B4513'/%3E%3C!-- Main stems --%3E%3Cpath d='M200 280 Q180 250 160 200 Q150 180 140 150' stroke='%234a5d23' stroke-width='6' fill='none'/%3E%3Cpath d='M200 280 Q200 240 200 180 Q200 160 200 130' stroke='%234a5d23' stroke-width='8' fill='none'/%3E%3Cpath d='M200 280 Q220 250 240 200 Q250 180 260 150' stroke='%234a5d23' stroke-width='6' fill='none'/%3E%3C!-- Large leaves --%3E%3Cellipse cx='140' cy='150' rx='45' ry='80' fill='%23228B22' transform='rotate(-20 140 150)'/%3E%3Cellipse cx='200' cy='130' rx='50' ry='85' fill='%2332CD32' transform='rotate(5 200 130)'/%3E%3Cellipse cx='260' cy='150' rx='45' ry='80' fill='%23228B22' transform='rotate(20 260 150)'/%3E%3C!-- Medium leaves --%3E%3Cellipse cx='170' cy='180' rx='35' ry='60' fill='%23228B22' transform='rotate(-10 170 180)'/%3E%3Cellipse cx='230' cy='180' rx='35' ry='60' fill='%23228B22' transform='rotate(10 230 180)'/%3E%3C!-- Leaf details/veins --%3E%3Cpath d='M140 110 Q140 140 140 170 M125 130 Q140 140 155 130 M125 150 Q140 150 155 150' stroke='%23006400' stroke-width='2' fill='none'/%3E%3Cpath d='M200 85 Q200 115 200 145 M185 105 Q200 115 215 105 M185 125 Q200 125 215 125' stroke='%23006400' stroke-width='2' fill='none'/%3E%3Cpath d='M260 110 Q260 140 260 170 M245 130 Q260 140 275 130 M245 150 Q260 150 275 150' stroke='%23006400' stroke-width='2' fill='none'/%3E%3C/svg%3E"
                alt="Bird of Paradise Plant"
                className="plant-image"
              />
              
              {/* Data overlays */}
              <div className="data-overlay chl-a-overlay">
                <div className="data-label">Chl A level</div>
                <div className="data-value">0.749: 00.02b</div>
              </div>
              
              <div className="data-overlay chl-b-overlay">
                <div className="data-label">Chl B level</div>
                <div className="data-value">0.738: 00.02b</div>
              </div>
              
              <div className="data-overlay soil-overlay">
                <div className="data-label">Soil Health</div>
                <div className="data-value">Dry & Cracked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Cards */}
      <div className="right-sidebar">
        {/* Growth Analysis Card */}
        <div className="sidebar-card growth-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Growth Analysis</h3>
              <p className="card-subtitle">1 Month Growth Time-Lapse</p>
            </div>
            <select className="card-dropdown">
              <option>Month</option>
            </select>
          </div>
          
          <div className="growth-chart-container">
            <div className="growth-chart">
              <div className="chart-gradient"></div>
              <div className="growth-point"></div>
              <div className="growth-label">+4%</div>
              <div className="chart-months">
                <span>mar</span>
                <span>apr</span>
                <span>may</span>
                <span>jun</span>
                <span>jul</span>
                <span>aug</span>
                <span>sep</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Details Card */}
        <div className="sidebar-card details-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Plant Details</h3>
              <p className="card-subtitle">Real-time conditions.</p>
            </div>
            <button className="expand-button">
              ↗️
            </button>
          </div>
          
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-item">
                <div className="detail-icon">☀️</div>
                <div className="detail-info">
                  <div className="detail-label">Light Condition</div>
                  <div className="detail-value">Minimal</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🌿</div>
                <div className="detail-info">
                  <div className="detail-label">Soil Health</div>
                  <div className="detail-value">Dry & Cracked</div>
                </div>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-item">
                <div className="detail-icon">💧</div>
                <div className="detail-info">
                  <div className="detail-label">Humidity Level</div>
                  <div className="detail-value">70%</div>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">🌱</div>
                <div className="detail-info">
                  <div className="detail-label">Fertilization Status</div>
                  <div className="detail-value">Balanced</div>
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
              <p className="card-subtitle">Guides and best practices.</p>
            </div>
            <button className="play-button">
              ▶️
            </button>
          </div>
          
          <div className="audio-visualizer">
            <div className="waveform">
              <div className="bar" style={{height: "20%"}}></div>
              <div className="bar" style={{height: "45%"}}></div>
              <div className="bar" style={{height: "30%"}}></div>
              <div className="bar" style={{height: "60%"}}></div>
              <div className="bar" style={{height: "80%"}}></div>
              <div className="bar" style={{height: "40%"}}></div>
              <div className="bar" style={{height: "65%"}}></div>
              <div className="bar" style={{height: "35%"}}></div>
              <div className="bar" style={{height: "75%"}}></div>
              <div className="bar" style={{height: "50%"}}></div>
              <div className="bar" style={{height: "85%"}}></div>
              <div className="bar" style={{height: "25%"}}></div>
              <div className="bar" style={{height: "55%"}}></div>
              <div className="bar" style={{height: "70%"}}></div>
              <div className="bar" style={{height: "40%"}}></div>
              <div className="bar" style={{height: "90%"}}></div>
              <div className="bar" style={{height: "35%"}}></div>
              <div className="bar" style={{height: "60%"}}></div>
              <div className="bar" style={{height: "45%"}}></div>
              <div className="bar" style={{height: "80%"}}></div>
            </div>
          </div>
          
          <div className="audio-controls">
            <div className="audio-info">
              <span className="speed-control">🔊 1x</span>
            </div>
            <div className="audio-time">05:34</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
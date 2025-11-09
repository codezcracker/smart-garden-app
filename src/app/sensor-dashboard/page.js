'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, ResponsiveContainer
} from 'recharts';
import './sensor-dashboard.css';

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState('tomato');

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test');
      const data = await response.json();
      setSensorData(data.slice(0, 20));
      if (data.length > 0) {
        setLatestData(data[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="garden-dashboard">
        <div className="loading-container">
          <div className="plant-loading">
            <div className="plant-sprout"></div>
            <div className="loading-text">🌱 Growing your garden...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!sensorData.length) {
    return (
      <div className="garden-dashboard">
        <div className="no-data-container">
          <div className="sad-plant">🥀</div>
          <h3>No Garden Data</h3>
          <p>Connect your ESP8266 to see your garden</p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const chartData = sensorData.slice(0, 10).map((item, index) => ({
    time: index,
    temp: item.temperature,
    humidity: item.humidity,
    moisture: item.soilMoisture,
    light: item.lightLevel
  }));

  // Plant health calculation
  const plantHealth = Math.round(
    ((latestData?.soilMoisture || 0) + 
     (latestData?.lightLevel || 0) + 
     (latestData?.temperature || 0) * 2) / 4
  );

  // Day/Night calculation based on light level
  const lightLevel = latestData?.lightLevel || 0;
  const isDay = lightLevel > 40;
  const isDusk = lightLevel > 20 && lightLevel <= 40;
  const isNight = lightLevel <= 20;
  
  // Background gradient based on time of day
  const getBackgroundGradient = () => {
    if (isNight) {
      return 'linear-gradient(180deg, #0a1128 0%, #1a2456 100%)'; // Dark night
    } else if (isDusk) {
      return 'linear-gradient(180deg, #ff6b6b 0%, #ffa726 40%, #4a90e2 100%)'; // Sunset
    } else {
      return 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%)'; // Bright day
    }
  };

  // Sun/Moon position and appearance
  const getSunMoonPosition = () => {
    // Light level 0-100 maps to position
    const normalizedLight = Math.min(100, Math.max(0, lightLevel));
    return {
      top: `${10 + (100 - normalizedLight) * 0.5}%`,
      right: `${10 + (100 - normalizedLight) * 0.3}%`,
      opacity: lightLevel < 10 ? 0.3 : 1
    };
  };

  return (
    <div className="garden-dashboard">
      {/* Top Navigation */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🌱</span>
            <span className="logo-text">Smart Garden</span>
          </div>
          <nav className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/plants" className="nav-link">Plants</a>
            <a href="/analytics" className="nav-link">Analytics</a>
            <a href="/settings" className="nav-link">Settings</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <motion.div 
              className="status-dot"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span>Live Garden</span>
          </div>
        </div>
      </motion.div>

      <div className="dashboard-content">
        {/* Left Sidebar - Plant Info */}
        <motion.div 
          className="left-sidebar"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Plant Selection */}
          <div className="plant-selection">
            <h3>🌿 Plant Selection</h3>
            <div className="plant-cards">
              <motion.div 
                className={`plant-card ${selectedPlant === 'tomato' ? 'active' : ''}`}
                onClick={() => setSelectedPlant('tomato')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="plant-icon">🍅</div>
                <div className="plant-name">Tomato</div>
              </motion.div>
              <motion.div 
                className={`plant-card ${selectedPlant === 'lettuce' ? 'active' : ''}`}
                onClick={() => setSelectedPlant('lettuce')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="plant-icon">🥬</div>
                <div className="plant-name">Lettuce</div>
              </motion.div>
            </div>
          </div>

          {/* Plant Health Status */}
          <div className="plant-health-card">
            <div className="plant-photo">
              <motion.div 
                className="plant-image"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                {selectedPlant === 'tomato' ? '🍅' : '🥬'}
              </motion.div>
            </div>
            <div className="plant-info">
              <h4>{selectedPlant === 'tomato' ? 'Tomato Plant' : 'Lettuce Plant'}</h4>
              <p>Age: 45 days</p>
              <p>Growth Stage: Flowering</p>
            </div>
            <div className="health-metrics">
              <div className="metric-card">
                <div className="metric-icon">💧</div>
                <div className="metric-value">{latestData?.soilMoisture?.toFixed(0) || '--'}%</div>
                <div className="metric-label">Soil Moisture</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">☀️</div>
                <div className="metric-value">{latestData?.lightLevel?.toFixed(0) || '--'}%</div>
                <div className="metric-label">Light Level</div>
              </div>
            </div>
          </div>

          {/* Plant Health Condition */}
          <div className="health-condition">
            <div className="health-circle">
              <motion.div 
                className="health-progress"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (plantHealth * 2.51) }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <svg viewBox="0 0 100 100" className="progress-ring">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset="251.2"
                  />
                </svg>
              </motion.div>
              <div className="health-percentage">
                <motion.span
                  key={plantHealth}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {plantHealth}%
                </motion.span>
              </div>
            </div>
            <div className="health-text">
              <h3>Plant Health Condition</h3>
              <p>Based on real-time sensor data</p>
            </div>
          </div>
        </motion.div>

        {/* Center - 3D Garden Visualization */}
        <motion.div 
          className="center-garden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="garden-visualization">
            {/* Sky Background - Changes with light level */}
            <motion.div 
              className="sky-background"
              animate={{ 
                background: getBackgroundGradient()
              }}
              transition={{ duration: 2 }}
            >
              {/* Stars for night time */}
              {isNight && (
                <div className="stars">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="star"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 60}%`,
                        animationDelay: `${Math.random() * 3}s`
                      }}
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Clouds for day time */}
              {isDay && (
                <div className="clouds">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="cloud"
                      style={{
                        top: `${10 + i * 15}%`
                      }}
                      animate={{
                        x: ['-100%', '100vw']
                      }}
                      transition={{
                        duration: 30 + i * 10,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Animated Garden Scene */}
            <div className="garden-scene">
              {/* Soil Layer */}
              <motion.div 
                className="soil-layer"
                animate={{ 
                  background: `linear-gradient(45deg, 
                    #8B4513 ${latestData?.soilMoisture || 0}%, 
                    #D2691E ${100 - (latestData?.soilMoisture || 0)}%)`
                }}
                transition={{ duration: 1 }}
              >
                <div className="soil-texture"></div>
              </motion.div>

              {/* Plant */}
              <motion.div 
                className="plant-visual"
                animate={{ 
                  scale: [1, 1.02, 1],
                  rotate: [0, 0.5, -0.5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <div className="plant-stem"></div>
                <div className="plant-leaves">
                  <div className="leaf leaf-1"></div>
                  <div className="leaf leaf-2"></div>
                  <div className="leaf leaf-3"></div>
                </div>
                {selectedPlant === 'tomato' && (
                  <div className="plant-fruit">🍅</div>
                )}
              </motion.div>

              {/* Animated Water Drops */}
              <AnimatePresence>
                {latestData?.soilMoisture > 30 && (
                  <motion.div 
                    className="water-drops"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="water-drop"
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated Sun/Moon based on light level */}
              <motion.div 
                className="sun-moon-container"
                animate={getSunMoonPosition()}
                transition={{ duration: 2 }}
              >
                {isNight ? (
                  // Moon for night
                  <motion.div 
                    className="moon"
                    animate={{ 
                      rotate: 360,
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 4, repeat: Infinity }
                    }}
                  >
                    🌙
                    <motion.div 
                      className="moon-glow"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity
                      }}
                    />
                  </motion.div>
                ) : isDusk ? (
                  // Setting sun for dusk
                  <motion.div 
                    className="sun sun-setting"
                    animate={{ 
                      scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity
                    }}
                  >
                    🌅
                  </motion.div>
                ) : (
                  // Bright sun for day
                  <motion.div 
                    className="sun-light"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity }
                    }}
                  >
                    <div className="sun">☀️</div>
                    <div className="light-rays">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="light-ray"
                          animate={{
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Light Level Indicator */}
              <motion.div 
                className="light-level-indicator"
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="light-badge">
                  {isNight && <span>🌙 Night Time</span>}
                  {isDusk && <span>🌅 Sunset</span>}
                  {isDay && <span>☀️ Day Time</span>}
                  <div className="light-value">{lightLevel}% Light</div>
                </div>
              </motion.div>

              {/* Temperature Heat Waves */}
              <AnimatePresence>
                {latestData?.temperature > 25 && (
                  <motion.div 
                    className="heat-waves"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="heat-wave"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Garden Controls */}
            <div className="garden-controls">
              <button className="control-btn">🌱</button>
              <button className="control-btn">ℹ️</button>
              <button className="control-btn">▶️</button>
            </div>
          </div>
        </motion.div>

        {/* Right Sidebar - Real-time Metrics */}
        <motion.div 
          className="right-sidebar"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Current Garden Metrics */}
          <div className="metrics-section">
            <h3>📊 Garden Metrics</h3>
            
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🌡️</span>
                <span className="metric-title">Temperature</span>
              </div>
              <div className="metric-value">
                <motion.span
                  key={latestData?.temperature}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.temperature?.toFixed(1) || '--'}°C
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={chartData}>
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#ff6b6b" 
                      fill="#ff6b6b20"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">💧</span>
                <span className="metric-title">Humidity</span>
              </div>
              <div className="metric-value">
                <motion.span
                  key={latestData?.humidity}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.humidity?.toFixed(0) || '--'}%
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={chartData}>
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#4ecdc4" 
                      fill="#4ecdc420"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🌱</span>
                <span className="metric-title">Soil Moisture</span>
              </div>
              <div className="metric-value">
                <motion.span
                  key={latestData?.soilMoisture}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.soilMoisture?.toFixed(0) || '--'}%
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={chartData}>
                    <Area 
                      type="monotone" 
                      dataKey="moisture" 
                      stroke="#45b7d1" 
                      fill="#45b7d120"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">☀️</span>
                <span className="metric-title">Light Level</span>
              </div>
              <div className="metric-value">
                <motion.span
                  key={latestData?.lightLevel}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.lightLevel?.toFixed(0) || '--'}%
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={chartData}>
                    <Area 
                      type="monotone" 
                      dataKey="light" 
                      stroke="#f9ca24" 
                      fill="#f9ca2420"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Garden History */}
          <div className="garden-history">
            <h3>📈 Garden History</h3>
            <div className="history-list">
              <div className="history-item">
                <span className="history-icon">🌱</span>
                <span className="history-text">Plant Growth Check</span>
                <span className="history-date">Today</span>
              </div>
              <div className="history-item">
                <span className="history-icon">💧</span>
                <span className="history-text">Watering Cycle</span>
                <span className="history-date">2h ago</span>
              </div>
              <div className="history-item">
                <span className="history-icon">🌡️</span>
                <span className="history-text">Temperature Alert</span>
                <span className="history-date">4h ago</span>
              </div>
              <div className="history-item">
                <span className="history-icon">☀️</span>
                <span className="history-text">Light Adjustment</span>
                <span className="history-date">6h ago</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
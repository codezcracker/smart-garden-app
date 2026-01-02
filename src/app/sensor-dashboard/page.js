'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts';
import './sensor-dashboard.css';

export default function SensorDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState('tomato');

  // Fetch user devices
  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to view sensor data');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userDevices = data.devices || [];
        
        if (userDevices.length === 0) {
          setError('No devices found. Please add a device first.');
          setIsLoading(false);
          return;
        }

        setDevices(userDevices);
        
        // Auto-select first device if none selected
        if (!selectedDevice && userDevices.length > 0) {
          setSelectedDevice(userDevices[0]);
        }
      } else {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/auth/login';
        } else {
          setError('Failed to fetch devices');
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Error connecting to server');
      setIsLoading(false);
    }
  };

  // Fetch sensor data for selected device
  const fetchSensorData = async () => {
    if (!selectedDevice) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Get latest sensor readings from device
      const deviceId = selectedDevice.deviceId || selectedDevice._id;
      
      // Try to get historical data from sensor readings API
      const response = await fetch(`/api/sensors/data?deviceId=${deviceId}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const readings = data.readings || [];
        
        // If we have readings, use them
        if (readings.length > 0) {
          const formattedData = readings.map(reading => ({
            time: new Date(reading.timestamp).toLocaleTimeString(),
            timestamp: new Date(reading.timestamp),
            temperature: reading.temperature || reading.data?.temperature || 0,
            humidity: reading.humidity || reading.data?.humidity || 0,
            moisture: reading.soilMoisture || reading.data?.soilMoisture || 0,
            light: reading.lightLevel || reading.data?.lightLevel || 0
          }));
          
          setSensorData(formattedData);
          
          if (formattedData.length > 0) {
            setLatestData(formattedData[0]);
          }
        } else {
          // Fallback to device's latest data
          const latestReading = {
            temperature: selectedDevice.temperature || selectedDevice.sensors?.temperature || 25,
            humidity: selectedDevice.humidity || selectedDevice.sensors?.humidity || 50,
            moisture: selectedDevice.soilMoisture || selectedDevice.sensors?.soilMoisture || 60,
            light: selectedDevice.lightLevel || selectedDevice.sensors?.lightLevel || 50
          };
          
          setLatestData(latestReading);
          setSensorData([{
            time: new Date().toLocaleTimeString(),
            timestamp: new Date(),
            ...latestReading
          }]);
        }
        
        setLastUpdate(new Date());
        setError(null);
      } else {
        // Fallback to device's stored data
        const latestReading = {
          temperature: selectedDevice.temperature || selectedDevice.sensors?.temperature || 25,
          humidity: selectedDevice.humidity || selectedDevice.sensors?.humidity || 50,
          moisture: selectedDevice.soilMoisture || selectedDevice.sensors?.soilMoisture || 60,
          light: selectedDevice.lightLevel || selectedDevice.sensors?.lightLevel || 50
        };
        
        setLatestData(latestReading);
        setSensorData([{
          time: new Date().toLocaleTimeString(),
          timestamp: new Date(),
          ...latestReading
        }]);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      // Don't set error - use fallback data from device
      const latestReading = {
        temperature: selectedDevice.temperature || 25,
        humidity: selectedDevice.humidity || 50,
        moisture: selectedDevice.soilMoisture || 60,
        light: selectedDevice.lightLevel || 50
      };
      
      setLatestData(latestReading);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      setIsLoading(true);
      fetchSensorData();
      
      // Auto-refresh every 5 seconds
      const interval = setInterval(fetchSensorData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  if (isLoading && !selectedDevice) {
    return (
      <div className="garden-dashboard">
        <div className="loading-container">
          <div className="plant-loading">
            <div className="plant-sprout"></div>
            <div className="loading-text">🌱 Loading your garden...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !selectedDevice) {
    return (
      <div className="garden-dashboard">
        <div className="no-data-container">
          <div className="sad-plant">🥀</div>
          <h3>{error}</h3>
          <p>
            {error.includes('log in') ? (
              <a href="/auth/login" style={{ color: '#00ff88', textDecoration: 'underline' }}>Login here</a>
            ) : error.includes('No devices') ? (
              <a href="/my-devices" style={{ color: '#00ff88', textDecoration: 'underline' }}>Add a device here</a>
            ) : (
              'Please check your connection and try again'
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="garden-dashboard">
        <div className="no-data-container">
          <div className="sad-plant">🌱</div>
          <h3>No Sensor Data</h3>
          <p>Waiting for sensor readings from {selectedDevice?.deviceName || selectedDevice?.deviceId || 'device'}...</p>
        </div>
      </div>
    );
  }

  // Format data for charts (last 20 readings)
  const chartData = sensorData.slice(0, 20).reverse().map((item, index) => ({
    time: index,
    label: item.time,
    temp: item.temperature || 0,
    humidity: item.humidity || 0,
    moisture: item.moisture || 0,
    light: item.light || 0
  }));

  // Plant health calculation
  const plantHealth = Math.round(
    ((latestData?.moisture || 0) + 
     (latestData?.light || 0) + 
     (latestData?.temperature || 0) * 2) / 4
  );

  // Day/Night calculation based on light level
  const lightLevel = latestData?.light || 0;
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
    const normalizedLight = Math.min(100, Math.max(0, lightLevel));
    return {
      top: `${10 + (100 - normalizedLight) * 0.5}%`,
      right: `${10 + (100 - normalizedLight) * 0.3}%`,
      opacity: lightLevel < 10 ? 0.3 : 1
    };
  };

  // Device status
  const deviceStatus = selectedDevice?.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE';
  const lastSeen = selectedDevice?.lastSeen 
    ? new Date(selectedDevice.lastSeen).toLocaleString() 
    : 'Never';

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
            <a href="/my-devices" className="nav-link">My Devices</a>
            <a href="/interactive-garden" className="nav-link">Interactive Garden</a>
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
          {lastUpdate && (
            <div className="last-update" style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '20px' }}>
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </motion.div>

      <div className="dashboard-content">
        {/* Left Sidebar - Device & Plant Info */}
        <motion.div 
          className="left-sidebar"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Device Selection */}
          <div className="plant-selection">
            <h3>📱 Select Device</h3>
            <select 
              className="device-select"
              value={selectedDevice?.deviceId || selectedDevice?._id || ''}
              onChange={(e) => {
                const device = devices.find(d => (d.deviceId || d._id) === e.target.value);
                setSelectedDevice(device);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              {devices.map(device => (
                <option key={device.deviceId || device._id} value={device.deviceId || device._id}>
                  {device.deviceName || device.deviceId || 'Unknown Device'}
                </option>
              ))}
            </select>
            <div className="device-status-info" style={{ marginTop: '10px', fontSize: '12px', color: '#7f8c8d' }}>
              <div>Status: {deviceStatus}</div>
              <div>Last Seen: {lastSeen}</div>
            </div>
          </div>

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
              <p>Device: {selectedDevice?.deviceName || selectedDevice?.deviceId || 'Unknown'}</p>
              <p>Location: {selectedDevice?.location || 'Not set'}</p>
            </div>
            <div className="health-metrics">
              <div className="metric-card">
                <div className="metric-icon">💧</div>
                <div className="metric-value">{latestData?.moisture?.toFixed(0) || '--'}%</div>
                <div className="metric-label">Soil Moisture</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">☀️</div>
                <div className="metric-value">{latestData?.light?.toFixed(0) || '--'}%</div>
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
                    #8B4513 ${latestData?.moisture || 0}%, 
                    #D2691E ${100 - (latestData?.moisture || 0)}%)`
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
                {latestData?.moisture > 30 && (
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
                  <div className="light-value">{lightLevel.toFixed(0)}% Light</div>
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
              <button className="control-btn" title="Refresh Data" onClick={fetchSensorData}>🔄</button>
              <button className="control-btn" title="Device Info">ℹ️</button>
              <button className="control-btn" title="Full Screen">⛶</button>
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
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <Tooltip />
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
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <Tooltip />
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
                  key={latestData?.moisture}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.moisture?.toFixed(0) || '--'}%
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <Tooltip />
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
                  key={latestData?.light}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.light?.toFixed(0) || '--'}%
                </motion.span>
              </div>
              <div className="metric-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <Tooltip />
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

          {/* Recent Activity */}
          <div className="garden-history">
            <h3>📈 Recent Activity</h3>
            <div className="history-list">
              <div className="history-item">
                <span className="history-icon">🌡️</span>
                <span className="history-text">Temperature: {latestData?.temperature?.toFixed(1)}°C</span>
                <span className="history-date">{lastUpdate?.toLocaleTimeString() || 'Now'}</span>
              </div>
              <div className="history-item">
                <span className="history-icon">💧</span>
                <span className="history-text">Humidity: {latestData?.humidity?.toFixed(0)}%</span>
                <span className="history-date">{lastUpdate?.toLocaleTimeString() || 'Now'}</span>
              </div>
              <div className="history-item">
                <span className="history-icon">🌱</span>
                <span className="history-text">Soil Moisture: {latestData?.moisture?.toFixed(0)}%</span>
                <span className="history-date">{lastUpdate?.toLocaleTimeString() || 'Now'}</span>
              </div>
              <div className="history-item">
                <span className="history-icon">☀️</span>
                <span className="history-text">Light Level: {latestData?.light?.toFixed(0)}%</span>
                <span className="history-date">{lastUpdate?.toLocaleTimeString() || 'Now'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

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

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test');
      const data = await response.json();
      setSensorData(data.slice(0, 20)); // Only last 20 readings
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
      <div className="compact-dashboard">
        <div className="loading-pulse"></div>
      </div>
    );
  }

  if (!sensorData.length) {
    return (
      <div className="compact-dashboard">
        <div className="no-data">📡 No Data</div>
      </div>
    );
  }

  // Format data for mini charts
  const chartData = sensorData.slice(0, 10).map((item, index) => ({
    time: index,
    temp: item.temperature,
    humidity: item.humidity,
    moisture: item.soilMoisture,
    light: item.lightLevel
  }));

  return (
    <div className="compact-dashboard">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>🌱 Smart Garden</h2>
        <div className="status-indicator">
          <motion.div 
            className="status-dot"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span>Live</span>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        {/* Temperature */}
        <motion.div 
          className="stat-card temp"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon">🌡️</div>
          <div className="stat-value">
            <motion.span
              key={latestData?.temperature}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {latestData?.temperature?.toFixed(1) || '--'}°C
            </motion.span>
          </div>
          <div className="stat-label">Temperature</div>
        </motion.div>

        {/* Humidity */}
        <motion.div 
          className="stat-card humidity"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon">💧</div>
          <div className="stat-value">
            <motion.span
              key={latestData?.humidity}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {latestData?.humidity?.toFixed(0) || '--'}%
            </motion.span>
          </div>
          <div className="stat-label">Humidity</div>
        </motion.div>

        {/* Moisture */}
        <motion.div 
          className="stat-card moisture"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon">🌱</div>
          <div className="stat-value">
            <motion.span
              key={latestData?.soilMoisture}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {latestData?.soilMoisture?.toFixed(0) || '--'}%
            </motion.span>
          </div>
          <div className="stat-label">Soil</div>
        </motion.div>

        {/* Light */}
        <motion.div 
          className="stat-card light"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon">☀️</div>
          <div className="stat-value">
            <motion.span
              key={latestData?.lightLevel}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {latestData?.lightLevel?.toFixed(0) || '--'}%
            </motion.span>
          </div>
          <div className="stat-label">Light</div>
        </motion.div>
      </div>

      {/* Mini Charts */}
      <div className="charts-section">
        {/* Temperature Trend */}
        <motion.div 
          className="mini-chart"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="chart-title">🌡️ Temp Trend</div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#00ff88" 
                fill="#00ff8820"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Moisture Trend */}
        <motion.div 
          className="mini-chart"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="chart-title">🌱 Moisture Trend</div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area 
                type="monotone" 
                dataKey="moisture" 
                stroke="#00aaff" 
                fill="#00aaff20"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* WiFi Status */}
      <motion.div 
        className="wifi-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="wifi-info">
          <span>📶 WiFi: {latestData?.wifiRSSI || '--'} dBm</span>
          <span>🕒 {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import './sensor-dashboard.css';

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h'); // 1h, 6h, 24h

  // Fetch sensor data
  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test');
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Sort by time and get latest
        const sorted = data.sort((a, b) => 
          new Date(b.receivedAt) - new Date(a.receivedAt)
        );
        
        setLatestData(sorted[0]);
        
        // Format data for charts (limit based on time range)
        const now = new Date();
        const timeRangeMs = {
          '1h': 60 * 60 * 1000,
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
        }[timeRange];
        
        const filtered = sorted
          .filter(item => {
            const itemTime = new Date(item.receivedAt);
            return (now - itemTime) <= timeRangeMs;
          })
          .reverse() // Oldest first for charts
          .map(item => ({
            time: new Date(item.receivedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            temperature: item.temperature || 0,
            humidity: item.humidity || 0,
            moisture: item.soilMoisture || 0,
            light: item.lightLevel || 0,
          }));
        
        setSensorData(filtered);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}{entry.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate status
  const getStatus = (value, type) => {
    switch(type) {
      case 'temperature':
        if (value < 15) return { text: 'Cold', color: '#2196F3' };
        if (value < 25) return { text: 'Optimal', color: '#4CAF50' };
        if (value < 30) return { text: 'Warm', color: '#FF9800' };
        return { text: 'Hot', color: '#F44336' };
      case 'humidity':
        if (value < 30) return { text: 'Dry', color: '#FF9800' };
        if (value < 60) return { text: 'Optimal', color: '#4CAF50' };
        return { text: 'Humid', color: '#2196F3' };
      case 'moisture':
        if (value < 30) return { text: 'Dry', color: '#F44336' };
        if (value < 60) return { text: 'Optimal', color: '#4CAF50' };
        return { text: 'Wet', color: '#2196F3' };
      case 'light':
        if (value < 30) return { text: 'Dark', color: '#9E9E9E' };
        if (value < 70) return { text: 'Good', color: '#4CAF50' };
        return { text: 'Bright', color: '#FFC107' };
      default:
        return { text: 'Unknown', color: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="dashboard-container">
        <div className="no-data-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>No Sensor Data Available</h2>
            <p>Waiting for ESP8266 to send data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const tempStatus = getStatus(latestData.temperature, 'temperature');
  const humStatus = getStatus(latestData.humidity, 'humidity');
  const moistStatus = getStatus(latestData.soilMoisture, 'moisture');
  const lightStatus = getStatus(latestData.lightLevel, 'light');

  return (
    <div className="dashboard-container">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1>🌱 Smart Garden Dashboard</h1>
          <p className="device-id">Device: {latestData.deviceId}</p>
        </div>
        <div className="time-range-selector">
          {['1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="status-cards">
        <StatusCard
          icon="🌡️"
          title="Temperature"
          value={latestData.temperature}
          unit="°C"
          status={tempStatus}
          delay={0}
        />
        <StatusCard
          icon="💧"
          title="Humidity"
          value={latestData.humidity}
          unit="%"
          status={humStatus}
          delay={0.1}
        />
        <StatusCard
          icon="🌱"
          title="Soil Moisture"
          value={latestData.soilMoisture}
          unit="%"
          status={moistStatus}
          delay={0.2}
        />
        <StatusCard
          icon="💡"
          title="Light Level"
          value={latestData.lightLevel}
          unit="%"
          status={lightStatus}
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Temperature & Humidity Chart */}
        <motion.div
          className="chart-card large"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="chart-header">
            <h3>Temperature & Humidity</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#4CAF50' }} />
                Temperature
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#2196F3' }} />
                Humidity
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sensorData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#4CAF50"
                fill="url(#tempGradient)"
                strokeWidth={2}
                animationDuration={1000}
                name="Temperature"
                unit="°C"
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#2196F3"
                fill="url(#humGradient)"
                strokeWidth={2}
                animationDuration={1000}
                name="Humidity"
                unit="%"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Soil Moisture Chart */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="chart-header">
            <h3>Soil Moisture</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="moisture"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ fill: '#4CAF50', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
                name="Moisture"
                unit="%"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Light Level Chart */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="chart-header">
            <h3>Light Level</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="light"
                fill="#FFC107"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
                name="Light"
                unit="%"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radial Gauges */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="chart-header">
            <h3>Current Status</h3>
          </div>
          <div className="radial-gauges">
            <RadialGauge
              value={latestData.temperature}
              max={50}
              label="Temp"
              color="#4CAF50"
              unit="°C"
            />
            <RadialGauge
              value={latestData.humidity}
              max={100}
              label="Humidity"
              color="#2196F3"
              unit="%"
            />
            <RadialGauge
              value={latestData.soilMoisture}
              max={100}
              label="Moisture"
              color="#4CAF50"
              unit="%"
            />
            <RadialGauge
              value={latestData.lightLevel}
              max={100}
              label="Light"
              color="#FFC107"
              unit="%"
            />
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div
        className="system-info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="info-item">
          <span className="info-label">WiFi Signal:</span>
          <span className="info-value">{latestData.wifiRSSI || 'N/A'} dBm</span>
        </div>
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className="info-value status-online">
            {latestData.status || 'online'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Last Update:</span>
          <span className="info-value">
            {new Date(latestData.receivedAt).toLocaleString()}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// Status Card Component
function StatusCard({ icon, title, value, unit, status, delay }) {
  return (
    <motion.div
      className="status-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)' }}
    >
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h4 className="card-title">{title}</h4>
        <motion.div
          className="card-value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          <span className="value-number">{value?.toFixed(1) || 0}</span>
          <span className="value-unit">{unit}</span>
        </motion.div>
        <div className="card-status" style={{ color: status.color }}>
          {status.text}
        </div>
      </div>
      <div className="card-indicator" style={{ background: status.color }} />
    </motion.div>
  );
}

// Radial Gauge Component
function RadialGauge({ value, max, label, color, unit }) {
  const percentage = (value / max) * 100;
  const data = [
    {
      name: label,
      value: percentage,
      fill: color,
    },
  ];

  return (
    <div className="radial-gauge">
      <ResponsiveContainer width={120} height={120}>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            animationDuration={1000}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="gauge-label">
        <div className="gauge-value">
          {value?.toFixed(1) || 0}{unit}
        </div>
        <div className="gauge-title">{label}</div>
      </div>
    </div>
  );
}


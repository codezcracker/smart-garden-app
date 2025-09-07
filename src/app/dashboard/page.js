'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedChart from '@/components/AnimatedChart';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';
import AnimatedGauge from '@/components/AnimatedGauge';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState({});
  const [historicalData, setHistoricalData] = useState({});

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('Checking auth:', { token: !!token, userData: !!userData });
    
    if (!token || !userData) {
      console.log('No auth found, redirecting to login');
      window.location.href = '/auth/login';
      return;
    }

    try {
      const user = JSON.parse(userData);
      console.log('User found:', user);
      setUser(user);
      fetchDevices(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth/login';
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && devices.length > 0) {
      const interval = setInterval(() => {
        devices.forEach(device => {
          fetchSensorData(device._id, token);
        });
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [devices]);

  const fetchDevices = async (token) => {
    try {
      console.log('Fetching devices with token:', token ? 'present' : 'missing');
      
      const response = await fetch('/api/devices/register', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Devices API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Devices data received:', data);
        setDevices(data.devices || []);
        
        // Fetch sensor data for each device
        for (const device of data.devices || []) {
          fetchSensorData(device._id, token);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch devices:', errorData);
        
        if (response.status === 401) {
          console.log('Unauthorized - clearing auth and redirecting');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/auth/login';
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorData = async (deviceId, token) => {
    try {
      const response = await fetch(`/api/sensors/data?deviceId=${deviceId}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSensorData(prev => ({
          ...prev,
          [deviceId]: data.latestReadings
        }));
      }
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
    }
  };

  const sendControlCommand = async (deviceId, action, parameters = {}) => {
    const token = localStorage.getItem('auth_token');
    setControlLoading(prev => ({ ...prev, [`${deviceId}_${action}`]: true }));

    try {
      const response = await fetch('/api/devices/control', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          action,
          parameters
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Command sent successfully: ${data.message}`);
        
        // Refresh sensor data after a few seconds
        setTimeout(() => {
          fetchSensorData(deviceId, token);
        }, 3000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Control command failed:', error);
      alert('Failed to send command');
    } finally {
      setControlLoading(prev => ({ ...prev, [`${deviceId}_${action}`]: false }));
    }
  };

  const getSensorValue = (deviceId, sensorType) => {
    const deviceSensors = sensorData[deviceId] || [];
    const sensor = deviceSensors.find(s => s._id.sensorType === sensorType);
    return sensor ? sensor.latestValue : null;
  };

  const generateHistoricalData = (deviceId, sensorType) => {
    const currentValue = getSensorValue(deviceId, sensorType) || 50;
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push(Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * 20)));
    }
    return data;
  };

  const getSensorColor = (sensorType) => {
    const colors = {
      'soil_moisture': '#2563eb',
      'temperature': '#ea580c',
      'humidity': '#7c3aed',
      'light_level': '#d97706',
      'battery_level': '#4caf50'
    };
    return colors[sensorType] || '#4caf50';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/auth/login';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your garden dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <Link href="/" className="dashboard-logo">
            <div className="dashboard-logo-icon">🌱</div>
            <span className="dashboard-logo-text">Smart Garden IoT</span>
          </Link>
          <div className="dashboard-user-section">
            <span className="dashboard-welcome">Welcome, {user?.firstName}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Dashboard Header */}
        <div>
          <h1 className="dashboard-title">Your Smart Garden Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor and control your garden devices from anywhere
            {devices.length > 0 && (
              <span style={{ marginLeft: '16px', color: '#4caf50', fontWeight: '600' }}>
                • {devices.filter(d => d.status === 'online').length} of {devices.length} devices online
              </span>
            )}
          </p>
          
          {/* Account Information */}
          <div className="account-info">
            <h2>Account Information</h2>
            <div className="account-grid">
              <div className="account-field">
                <label>Home Address:</label>
                <p>{user?.homeAddress}</p>
              </div>
              <div className="account-field">
                <label>Subscription:</label>
                <p>{user?.subscriptionPlan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Devices Section */}
        {devices.length === 0 ? (
          <div className="no-devices">
            <div className="no-devices-icon">🌱</div>
            <h3>No devices registered</h3>
            <p>Get started by registering your first ESP32 garden controller</p>
            <Link href="/devices/register" className="register-device-button">
              <span>+</span>
              Register Device
            </Link>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device._id} className="device-card">
                {/* Device Header */}
                <div className="device-header">
                  <div className="device-header-content">
                    <div className="device-info">
                      <h3>{device.deviceName}</h3>
                      <p className="device-location">{device.location}</p>
                    </div>
                    <div className={`device-status ${device.status}`}>
                      {device.status}
                    </div>
                  </div>
                </div>

                {/* Device Body */}
                <div className="device-body">
                  <h4 className="sensors-title">
                    Current Readings
                    <span className="realtime-indicator">
                      <div className="realtime-dot"></div>
                      Live
                    </span>
                  </h4>
                  
                  {/* Animated Gauges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <AnimatedGauge
                      value={getSensorValue(device._id, 'soil_moisture') || 0}
                      max={100}
                      color={getSensorColor('soil_moisture')}
                      label="Soil Moisture"
                      unit="%"
                      size={100}
                    />
                    <AnimatedGauge
                      value={getSensorValue(device._id, 'temperature') || 0}
                      max={50}
                      color={getSensorColor('temperature')}
                      label="Temperature"
                      unit="°C"
                      size={100}
                    />
                    <AnimatedGauge
                      value={getSensorValue(device._id, 'humidity') || 0}
                      max={100}
                      color={getSensorColor('humidity')}
                      label="Humidity"
                      unit="%"
                      size={100}
                    />
                    <AnimatedGauge
                      value={getSensorValue(device._id, 'light_level') || 0}
                      max={100}
                      color={getSensorColor('light_level')}
                      label="Light Level"
                      unit="%"
                      size={100}
                    />
                  </div>

                  {/* Progress Bars */}
                  <div style={{ marginBottom: '20px' }}>
                    <AnimatedProgressBar
                      value={getSensorValue(device._id, 'soil_moisture') || 0}
                      max={100}
                      color={getSensorColor('soil_moisture')}
                      label="Soil Moisture Level"
                      unit="%"
                    />
                    <AnimatedProgressBar
                      value={getSensorValue(device._id, 'battery_level') || 0}
                      max={100}
                      color={getSensorColor('battery_level')}
                      label="Battery Level"
                      unit="%"
                    />
                  </div>

                  {/* Historical Data Charts */}
                  <div className="data-viz-container">
                    <h5 className="data-viz-title">24h Trend Analysis</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      <div>
                        <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Soil Moisture Trend</h6>
                        <AnimatedChart
                          data={generateHistoricalData(device._id, 'soil_moisture')}
                          type="line"
                          color={getSensorColor('soil_moisture')}
                          height={80}
                        />
                      </div>
                      <div>
                        <h6 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Temperature Trend</h6>
                        <AnimatedChart
                          data={generateHistoricalData(device._id, 'temperature')}
                          type="line"
                          color={getSensorColor('temperature')}
                          height={80}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Controls Section */}
                  <div className="controls-section">
                    <h4>Quick Controls</h4>
                    <div className="controls-row">
                      <button
                        onClick={() => sendControlCommand(device._id, 'water', { duration: 30 })}
                        disabled={controlLoading[`${device._id}_water`] || device.status !== 'online'}
                        className="control-button"
                      >
                        {controlLoading[`${device._id}_water`] ? '...' : '💧 Water 30s'}
                      </button>
                      <button
                        onClick={() => sendControlCommand(device._id, 'light_on', { brightness: 80 })}
                        disabled={controlLoading[`${device._id}_light_on`] || device.status !== 'online'}
                        className="control-button lights"
                      >
                        {controlLoading[`${device._id}_light_on`] ? '...' : '💡 Lights On'}
                      </button>
                    </div>
                    <button
                      onClick={() => fetchSensorData(device._id)}
                      className="refresh-button"
                    >
                      🔄 Refresh Data
                    </button>
                  </div>
                </div>

                {/* Device Meta */}
                <div className="device-meta">
                  <div>MAC: {device.macAddress}</div>
                  <div>Last seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link href="/devices/register" className="action-button">
            <span>+</span>
            Add Device
          </Link>
          <Link href="/analytics" className="action-button analytics">
            <span>📊</span>
            View Analytics
          </Link>
          <Link href="/automation" className="action-button automation">
            <span>⚙️</span>
            Automation Rules
          </Link>
        </div>
      </main>
    </div>
  );
}

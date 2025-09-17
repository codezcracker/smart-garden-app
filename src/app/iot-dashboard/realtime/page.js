'use client';

import { useState, useEffect, useRef } from 'react';
import '../iot-dashboard.css';

export default function RealtimeIoTDashboard() {
  const [deviceData, setDeviceData] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Stability tracking to prevent flickering
  const [stableStatus, setStableStatus] = useState('offline');
  const [statusChangeTime, setStatusChangeTime] = useState(0);
  const [consecutiveOfflineCount, setConsecutiveOfflineCount] = useState(0);
  const eventSourceRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  // Check device status with improved detection
  const checkDeviceStatus = async () => {
    try {
      const response = await fetch('/api/iot/check-status');
      const data = await response.json();
      
      if (data.success && data.devices) {
              const device = data.devices.find(d => d.deviceId === 'DB007');
        
        if (device) {
          const isOnline = device.status === 'online';
          const now = Date.now();
          
          console.log('🔍 Status Check:', { 
            deviceId: device.deviceId, 
            serverStatus: device.status, 
            isOnline,
            currentStatus: deviceStatus,
            lastSeen: device.lastSeen
          });
          
          // Debug: Force status display
          console.log('🎯 FORCING STATUS UPDATE:', device.status);
          
          // Simple and reliable status update
          if (isOnline) {
            console.log('✅ Device ONLINE');
            setDeviceStatus('online');
            setStableStatus('online');
            setConsecutiveOfflineCount(0);
            setStatusChangeTime(now);
            
            // Update connection quality
            const lastSeen = new Date(device.lastSeen);
            const timeDiff = now - lastSeen;
            
            if (timeDiff < 2000) {
              setConnectionStatus('excellent');
            } else if (timeDiff < 4000) {
              setConnectionStatus('good');
            } else if (timeDiff < 6000) {
              setConnectionStatus('poor');
            } else {
              setConnectionStatus('disconnected');
            }
          } else {
            console.log('❌ Device OFFLINE');
            setDeviceStatus('offline');
            setStableStatus('offline');
            setConnectionStatus('disconnected');
            setStatusChangeTime(now);
          }
        } else {
          console.log('❌ Device not found in database');
          setDeviceStatus('offline');
          setStableStatus('offline');
          setConnectionStatus('disconnected');
          setStatusChangeTime(Date.now());
        }
      }
    } catch (err) {
      console.error('❌ Error checking device status:', err);
      setConnectionStatus('error');
      setDeviceStatus('offline');
    }
  };

  // Fetch device data
  const fetchDeviceData = async () => {
    try {
      console.log('🔍 Fetching device data...');
      const response = await fetch('/api/iot/device-data');
      const data = await response.json();
      
      if (data.success && data.latestData.length > 0) {
        // Find data for DB007 device
        const deviceData = data.latestData.find(d => d.deviceId === 'DB007');
        if (deviceData) {
          setDeviceData(deviceData);
          setLastUpdate(new Date());
          setError(null);
          console.log('📊 FetchDeviceData: DB007 data received');
        } else {
          console.log('📊 FetchDeviceData: No DB007 data found');
          setError('No DB007 device data available');
        }
        // Don't set deviceStatus here - let checkDeviceStatus handle it
      } else {
        setError('No device data available');
        console.log('📊 FetchDeviceData: No data, setting status to OFFLINE');
        setDeviceStatus('offline');
      }
    } catch (err) {
      console.error('❌ Error fetching device data:', err);
      setError('Failed to fetch device data');
      setDeviceStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time connection
  useEffect(() => {
    // Initial data fetch
    fetchDeviceData();
    
    // Check device status immediately
    checkDeviceStatus();
    
    // Setup periodic status checks (every 1 second for ultra-fast detection)
    statusCheckIntervalRef.current = setInterval(checkDeviceStatus, 1000);
    
    // Setup Server-Sent Events for real-time updates
    setupRealtimeConnection();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  // Setup Server-Sent Events
  const setupRealtimeConnection = () => {
    try {
      eventSourceRef.current = new EventSource('/api/iot/sse');
      
      eventSourceRef.current.onopen = () => {
        console.log('✅ SSE connection opened');
        setIsRealtime(true);
        setConnectionStatus('excellent');
      };
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 SSE data received:', data);
          
          if (data.type === 'device_data') {
            setDeviceData(data.data);
            setLastUpdate(new Date(data.timestamp));
            setDeviceStatus('online');
            setError(null);
          } else if (data.type === 'device_offline') {
            console.log('📴 Device offline via SSE:', data.message);
            setError('Device is offline');
            setDeviceStatus('offline');
          }
        } catch (err) {
          console.error('❌ Error parsing SSE data:', err);
        }
      };
      
      eventSourceRef.current.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        setIsRealtime(false);
        setConnectionStatus('poor');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            setupRealtimeConnection();
          }
        }, 5000);
      };
      
    } catch (err) {
      console.error('❌ Error setting up SSE:', err);
      setIsRealtime(false);
      setConnectionStatus('error');
    }
  };

  // Get status color with better visual feedback
  const getStatusColor = () => {
    switch (deviceStatus) {
      case 'online': return '#10B981'; // Green
      case 'offline': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  // Get connection quality color
  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'excellent': return '#10B981'; // Green
      case 'good': return '#F59E0B'; // Amber
      case 'poor': return '#F97316'; // Orange
      case 'disconnected': return '#EF4444'; // Red
      case 'error': return '#6B7280'; // Gray
      default: return '#6B7280'; // Gray
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (deviceStatus) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="iot-dashboard">
        <div className="loading">
          <h2>🔄 Loading IoT Dashboard...</h2>
          <p>Connecting to device data...</p>
        </div>
      </div>
    );
  }

  if (error && !deviceData) {
    return (
      <div className="iot-dashboard">
        <div className="error">
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchDeviceData} className="retry-btn">
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="iot-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-main">
            <h1>🌱 Smart Garden IoT</h1>
            <p className="header-subtitle">Real-time Device Monitoring</p>
          </div>
          <div className="header-status">
            <div className="status-badge">
              <span className="status-icon">{getStatusIcon()}</span>
              <span className="status-text">{deviceStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        <div className="header-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Last Update:</span>
              <span className="info-value">{lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Connection:</span>
              <span 
                className="info-value connection-status"
                style={{ color: getConnectionColor() }}
              >
                {isRealtime ? 'Real-time' : 'Manual'} ({connectionStatus})
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Debug Status:</span>
              <span className="info-value" style={{ color: deviceStatus === 'online' ? '#10B981' : '#EF4444' }}>
                {deviceStatus} - {stableStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Device Status Card */}
      <div className="device-status-card">
        <div className="status-header">
          <h2>📱 Device Status</h2>
          <div 
            className="device-status-badge"
            style={{ backgroundColor: getStatusColor() }}
          >
            {getStatusIcon()} {deviceStatus.toUpperCase()}
          </div>
        </div>
        
        <div className="status-details">
          <div className="status-item">
            <span className="label">Device ID:</span>
            <span className="value">{deviceData?.deviceId || 'DB1'}</span>
          </div>
          <div className="status-item">
            <span className="label">Connection:</span>
            <span className="value" style={{ color: getConnectionColor() }}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Real-time:</span>
            <span className="value" style={{ color: isRealtime ? '#10B981' : '#EF4444' }}>
              {isRealtime ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">WiFi Signal:</span>
            <span className="value">{deviceData?.system?.wifiRSSI || 'N/A'} dBm</span>
          </div>
        </div>
      </div>

      {/* Sensor Data Card */}
      {deviceData && deviceData.sensors && (
        <div className="device-card">
          <div className="device-header">
            <h2>📊 Live Sensor Data</h2>
            <div className="device-status">
              <span 
                className="status-dot" 
                style={{ backgroundColor: getStatusColor() }}
              ></span>
              {deviceStatus.toUpperCase()}
            </div>
          </div>

          <div className="sensor-grid">
            <div className="sensor-item">
              <div className="sensor-icon">🌡️</div>
              <div className="sensor-info">
                <div className="sensor-label">Temperature</div>
                <div className="sensor-value">
                  {deviceData.sensors.temperature || 'N/A'}°C
                </div>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">💧</div>
              <div className="sensor-info">
                <div className="sensor-label">Humidity</div>
                <div className="sensor-value">
                  {deviceData.sensors.humidity || 'N/A'}%
                </div>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">☀️</div>
              <div className="sensor-info">
                <div className="sensor-label">Light Level</div>
                <div className="sensor-value">
                  {deviceData.sensors.lightLevel || 'N/A'}%
                </div>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">🌱</div>
              <div className="sensor-info">
                <div className="sensor-label">Soil Moisture</div>
                <div className="sensor-value">
                  {deviceData.sensors.soilMoisture || 'N/A'}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      {deviceData && (
        <div className="system-info">
          <h3>🔧 System Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Uptime:</span>
              <span className="info-value">
                {Math.floor((deviceData.system?.uptime || 0) / 1000)}s
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">IP Address:</span>
              <span className="info-value">{deviceData.system?.wifiIP || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">WiFi SSID:</span>
              <span className="info-value">{deviceData.system?.wifiSSID || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Seen:</span>
              <span className="info-value">
                {lastUpdate ? lastUpdate.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

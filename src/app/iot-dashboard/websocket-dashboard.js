'use client';

import { useState, useEffect, useRef } from 'react';
import './iot-dashboard.css';

export default function WebSocketDashboard() {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const wsRef = useRef(null);

  // Fetch device data
  const fetchDeviceData = async () => {
    try {
      console.log('🔍 Fetching initial device data...');
      const response = await fetch('/api/iot/device-data');
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      
      if (data.success && data.latestData.length > 0) {
        console.log('✅ Setting device data:', data.latestData[0]);
        setDeviceData(data.latestData[0]);
        setLastUpdate(new Date());
        setError(null);
      } else {
        console.log('⚠️ No device data available');
        setError('No device data available');
      }
    } catch (err) {
      console.error('❌ Error fetching device data:', err);
      setError('Failed to fetch device data');
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket connection
  useEffect(() => {
    // Initial data fetch
    fetchDeviceData();
    
    // Setup WebSocket connection
    setupWebSocket();
    
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Debug: Track deviceData changes
  useEffect(() => {
    console.log('🔄 Device data changed:', deviceData);
  }, [deviceData]);

  // Setup WebSocket connection
  const setupWebSocket = () => {
    try {
      console.log('🔧 Setting up WebSocket connection...');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/iot/websocket`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('📡 WebSocket connection opened');
        setIsRealtime(true);
        setError(null);
        
        // Send dashboard connection message
        ws.send(JSON.stringify({
          type: 'dashboard_connect',
          timestamp: new Date().toISOString()
        }));
      };
      
      ws.onmessage = (event) => {
        console.log('📨 WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('📊 Parsed WebSocket data:', data);
          
          if (data.type === 'device_data' && data.data) {
            console.log('✅ Updating device data:', data.data);
            setDeviceData(data.data);
            setLastUpdate(new Date());
            setError(null);
          } else if (data.type === 'device_online') {
            console.log('🟢 Device came online:', data.deviceId);
          } else if (data.type === 'device_offline') {
            console.log('🔴 Device went offline:', data.deviceId);
          } else if (data.type === 'connection') {
            console.log('🔗 Connection message:', data.message);
          }
        } catch (parseError) {
          console.error('❌ Error parsing WebSocket data:', parseError);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsRealtime(false);
        setError('WebSocket connection error. Falling back to manual refresh.');
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        setIsRealtime(false);
        setError('WebSocket connection lost. Attempting to reconnect...');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            setupWebSocket();
          }
        }, 5000);
      };
      
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      setIsRealtime(false);
      
      // Fallback to polling every 30 seconds
      const interval = setInterval(fetchDeviceData, 30000);
      return () => clearInterval(interval);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Get signal quality
  const getSignalQuality = (rssi) => {
    if (rssi >= -50) return { text: 'Excellent', color: '#4caf50' };
    if (rssi >= -60) return { text: 'Good', color: '#8bc34a' };
    if (rssi >= -70) return { text: 'Fair', color: '#ff9800' };
    if (rssi >= -80) return { text: 'Weak', color: '#ff5722' };
    return { text: 'Very Weak', color: '#f44336' };
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'offline': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <div className="iot-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <h2>Loading IoT Dashboard...</h2>
          <p>Connecting to devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="iot-dashboard">
        <div className="error">
          <h2>❌ Connection Error</h2>
          <p>{error}</p>
          <button onClick={fetchDeviceData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!deviceData) {
    console.log('⚠️ No device data, showing loading state. Loading:', loading, 'Error:', error);
    return (
      <div className="iot-dashboard">
        <div className="no-data">
          <h2>📡 No Device Data</h2>
          <p>No IoT devices are currently connected.</p>
          <p>Make sure your ESP8266 is running and connected to WiFi.</p>
          <p>Debug: Loading={loading ? 'true' : 'false'}, Error={error || 'none'}</p>
        </div>
      </div>
    );
  }

  const signalQuality = getSignalQuality(deviceData.system?.wifiRSSI);

  return (
    <div className="iot-dashboard">
      <div className="dashboard-header">
        <h1>🌱 Smart Garden IoT Dashboard (WebSocket)</h1>
        <div className="header-info">
          <div className="last-update">
            Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}
          </div>
          <div className="connection-status">
            <span className={`status-indicator ${isRealtime ? 'online' : 'offline'}`}></span>
            <span>{isRealtime ? 'WebSocket Connected' : 'Manual Refresh'}</span>
          </div>
        </div>
      </div>

      {/* Single Device Card */}
      <div className="device-card">
        <div className="device-header">
          <div className="device-title">
            <h2>🌱 Smart Garden Device</h2>
            <div className="device-id">ID: {deviceData.deviceId}</div>
          </div>
          <div className="device-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(deviceData.system?.isOffline ? 'offline' : (deviceData.system?.wifiConnected ? 'online' : 'offline')) }}
            >
              {deviceData.system?.isOffline ? 'Offline' : (deviceData.system?.wifiConnected ? 'Online' : 'Offline')}
            </span>
            <span className="system-status">
              {deviceData.system?.isOffline ? '🔴 Disconnected' : (deviceData.system?.systemActive ? '🟢 Active' : '🟡 Paused')}
            </span>
          </div>
        </div>

        <div className="device-content">
          {/* Connection Info */}
          <div className="connection-section">
            <h3>📡 Connection</h3>
            <div className="connection-grid">
              <div className="connection-item">
                <span className="label">Network:</span>
                <span className="value">{deviceData.system?.wifiSSID || 'N/A'}</span>
              </div>
              <div className="connection-item">
                <span className="label">IP Address:</span>
                <span className="value">{deviceData.system?.wifiIP || 'N/A'}</span>
              </div>
              <div className="connection-item">
                <span className="label">Signal:</span>
                <span className="value">
                  {deviceData.system?.wifiRSSI} dBm
                  <span 
                    className="signal-quality"
                    style={{ color: signalQuality.color }}
                  >
                    ({signalQuality.text})
                  </span>
                </span>
              </div>
              <div className="connection-item">
                <span className="label">Uptime:</span>
                <span className="value">
                  {deviceData.system?.isOffline ? 
                    `Offline for ${Math.floor((deviceData.system?.timeSinceLastSeen || 0) / 1000 / 60)} minutes` :
                    `${Math.floor((deviceData.system?.uptime || 0) / 1000 / 60)} minutes`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Sensor Data */}
          <div className="sensors-section">
            <h3>🌡️ Sensor Data</h3>
            {deviceData.sensors?.temperature !== null && deviceData.sensors?.temperature !== undefined ? (
              <div className="sensors-grid">
                <div className="sensor-item">
                  <div className="sensor-icon">🌡️</div>
                  <div className="sensor-info">
                    <div className="sensor-label">Temperature</div>
                    <div className="sensor-value">
                      {deviceData.sensors?.temperature?.toFixed(1)}°C
                    </div>
                  </div>
                </div>
                <div className="sensor-item">
                  <div className="sensor-icon">💧</div>
                  <div className="sensor-info">
                    <div className="sensor-label">Humidity</div>
                    <div className="sensor-value">
                      {deviceData.sensors?.humidity?.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="sensor-item">
                  <div className="sensor-icon">☀️</div>
                  <div className="sensor-info">
                    <div className="sensor-label">Light Level</div>
                    <div className="sensor-value">
                      {deviceData.sensors?.lightLevel}
                    </div>
                  </div>
                </div>
                <div className="sensor-item">
                  <div className="sensor-icon">🌱</div>
                  <div className="sensor-info">
                    <div className="sensor-label">Soil Moisture</div>
                    <div className="sensor-value">
                      {deviceData.sensors?.soilMoisture}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-sensors">
                <div className="no-sensors-icon">🔌</div>
                <div className="no-sensors-text">
                  <h4>No Sensors Connected</h4>
                  <p>Sensors will appear here when your ESP8266 hardware is connected and sending real data.</p>
                  <div className="sensor-status">
                    <span className="status-indicator offline"></span>
                    <span>Hardware not connected</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control Info */}
          <div className="control-section">
            <h3>🎛️ Control & Status</h3>
            <div className="control-grid">
              <div className="control-item">
                <span className="label">Button Status:</span>
                <span className="value">
                  {deviceData.sensors?.buttonPressed !== null && deviceData.sensors?.buttonPressed !== undefined ? 
                    (deviceData.sensors?.buttonPressed ? '🔴 Pressed' : '⚪ Released') : 
                    'N/A - Hardware not connected'
                  }
                </span>
              </div>
              <div className="control-item">
                <span className="label">Data Timestamp:</span>
                <span className="value">
                  {formatTime(deviceData.timestamp)}
                </span>
              </div>
              <div className="control-item">
                <span className="label">Received At:</span>
                <span className="value">
                  {formatTime(deviceData.receivedAt)}
                </span>
              </div>
              <div className="control-item">
                <span className="label">Errors:</span>
                <span className="value">{deviceData.system?.errorCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={fetchDeviceData} className="refresh-btn">
          🔄 Refresh Data
        </button>
        <div className="refresh-info">
          {isRealtime ? (
            <span>🟢 WebSocket real-time updates active</span>
          ) : (
            <span>🟡 Manual refresh mode</span>
          )}
        </div>
      </div>
    </div>
  );
}



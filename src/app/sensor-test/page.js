'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering (no static caching)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SensorTestPage() {
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchSensorData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSensorData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await fetch('/api/sensor-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSensorData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatDeviceTimestamp = (deviceTimestamp) => {
    if (!deviceTimestamp) return 'N/A';
    // Convert milliseconds to seconds for display
    const seconds = Math.floor(deviceTimestamp / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="sensor-test-container">
      <div className="header">
        <h1>🌱 Sensor Data Test Page</h1>
        <p>Real-time sensor data from all IoT devices (No authentication required)</p>
        <div className="status-bar">
          <span className={`status ${isLoading ? 'loading' : 'ready'}`}>
            {isLoading ? '⏳ Loading...' : '✅ Ready'}
          </span>
          {lastUpdate && (
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button onClick={fetchSensorData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ Error: {error}
        </div>
      )}

      <div className="data-section">
        <h2>📊 Real-Time Sensor Data</h2>
        {sensorData.length === 0 ? (
          <div className="no-data">
            <p>No sensor data available. Make sure your ESP8266 device is connected and sending data.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="sensor-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Time</th>
                  <th>🌡️ Temp</th>
                  <th>💧 Humidity</th>
                  <th>🌱 Moisture</th>
                  <th>💡 Light</th>
                  <th>📶 WiFi</th>
                  <th>🔌 System</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.map((data, index) => (
                  <tr key={index} className={index === 0 ? 'latest-row' : ''}>
                    <td className="device-id">{data.deviceId || 'Unknown'}</td>
                    <td className="timestamp">
                      <div className="time-main">{formatTimestamp(data.receivedAt)}</div>
                      <div className="time-device">Device: {formatDeviceTimestamp(data.timestamp)}</div>
                    </td>
                    <td className="sensor-value">
                      {data.temperature !== undefined ? `${data.temperature}°C` : 'N/A'}
                    </td>
                    <td className="sensor-value">
                      {data.humidity !== undefined ? `${data.humidity}%` : 'N/A'}
                    </td>
                    <td className="sensor-value moisture">
                      {data.soilMoisture !== undefined ? `${data.soilMoisture}%` : 'N/A'}
                    </td>
                    <td className="sensor-value light">
                      {data.lightLevel !== undefined ? `${data.lightLevel}%` : 'N/A'}
                    </td>
                    <td className="sensor-value wifi">
                      {data.wifiRSSI !== undefined ? `${data.wifiRSSI} dBm` : 'N/A'}
                    </td>
                    <td className="sensor-value system">
                      {data.systemActive !== undefined ? (data.systemActive ? 'ON' : 'OFF') : 'N/A'}
                    </td>
                    <td className="status">
                      <span className={`status-badge ${data.status === 'online' ? 'online' : 'offline'}`}>
                        {data.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .sensor-test-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
          border-radius: 12px;
        }

        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
        }

        .header p {
          margin: 0 0 20px 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .status-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .status {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status.loading {
          background: #ff9800;
          color: white;
        }

        .status.ready {
          background: #4caf50;
          color: white;
        }

        .last-update {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #f44336;
        }

        .data-section h2 {
          color: #2e7d32;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          background: #f5f5f5;
          border-radius: 8px;
          color: #666;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .sensor-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .sensor-table thead {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          color: white;
        }

        .sensor-table th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sensor-table tbody tr {
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }

        .sensor-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .sensor-table tbody tr.latest-row {
          background-color: #e8f5e8;
          border-left: 4px solid #4caf50;
        }

        .sensor-table tbody tr.latest-row:hover {
          background-color: #d4edda;
        }

        .sensor-table td {
          padding: 12px;
          vertical-align: middle;
        }

        .device-id {
          font-weight: 600;
          color: #2e7d32;
          font-family: 'Courier New', monospace;
        }

        .timestamp {
          min-width: 180px;
        }

        .time-main {
          font-weight: 600;
          color: #424242;
          font-size: 0.85rem;
        }

        .time-device {
          font-size: 0.75rem;
          color: #666;
          margin-top: 2px;
        }

        .sensor-value {
          text-align: center;
          font-weight: 600;
          font-family: 'Courier New', monospace;
        }

        .sensor-value.moisture {
          color: #1976d2;
        }

        .sensor-value.light {
          color: #ff9800;
        }

        .sensor-value.wifi {
          color: #9c27b0;
        }

        .sensor-value.system {
          color: #ff5722;
          font-weight: 700;
        }

        .status {
          text-align: center;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.online {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.offline {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        @media (max-width: 768px) {
          .table-container {
            overflow-x: auto;
          }
          
          .sensor-table {
            min-width: 600px;
          }
          
          .sensor-table th,
          .sensor-table td {
            padding: 8px 6px;
            font-size: 0.8rem;
          }
          
          .status-bar {
            flex-direction: column;
            gap: 10px;
          }
          
          .time-main {
            font-size: 0.75rem;
          }
          
          .time-device {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}

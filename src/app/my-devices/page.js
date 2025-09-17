'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/components/NotificationProvider';
import './my-devices.css';

export default function MyDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  // Test notification function
  const testNotification = () => {
    console.log('🧪 Testing notification...');
    showToast('success', 'Test notification working!', 3000);
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceStatuses, setDeviceStatuses] = useState({});
  const [previousDeviceStatuses, setPreviousDeviceStatuses] = useState({});
  const [notificationCooldowns, setNotificationCooldowns] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    gardenId: '',
    location: '',
    description: '',
    temperatureEnabled: true,
    humidityEnabled: true,
    lightLevelEnabled: true,
    soilMoistureEnabled: true,
    sendInterval: 1000
  });

  const [gardens, setGardens] = useState([]);

  useEffect(() => {
    fetchDevices();
    fetchGardens();
    fetchDeviceStatuses();
    
        // Update device statuses every 1 second for instant detection
        const interval = setInterval(fetchDeviceStatuses, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // For testing - no authentication required
      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.devices) {
        setDevices(data.devices);
        console.log('📱 Fetched devices:', data.devices);
        console.log('📱 Device IDs from user-devices API:', data.devices.map(d => d.deviceId));
      } else {
        console.log('📱 No devices found or API error:', data);
        setDevices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching devices:', error);
      setDevices([]);
      showToast('error', 'Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGardens = async () => {
    try {
      // For testing - no authentication required
      const response = await fetch('/api/iot/gardens', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.gardens) {
        setGardens(data.gardens);
        console.log('🌱 Fetched gardens:', data.gardens);
      } else {
        console.log('🌱 No gardens found:', data);
        setGardens([]);
      }
    } catch (error) {
      console.error('❌ Error fetching gardens:', error);
      setGardens([]);
      showToast('error', 'Failed to load gardens. Please try again.');
    }
  };

  const fetchDeviceStatuses = async () => {
    try {
      const response = await fetch('/api/iot/check-status');
      const data = await response.json();
      
      if (data.success && data.devices) {
        const statusMap = {};
        data.devices.forEach(device => {
          statusMap[device.deviceId] = {
            status: device.status,
            lastSeen: device.lastSeen,
            wifiRSSI: device.wifiRSSI,
            connectionQuality: device.connectionQuality
          };
        });
        // Check for connection status changes
        Object.keys(statusMap).forEach(deviceId => {
          const currentStatus = statusMap[deviceId].status;
          const previousStatus = previousDeviceStatuses[deviceId]?.status;
          const lastNotificationTime = notificationCooldowns[deviceId];
          const now = Date.now();
          
          console.log('🔍 Status check:', { deviceId, currentStatus, previousStatus, lastNotificationTime });
          
          // Show notification for status changes (with 5 second cooldown)
          if (previousStatus !== currentStatus && 
              (!lastNotificationTime || (now - lastNotificationTime) > 5000)) {
            
            const device = devices.find(d => d.deviceId === deviceId);
            const deviceName = device?.deviceName || deviceId;
            
            console.log('📢 Status change detected:', { 
              deviceId, 
              deviceName, 
              from: previousStatus, 
              to: currentStatus,
              deviceFound: !!device,
              totalDevices: devices.length
            });
            
            // Update cooldown timestamp
            setNotificationCooldowns(prev => ({
              ...prev,
              [deviceId]: now
            }));
            
            if (currentStatus === 'online') {
              console.log('🔗 Showing connection notification');
              showToast('success', `🔗 ${deviceName} connected!`, 4000);
            } else if (currentStatus === 'offline') {
              console.log('🔌 Showing disconnection notification');
              showToast('warning', `🔌 ${deviceName} disconnected!`, 4000);
            }
          }
        });
        
        // Update states
        setPreviousDeviceStatuses(deviceStatuses);
        setDeviceStatuses(statusMap);
        console.log('📱 Device statuses updated:', statusMap);
        console.log('📱 Available devices in status data:', Object.keys(statusMap));
        console.log('📱 Previous device statuses:', previousDeviceStatuses);
      }
    } catch (error) {
      console.error('❌ Error fetching device statuses:', error);
    }
  };

  const setupSampleDevice = async () => {
    try {
      console.log('🚀 Setting up sample device...');
      
      const response = await fetch('/api/iot/setup-sample-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      console.log('📡 Setup API Response:', responseData);

      if (response.ok && responseData.success) {
        showToast('success', 'Sample device (DB007) created successfully! You can now download the ESP8266 code.');
        fetchDevices(); // Refresh the device list
      } else {
        console.error('❌ Setup failed:', responseData);
        showToast('error', `Error setting up sample device: ${responseData.error || responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error setting up sample device:', error);
      showToast('error', 'Error setting up sample device: ' + error.message);
    }
  };

  const handleAddDevice = () => {
    setFormData({
      deviceId: '',
      deviceName: '',
      gardenId: '',
      location: '',
      description: '',
      temperatureEnabled: true,
      humidityEnabled: true,
      lightLevelEnabled: true,
      soilMoistureEnabled: true,
      sendInterval: 1000
    });
    setEditingDevice(null);
    setShowAddForm(true);
  };

  const handleEditDevice = (device) => {
    setFormData({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      gardenId: device.gardenId,
      location: device.location,
      description: device.description,
      temperatureEnabled: device.sensors.temperature.enabled,
      humidityEnabled: device.sensors.humidity.enabled,
      lightLevelEnabled: device.sensors.lightLevel.enabled,
      soilMoistureEnabled: device.sensors.soilMoisture.enabled,
      sendInterval: device.settings.sendInterval
    });
    setEditingDevice(device);
    setShowAddForm(true);
  };

  const handleSaveDevice = async () => {
    try {
      console.log('💾 Saving device data:', formData);
      
      // For testing - no authentication required
      const response = await fetch('/api/iot/user-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchDevices();
        showToast('success', 'Device configuration saved successfully!');
      } else {
        console.error('❌ Save failed:', responseData);
        showToast('error', `Error saving device configuration: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving device:', error);
      showToast('error', 'Error saving device configuration: ' + error.message);
    }
  };

  const handleUpdateDevice = async () => {
    try {
      console.log('💾 Updating device data:', formData);
      
      // For testing - no authentication required
      const response = await fetch('/api/iot/device-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchDevices();
        showToast('success', 'Device configuration updated successfully!');
      } else {
        console.error('❌ Update failed:', responseData);
        showToast('error', `Error updating device configuration: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating device:', error);
      showToast('error', 'Error updating device configuration: ' + error.message);
    }
  };

  const generateDeviceCode = (device) => {
    const code = `/*
 * Smart Garden IoT - Device: ${device.deviceName}
 * Generated on: ${new Date().toLocaleDateString()}
 * 
 * This code will automatically fetch configuration from MongoDB
 * No need to modify this code for configuration changes!
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// This device will fetch ALL configuration from MongoDB
// Device ID: ${device.deviceId}
// Owner: Your Account

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 Smart Garden IoT - MongoDB Configuration");
  Serial.println("Device ID: ${device.deviceId}");
  Serial.println("==========================================");
  
  // Load configuration from MongoDB
  loadDeviceConfiguration();
  
  // Connect to WiFi and start data transmission
  connectToWiFi();
  testServerConnection();
  
  Serial.println("🚀 Starting data transmission...");
}

void loop() {
  // Main loop - configuration will be fetched automatically
  // This code handles everything dynamically!
}

// The rest of the code will be the same as MongoDB_Config_ESP8266.ino
// This is just the setup portion showing your device configuration`;

    // Create a blob and download
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartGarden_${device.deviceId}_Setup.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'inactive': return '⚪';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getDeviceStatus = (deviceId) => {
    const deviceStatus = deviceStatuses[deviceId];
    const status = deviceStatus?.status || 'unknown';
    console.log('🔍 Device Status Check:', { deviceId, deviceStatus, status });
    return status;
  };

  const getDeviceConnectionQuality = (deviceId) => {
    const deviceStatus = deviceStatuses[deviceId];
    return deviceStatus?.connectionQuality || 'unknown';
  };

  if (loading) {
    return (
      <div className="my-devices-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-devices-page">
      <div className="page-header">
        <h1>📱 My IoT Devices</h1>
        <p>Manage your Smart Garden IoT devices</p>
      </div>

      <div className="devices-section">
        <div className="section-header">
          <h2>Your Devices ({devices.length})</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={testNotification}
              style={{ backgroundColor: '#f59e0b', color: 'white' }}
            >
              🧪 Test Notification
            </button>
            <button 
              className="btn btn-secondary"
              onClick={setupSampleDevice}
            >
              🚀 Setup Sample Device
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAddDevice}
            >
              ➕ Add Device
            </button>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h3>No devices registered</h3>
            <p>Add your first Smart Garden IoT device to get started</p>
            <button 
              className="btn btn-primary"
              onClick={handleAddDevice}
            >
              Add Device
            </button>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device.deviceId} className="device-card">
                <div className="device-header">
                  <div className="device-info">
                    <h3>{device.deviceName}</h3>
                    <p className="device-id">ID: {device.deviceId}</p>
                  </div>
                  <div className="device-status">
                    <span 
                      className="status-indicator"
                      style={{ color: getStatusColor(getDeviceStatus(device.deviceId)) }}
                    >
                      {getStatusIcon(getDeviceStatus(device.deviceId))} {getDeviceStatus(device.deviceId).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="device-details">
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{device.location || 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Seen:</span>
                    <span className="value">
                      {deviceStatuses[device.deviceId]?.lastSeen ? 
                        new Date(deviceStatuses[device.deviceId].lastSeen).toLocaleString() : 
                        'Never'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">WiFi Signal:</span>
                    <span className="value">{deviceStatuses[device.deviceId]?.wifiRSSI || 'N/A'} dBm</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Connection:</span>
                    <span className="value" style={{ 
                      color: getDeviceConnectionQuality(device.deviceId) === 'excellent' ? '#10b981' : 
                             getDeviceConnectionQuality(device.deviceId) === 'good' ? '#f59e0b' :
                             getDeviceConnectionQuality(device.deviceId) === 'poor' ? '#f97316' : '#ef4444'
                    }}>
                      {getDeviceConnectionQuality(device.deviceId).toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Config Version:</span>
                    <span className="value">{device.configVersion || 'N/A'}</span>
                  </div>
                </div>

                <div className="device-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditDevice(device)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => generateDeviceCode(device)}
                  >
                    📥 Download Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingDevice ? 'Edit Device' : 'Add New Device'}</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Device ID *</label>
                <input
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                  placeholder="e.g., DB001, DB002"
                  disabled={editingDevice}
                />
              </div>

              <div className="form-group">
                <label>Device Name *</label>
                <input
                  type="text"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  placeholder="e.g., Garden Sensor 1"
                />
              </div>

              <div className="form-group">
                <label>Garden *</label>
                <select
                  value={formData.gardenId}
                  onChange={(e) => setFormData({...formData, gardenId: e.target.value})}
                  required
                >
                  <option value="">Select a garden...</option>
                  {gardens.map((garden) => (
                    <option key={garden.gardenId} value={garden.gardenId}>
                      {garden.gardenName} ({garden.location})
                    </option>
                  ))}
                </select>
                {gardens.length === 0 && (
                  <p className="form-help">
                    No gardens found. <a href="/garden-config">Create a garden first</a>.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Living Room, Balcony"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Device description..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <div className="form-info">
                  <p>📶 WiFi settings are configured at the garden level. Devices will automatically use the garden's WiFi configuration.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Send Interval (ms)</label>
                <input
                  type="number"
                  value={formData.sendInterval}
                  onChange={(e) => setFormData({...formData, sendInterval: parseInt(e.target.value)})}
                  placeholder="1000"
                />
              </div>

              <div className="form-group">
                <label>Enabled Sensors</label>
                <div className="sensor-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.temperatureEnabled}
                      onChange={(e) => setFormData({...formData, temperatureEnabled: e.target.checked})}
                    />
                    🌡️ Temperature
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.humidityEnabled}
                      onChange={(e) => setFormData({...formData, humidityEnabled: e.target.checked})}
                    />
                    💧 Humidity
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.lightLevelEnabled}
                      onChange={(e) => setFormData({...formData, lightLevelEnabled: e.target.checked})}
                    />
                    ☀️ Light Level
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.soilMoistureEnabled}
                      onChange={(e) => setFormData({...formData, soilMoistureEnabled: e.target.checked})}
                    />
                    🌱 Soil Moisture
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={editingDevice ? handleUpdateDevice : handleSaveDevice}
              >
                {editingDevice ? 'Update Device' : 'Add Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

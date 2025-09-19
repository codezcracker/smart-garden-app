'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/components/NotificationProvider';
import './my-devices.css';

export default function MyDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotifications();

  // Device Discovery Functions
  const startDeviceScan = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    
    try {
      const response = await fetch('/api/iot/device-discovery');
      const data = await response.json();
      
      if (data.success) {
        setDiscoveredDevices(data.devices);
        
        // Show summary in notification
        const total = data.summary?.total || data.devices.length;
        
        if (total > 0) {
          showToast('success', `Found ${total} device${total !== 1 ? 's' : ''} available for pairing`, 4000);
        } else {
          showToast('info', 'No devices found in discovery mode', 3000);
        }
      } else {
        showToast('error', 'Failed to scan for devices', 3000);
      }
    } catch (error) {
      console.error('Device scan error:', error);
      showToast('error', 'Error scanning for devices', 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const pairDevice = async (discoveryDevice) => {
    try {
      const deviceId = `DB${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const deviceName = `${discoveryDevice.deviceType} ${deviceId}`;
      
      // Start pairing process
      setPairingDevice(discoveryDevice.id);
      setPairingStatus('Connecting...');
      showToast('info', `Pairing device ${deviceName}...`, 2000);
      
      const response = await fetch('/api/iot/device-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discoveryId: discoveryDevice.id,
          deviceId: deviceId,
          deviceName: deviceName,
          userId: 'demo-user-123'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPairingStatus('Device Connected! ✅');
        showToast('success', `Device ${deviceName} connected successfully!`, 4000);
        
        // Wait 2 seconds then refresh
        setTimeout(() => {
          fetchDevices();
          setDiscoveredDevices([]);
          setPairingDevice(null);
          setPairingStatus('');
        }, 2000);
      } else {
        setPairingStatus('Connection Failed ❌');
        showToast('error', `Failed to pair device: ${data.error}`, 4000);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setPairingDevice(null);
          setPairingStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('Pairing error:', error);
      setPairingStatus('Connection Error ❌');
      showToast('error', 'Error pairing device', 4000);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setPairingDevice(null);
        setPairingStatus('');
      }, 3000);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceStatuses, setDeviceStatuses] = useState({});
  const [previousDeviceStatuses, setPreviousDeviceStatuses] = useState({});
  const [notificationCooldowns, setNotificationCooldowns] = useState({});
  
  // Device Discovery States
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [pairingStates, setPairingStates] = useState({}); // Track pairing states for each device

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

  const fetchDevices = useCallback(async () => {
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
        // console.log('📱 Fetched devices:', data.devices);
        // console.log('📱 Device IDs from user-devices API:', data.devices.map(d => d.deviceId));
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
  }, [showToast]);

  const fetchGardens = useCallback(async () => {
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
        // console.log('🌱 Fetched gardens:', data.gardens);
      } else {
        console.log('🌱 No gardens found:', data);
        setGardens([]);
      }
    } catch (error) {
      console.error('❌ Error fetching gardens:', error);
      setGardens([]);
      showToast('error', 'Failed to load gardens. Please try again.');
    }
  }, [showToast]);

  const fetchDeviceStatuses = useCallback(async () => {
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
        // Check for connection status changes - ONLY for devices that belong to this user
        Object.keys(statusMap).forEach(deviceId => {
          const currentStatus = statusMap[deviceId].status;
          const previousStatus = previousDeviceStatuses[deviceId]?.status;
          const lastNotificationTime = notificationCooldowns[deviceId];
          const now = Date.now();
          
          // ONLY show notifications for devices that exist in the user's device list
          const device = devices.find(d => d.deviceId === deviceId);
          if (!device) {
          // console.log('🔇 Skipping notification for device not owned by user:', deviceId);
          // console.log('🔍 Available user devices:', devices.map(d => d.deviceId));
            return; // Skip devices that don't belong to this user
          }
          
          // console.log('🔍 Status check (user device):', { deviceId, currentStatus, previousStatus, lastNotificationTime });
          
          if (previousStatus !== undefined && 
              previousStatus !== currentStatus && 
              (!lastNotificationTime || (now - lastNotificationTime) > 5000)) {
            
            const deviceName = device.deviceName || deviceId;
            
            console.log('📢 Status change detected (user device):', { 
              deviceId, 
              deviceName, 
              from: previousStatus, 
              to: currentStatus
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
        // console.log('📱 Device statuses updated:', statusMap);
        // console.log('📱 Available devices in status data:', Object.keys(statusMap));
        // console.log('📱 Previous device statuses:', previousDeviceStatuses);
      }
    } catch (error) {
      console.error('❌ Error fetching device statuses:', error);
    }
  }, [devices, previousDeviceStatuses, notificationCooldowns, showToast]);

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
    // console.log('🔍 Device Status Check:', { deviceId, deviceStatus, status });
    return status;
  };

  const getDeviceConnectionQuality = (deviceId) => {
    const deviceStatus = deviceStatuses[deviceId];
    return deviceStatus?.connectionQuality || 'unknown';
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchDevices();
    fetchGardens();
    fetchDeviceStatuses();
    
    // Update device statuses every 5 seconds to reduce load
    const interval = setInterval(fetchDeviceStatuses, 5000);
    return () => clearInterval(interval);
  }, [fetchDevices, fetchGardens, fetchDeviceStatuses]);

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
            {/* Removed test notification button */}
            <button 
              className="btn btn-secondary"
              onClick={setupSampleDevice}
            >
              🚀 Setup Sample Device
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowDiscovery(true)}
              style={{ backgroundColor: '#3b82f6', color: 'white' }}
            >
              🔍 Scan for Devices
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleAddDevice}
            >
              ➕ Add Device Manually
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
                  <p>📶 WiFi settings are configured at the garden level. Devices will automatically use the garden&apos;s WiFi configuration.</p>
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

      {/* Device Discovery Modal */}
      {showDiscovery && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>🔍 Device Discovery</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDiscovery(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Scan for nearby Smart Garden devices that are in discovery mode.</p>
              
              <div style={{ marginBottom: '20px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={startDeviceScan}
                  disabled={isScanning}
                  style={{ 
                    backgroundColor: '#3b82f6', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isScanning ? (
                    <>
                      <span className="spinner"></span>
                      Scanning...
                    </>
                  ) : (
                    <>
                      🔍 Start Scan
                    </>
                  )}
                </button>
              </div>

              {discoveredDevices.length > 0 && (
                <div>
                  <h3>Found Devices ({discoveredDevices.length})</h3>
                  
                  {/* Summary */}
                  <div style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    📊 Found {discoveredDevices.length} device{discoveredDevices.length !== 1 ? 's' : ''} available for pairing
                    <br />
                    🔍 All devices shown are ready to be paired
                  </div>
                  
                  <div className="device-list">
                    {discoveredDevices.map((device, index) => (
                      <div key={index} className="device-card" style={{
                        border: device.isPaired ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        backgroundColor: device.isPaired ? '#f0fdf4' : '#f9fafb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h4 style={{ margin: '0', fontSize: '16px' }}>
                                {device.deviceType}
                              </h4>
                              {device.isPaired ? (
                                <span style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>
                                  ✅ PAIRED
                                </span>
                              ) : pairingStates[device.id] === 'connecting' ? (
                                <span style={{
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>
                                  🔄 CONNECTING
                                </span>
                              ) : pairingStates[device.id] === 'connected' ? (
                                <span style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>
                                  ✅ CONNECTED
                                </span>
                              ) : (
                                <span style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'bold'
                                }}>
                                  🔍 AVAILABLE
                                </span>
                              )}
                            </div>
                            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                              Serial: {device.serialNumber}
                            </p>
                            {device.isPaired && device.deviceId && (
                              <p style={{ margin: '0', color: '#10b981', fontSize: '14px', fontWeight: '500' }}>
                                Device ID: {device.deviceId}
                              </p>
                            )}
                            <p style={{ margin: '0', color: '#6b7280', fontSize: '12px' }}>
                              Signal: {device.signalStrength} dBm
                            </p>
                          </div>
                          
                          {device.isPaired ? (
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ 
                                margin: '0 0 8px 0', 
                                color: '#10b981', 
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                Already paired
                              </p>
                              <button 
                                className="btn btn-secondary"
                                disabled
                                style={{ 
                                  backgroundColor: '#d1d5db', 
                                  color: '#9ca3af',
                                  cursor: 'not-allowed'
                                }}
                              >
                                ✅ Paired
                              </button>
                            </div>
                          ) : pairingDevice === device.id ? (
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ 
                                margin: '0 0 8px 0', 
                                color: '#3b82f6', 
                                fontSize: '14px',
                                fontWeight: '500'
                              }}>
                                {pairingStatus}
                              </p>
                              <button 
                                className="btn btn-secondary"
                                disabled
                                style={{ 
                                  backgroundColor: '#3b82f6', 
                                  color: 'white',
                                  cursor: 'not-allowed'
                                }}
                              >
                                {pairingStatus.includes('Connected') ? '✅' : pairingStatus.includes('Failed') || pairingStatus.includes('Error') ? '❌' : '🔄'} {pairingStatus}
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="btn btn-primary"
                              onClick={() => pairDevice(device)}
                              disabled={pairingStates[device.id] === 'connecting'}
                              style={{ 
                                backgroundColor: pairingStates[device.id] === 'connecting' ? '#f59e0b' : 
                                                pairingStates[device.id] === 'connected' ? '#10b981' : '#10b981', 
                                color: 'white',
                                cursor: pairingStates[device.id] === 'connecting' ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              {pairingStates[device.id] === 'connecting' ? (
                                <>
                                  <span className="loading-spinner" style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    border: '2px solid transparent',
                                    borderTop: '2px solid white',
                                    margin: '0'
                                  }}></span>
                                  Connecting...
                                </>
                              ) : pairingStates[device.id] === 'connected' ? (
                                <>
                                  ✅ Connected!
                                </>
                              ) : (
                                <>
                                  🔗 Pair Device
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {discoveredDevices.length === 0 && !isScanning && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#6b7280'
                }}>
                  <p>No devices found in discovery mode.</p>
                  <p style={{ fontSize: '14px' }}>
                    Make sure your ESP8266 is running the discovery code and within range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

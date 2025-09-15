'use client';

import { useState, useEffect } from 'react';
import './device-config.css';

export default function DeviceConfigPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    location: '',
    description: '',
    wifiSSID: '',
    wifiPassword: '',
    sensors: {
      temperature: true,
      humidity: true,
      lightLevel: true,
      soilMoisture: true
    }
  });

  useEffect(() => {
    console.log('🔧 Device Config Page: Component mounted, fetching devices...');
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/iot/devices');
      const data = await response.json();
      
      if (data.success && data.devices) {
        setDevices(data.devices);
        console.log('📱 Fetched devices:', data.devices);
      } else {
        console.log('📱 No devices found or API error:', data);
        setDevices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    setFormData({
      deviceId: '',
      deviceName: '',
      location: '',
      description: '',
      wifiSSID: 'Qureshi Deco',
      wifiPassword: '65327050',
      sensors: {
        temperature: true,
        humidity: true,
        lightLevel: true,
        soilMoisture: true
      }
    });
    setEditingDevice(null);
    setShowAddForm(true);
  };

  const handleEditDevice = (device) => {
    setFormData({
      deviceId: device.deviceId,
      deviceName: device.deviceName || device.deviceId,
      location: device.location || '',
      description: device.description || '',
      wifiSSID: device.wifiSSID || 'Qureshi Deco',
      wifiPassword: device.wifiPassword || '65327050',
      sensors: device.sensors || {
        temperature: true,
        humidity: true,
        lightLevel: true,
        soilMoisture: true
      }
    });
    setEditingDevice(device);
    setShowAddForm(true);
  };

  const handleSaveDevice = async () => {
    try {
      console.log('💾 Saving device data:', formData);
      
      const response = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchDevices();
        alert('Device configuration saved successfully!');
      } else {
        console.error('❌ Save failed:', responseData);
        alert(`Error saving device configuration: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving device:', error);
      alert('Error saving device configuration: ' + error.message);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (confirm('Are you sure you want to delete this device?')) {
      try {
        const response = await fetch(`/api/iot/devices/${deviceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchDevices();
          alert('Device deleted successfully!');
        } else {
          alert('Error deleting device');
        }
      } catch (error) {
        console.error('Error deleting device:', error);
        alert('Error deleting device');
      }
    }
  };

  const testAPI = async () => {
    try {
      console.log('🔍 Testing API connection...');
      
      // Test devices API
      const devicesResponse = await fetch('/api/iot/devices');
      const devicesData = await devicesResponse.json();
      console.log('📱 Devices API Response:', devicesData);
      
      // Test device config API
      const configResponse = await fetch('/api/iot/device-config/DB007');
      const configData = await configResponse.json();
      console.log('⚙️ Config API Response:', configData);
      
      alert(`API Test Results:\n\nDevices API: ${devicesData.success ? '✅ Working' : '❌ Failed'}\nConfig API: ${configData.success ? '✅ Working' : '❌ Failed'}\n\nCheck console for details.`);
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      alert('API Test Failed: ' + error.message);
    }
  };

  const forceConfigUpdate = async (deviceId) => {
    try {
      console.log('🔄 Forcing config update for device:', deviceId);
      
      // Send a special signal to the device to fetch new config
      const response = await fetch(`/api/iot/device-config/${deviceId}/force-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Configuration update signal sent to device! Device will fetch new config within 5 minutes.');
      } else {
        alert('Failed to send config update signal to device.');
      }
    } catch (error) {
      console.error('❌ Error forcing config update:', error);
      alert('Error sending config update signal: ' + error.message);
    }
  };

  const generateDeviceCode = (device) => {
    const code = `/*
 * Smart Garden IoT - Device: ${device.deviceName || device.deviceId}
 * Generated on: ${new Date().toLocaleDateString()}
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Configuration - Device: ${device.deviceId}
const char* ssid = "${device.wifiSSID || 'Qureshi Deco'}";
const char* password = "${device.wifiPassword || '65327050'}";
const char* deviceID = "${device.deviceId}";

// Server configuration
String serverURL = "http://192.168.68.58:3000";
String backupServerURL = "https://smart-garden-7jmdq39xs-codezs-projects.vercel.app";

// Timing
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 1000;

// Connection status
bool serverConnected = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 Smart Garden IoT - ${device.deviceName || device.deviceId}");
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✅ Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  
  // Test server connection
  testServerConnection();
  
  Serial.println("🚀 Starting data transmission...");
}

void loop() {
  if (millis() - lastSend > SEND_INTERVAL) {
    if (serverConnected) {
      sendData();
    } else {
      Serial.println("❌ Server not connected, retrying...");
      testServerConnection();
    }
    
    lastSend = millis();
  }
  
  delay(100);
}

void testServerConnection() {
  Serial.println("🔍 Testing server connection...");
  
  WiFiClient client;
  if (client.connect("192.168.68.58", 3000)) {
    serverConnected = true;
    serverURL = "http://192.168.68.58:3000";
    Serial.println("✅ Local server connected: " + serverURL);
    client.stop();
  } else {
    Serial.println("❌ Local server failed, trying deployed server...");
    serverConnected = true;
    serverURL = backupServerURL;
    Serial.println("✅ Using deployed server: " + serverURL);
  }
}

void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, reconnecting...");
    WiFi.begin(ssid, password);
    return;
  }
  
  Serial.print("📡 Sending data to " + serverURL + "... ");
  
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(5000);
  
  String url = serverURL + "/api/iot/device-data";
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON data
  DynamicJsonDocument doc(1024);
  
  // Main device info
  doc["deviceId"] = deviceID;
  doc["timestamp"] = millis();
  doc["status"] = "online";
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["systemActive"] = true;
  doc["wifiConnected"] = true;
  
  // System object
  JsonObject system = doc.createNestedObject("system");
  system["systemActive"] = true;
  system["wifiConnected"] = true;
  system["uptime"] = millis();
  system["errorCount"] = 0;
  system["wifiSSID"] = ssid;
  system["wifiIP"] = WiFi.localIP().toString();
  system["wifiRSSI"] = WiFi.RSSI();
  
  // Sensor data (simulated - replace with real sensors)
  JsonObject sensors = doc.createNestedObject("sensors");
  ${device.sensors?.temperature ? 'sensors["temperature"] = 22 + (millis() / 15000) % 8;' : '// sensors["temperature"] = disabled;'}
  ${device.sensors?.humidity ? 'sensors["humidity"] = 45 + (millis() / 12000) % 25;' : '// sensors["humidity"] = disabled;'}
  ${device.sensors?.lightLevel ? 'sensors["lightLevel"] = 60 + (millis() / 8000) % 35;' : '// sensors["lightLevel"] = disabled;'}
  ${device.sensors?.soilMoisture ? 'sensors["soilMoisture"] = 50 + (millis() / 10000) % 30;' : '// sensors["soilMoisture"] = disabled;'}
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.println("✅ " + String(httpCode));
    if (httpCode == HTTP_CODE_OK) {
      Serial.println("📊 Data transmitted successfully");
      serverConnected = true;
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpCode));
    serverConnected = false;
  }
  
  http.end();
}`;

    // Create a blob and download
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartGarden_${device.deviceId}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'warning': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="device-config-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading device configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="device-config-page">
      <div className="page-header">
        <h1>🔧 Device Configuration</h1>
        <p>Manage your Smart Garden IoT devices</p>
      </div>

      <div className="devices-section">
        <div className="section-header">
          <h2>Connected Devices ({devices.length})</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={fetchDevices}
              title="Refresh device list"
            >
              🔄 Refresh
            </button>
            <button 
              className="btn btn-info"
              onClick={testAPI}
              title="Test API connection"
            >
              🔍 Test API
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
            <h3>No devices found</h3>
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
                    <h3>{device.deviceName || device.deviceId}</h3>
                    <p className="device-id">ID: {device.deviceId}</p>
                  </div>
                  <div className="device-status">
                    <span 
                      className="status-indicator"
                      style={{ color: getStatusColor(device.status) }}
                    >
                      {getStatusIcon(device.status)} {device.status?.toUpperCase() || 'UNKNOWN'}
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
                      {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">WiFi RSSI:</span>
                    <span className="value">{device.wifiRSSI || 'N/A'} dBm</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Config Status:</span>
                    <span className="value" style={{ color: device.configLoaded ? '#10b981' : '#ef4444' }}>
                      {device.configLoaded ? '✅ Loaded' : '❌ Not Loaded'}
                    </span>
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
                  <button 
                    className="btn btn-info"
                    onClick={() => forceConfigUpdate(device.deviceId)}
                  >
                    🔄 Force Update
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteDevice(device.deviceId)}
                  >
                    🗑️ Delete
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
                <label>Device Name</label>
                <input
                  type="text"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  placeholder="e.g., Garden Sensor 1"
                />
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
                <label>WiFi SSID</label>
                <input
                  type="text"
                  value={formData.wifiSSID}
                  onChange={(e) => setFormData({...formData, wifiSSID: e.target.value})}
                  placeholder="Your WiFi network name"
                />
              </div>

              <div className="form-group">
                <label>WiFi Password</label>
                <input
                  type="password"
                  value={formData.wifiPassword}
                  onChange={(e) => setFormData({...formData, wifiPassword: e.target.value})}
                  placeholder="Your WiFi password"
                />
              </div>

              <div className="form-group">
                <label>Enabled Sensors</label>
                <div className="sensor-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sensors.temperature}
                      onChange={(e) => setFormData({
                        ...formData,
                        sensors: {...formData.sensors, temperature: e.target.checked}
                      })}
                    />
                    🌡️ Temperature
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sensors.humidity}
                      onChange={(e) => setFormData({
                        ...formData,
                        sensors: {...formData.sensors, humidity: e.target.checked}
                      })}
                    />
                    💧 Humidity
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sensors.lightLevel}
                      onChange={(e) => setFormData({
                        ...formData,
                        sensors: {...formData.sensors, lightLevel: e.target.checked}
                      })}
                    />
                    ☀️ Light Level
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.sensors.soilMoisture}
                      onChange={(e) => setFormData({
                        ...formData,
                        sensors: {...formData.sensors, soilMoisture: e.target.checked}
                      })}
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
                onClick={handleSaveDevice}
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

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
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('error', 'Please log in to pair devices');
        window.location.href = '/auth/login';
        return;
      }
      
      const response = await fetch('/api/iot/device-pairing', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          discoveryId: discoveryDevice.id,
          deviceId: deviceId,
          deviceName: deviceName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPairingStatus('Device Connected! ✅');
        showToast('success', `Device ${deviceName} connected successfully!`, 4000);
        
        // Update the discovered device to show it's paired
        setDiscoveredDevices(prev => 
          prev.map(device => 
            device.id === discoveryDevice.id 
              ? { ...device, isPaired: true, deviceId: deviceId }
              : device
          )
        );
        
        // Refresh device list but keep discovery modal open
        setTimeout(() => {
          fetchDevices();
          // Don't clear discovered devices - keep modal open to show connection status
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
  const [pairingDevice, setPairingDevice] = useState(null);
  const [pairingStatus, setPairingStatus] = useState('');

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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setDevices([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/iot/user-devices', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      
      // Handle token expiration
      if (response.status === 401 || data.error?.includes('expired') || data.error?.includes('Invalid token')) {
        console.log('⚠️ Token expired, redirecting to login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login';
        return;
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setGardens([]);
        return;
      }
      
      const response = await fetch('/api/iot/gardens', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      
      // Handle token expiration
      if (response.status === 401 || data.error?.includes('expired') || data.error?.includes('Invalid token')) {
        console.log('⚠️ Token expired, redirecting to login...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth/login';
        return;
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
        
        // Update states first
        setPreviousDeviceStatuses(deviceStatuses);
        setDeviceStatuses(statusMap);
        
        // Check for connection status changes - ONLY for devices that belong to this user
        Object.keys(statusMap).forEach(deviceId => {
          const currentStatus = statusMap[deviceId].status;
          const previousStatus = deviceStatuses[deviceId]?.status; // Use current deviceStatuses instead of previousDeviceStatuses
          const now = Date.now();
          
          // ONLY show notifications for devices that exist in the user's device list
          const device = devices.find(d => d.deviceId === deviceId);
          if (!device) {
            return; // Skip devices that don't belong to this user
          }
          
          if (previousStatus !== undefined && 
              previousStatus !== currentStatus) {
            
            const deviceName = device.deviceName || deviceId;
            
            console.log('📢 Status change detected (user device):', { 
              deviceId, 
              deviceName, 
              from: previousStatus, 
              to: currentStatus
            });
            
            if (currentStatus === 'online') {
              console.log('🔗 Showing connection notification');
              showToast('success', `🔗 ${deviceName} connected!`, 4000);
            } else if (currentStatus === 'offline') {
              console.log('🔌 Showing disconnection notification');
              showToast('warning', `🔌 ${deviceName} disconnected!`, 4000);
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching device statuses:', error);
    }
  }, [devices, deviceStatuses, showToast]);

  const setupSampleDevice = async () => {
    try {
      console.log('🚀 Setting up sample device...');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('error', 'Please log in to setup sample device');
        window.location.href = '/auth/login';
        return;
      }
      
      const response = await fetch('/api/iot/setup-sample-device', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      deviceName: device.deviceName || device.deviceId,
      gardenId: device.gardenId || '',
      location: device.location || '',
      description: device.description || '',
      temperatureEnabled: device.sensors?.temperature?.enabled !== false,
      humidityEnabled: device.sensors?.humidity?.enabled !== false,
      lightLevelEnabled: device.sensors?.lightLevel?.enabled !== false,
      soilMoistureEnabled: device.sensors?.soilMoisture?.enabled !== false,
      sendInterval: device.settings?.sendInterval || 1000
    });
    setEditingDevice(device);
    setShowAddForm(true);
  };

  const handleSaveDevice = async () => {
    try {
      console.log('💾 Saving device data:', formData);
      
      // Get authentication token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('error', 'Please log in to add devices');
        window.location.href = '/auth/login';
        return;
      }
      
      const response = await fetch('/api/iot/user-devices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        
        // Handle token expiration
        if (response.status === 401 || responseData.error?.includes('expired') || responseData.error?.includes('Invalid token')) {
          showToast('error', 'Your session has expired. Please log in again.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
          return;
        }
        
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
      
      // Get authentication token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('error', 'Please log in to update devices');
        window.location.href = '/auth/login';
        return;
      }
      
      // Transform formData to match API structure
      const updateData = {
        deviceId: formData.deviceId,
        deviceName: formData.deviceName,
        gardenId: formData.gardenId,
        location: formData.location,
        description: formData.description,
        sensors: {
          temperature: {
            enabled: formData.temperatureEnabled !== false
          },
          humidity: {
            enabled: formData.humidityEnabled !== false
          },
          lightLevel: {
            enabled: formData.lightLevelEnabled !== false
          },
          soilMoisture: {
            enabled: formData.soilMoistureEnabled !== false
          }
        },
        settings: {
          sendInterval: formData.sendInterval || 1000
        }
      };
      
      const response = await fetch('/api/iot/device-config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();
      console.log('📡 API Response:', responseData);

      if (response.ok && responseData.success) {
        setShowAddForm(false);
        fetchDevices();
        showToast('success', 'Device configuration updated successfully!');
      } else {
        console.error('❌ Update failed:', responseData);
        
        // Handle token expiration
        if (response.status === 401 || responseData.error?.includes('expired') || responseData.error?.includes('Invalid token')) {
          showToast('error', 'Your session has expired. Please log in again.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
          return;
        }
        
        showToast('error', `Error updating device configuration: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating device:', error);
      showToast('error', 'Error updating device configuration: ' + error.message);
    }
  };

  const handleDeleteDevice = async (device) => {
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete device "${device.deviceName}" (${device.deviceId})?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log('🗑️ Deleting device:', device.deviceId);
      
      // Get authentication token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        showToast('error', 'Please log in to delete devices');
        window.location.href = '/auth/login';
        return;
      }
      
      const response = await fetch(`/api/iot/user-devices?deviceId=${device.deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      console.log('📡 Delete API Response:', responseData);

      if (response.ok && responseData.success) {
        showToast('success', `Device "${device.deviceName}" deleted successfully!`);
        
        // Immediately remove from local state for instant UI update
        setDevices(prevDevices => prevDevices.filter(d => d.deviceId !== device.deviceId));
        
        // Also remove from device statuses to clear online status immediately
        setDeviceStatuses(prevStatuses => {
          const newStatuses = { ...prevStatuses };
          delete newStatuses[device.deviceId];
          return newStatuses;
        });
        
        // No delay - instant UI update!
      } else {
        console.error('❌ Delete failed:', responseData);
        
        // Handle token expiration
        if (response.status === 401 || responseData.error?.includes('expired') || responseData.error?.includes('Invalid token')) {
          showToast('error', 'Your session has expired. Please log in again.');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 2000);
          return;
        }
        
        showToast('error', `Error deleting device: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting device:', error);
      showToast('error', 'Error deleting device: ' + error.message);
    }
  };

  const generateDeviceCode = (device) => {
    // Use the production code from SmartGardenIoT/SmartGardenESP8266_PRODUCTION/SmartGardenESP8266_PRODUCTION.ino
    const code = `

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <EEPROM.h>

// ========================================
// PRODUCTION CONFIGURATION
// ========================================

// WiFi Configuration - CHANGE THESE FOR PRODUCTION
const char* ssid = "YOUR_WIFI_SSID";  // CHANGE THIS!
const char* password = "YOUR_WIFI_PASSWORD";  // CHANGE THIS!

// Server Configuration - CHANGE TO YOUR PRODUCTION SERVER
const char* serverURL = "https://smart-garden-app.vercel.app";  // Use HTTPS for production
const char* serverEndpoint = "/api/sensor-data";

// Production Optimizations
#define DATA_SEND_INTERVAL_SECONDS 10  // 10 seconds for production (battery life)
#define MAX_RETRY_ATTEMPTS 3
#define RETRY_DELAY 5000  // 5 seconds
#define CONNECTION_TIMEOUT 10000  // 10 seconds

// Device Configuration
const char* deviceId = "${device.deviceId}";
const char* deviceName = "${device.deviceName || device.deviceId}";
const char* firmwareVersion = "2.0.0";

// Pin Definitions (Current Working Configuration)
#define RGB_RED 16       // D0 = GPIO16 = Red LED
#define RGB_GREEN 5      // D1 = GPIO5 = Green LED
#define RGB_BLUE 4       // D2 = GPIO4 = Blue LED
#define BUTTON_PIN 0     // D3 = GPIO0 = Button
#define DHT_PIN 2        // D4 = GPIO2 = DHT11
#define MOISTURE_PIN 14  // D5 = GPIO14 = Moisture Sensor
#define LDR_PIN A0       // A0 = LDR (Light Sensor)

// Sensor Configuration
#define DHT_TYPE DHT11
#define MOISTURE_DRY_THRESHOLD 300
#define MOISTURE_WET_THRESHOLD 700
#define LDR_DARK_THRESHOLD 200
#define LDR_BRIGHT_THRESHOLD 800

// System Configuration
#define ENABLE_HTTP_SENDING true
#define ENABLE_SERIAL_DEBUG true
#define ENABLE_LED_INDICATORS true
#define ENABLE_DEEP_SLEEP false  // Set to true for battery operation

// ========================================
// GLOBAL VARIABLES
// ========================================

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient client;
WiFiClientSecure secureClient;
unsigned long lastDataSend = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastButtonPress = 0;
bool systemActive = true;
int retryCount = 0;

// EEPROM addresses
#define EEPROM_SIZE 512
#define SYSTEM_STATE_ADDR 0
#define DEVICE_ID_ADDR 10

// ========================================
// SETUP FUNCTION
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\\n🌱 Smart Garden IoT - Production Firmware v2.0.0");
  Serial.println("================================================");
  
  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  loadDeviceState();
  
  // Initialize pins
  initializePins();
  
  // Initialize sensors
  initializeSensors();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Test hardware
  testHardware();
  
  Serial.println("✅ System initialized successfully");
  Serial.println("📡 Ready for production operation");
  Serial.println("================================================");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Handle button press
  handleButtonPress();
  
  // Send sensor data at configured intervals
  if (ENABLE_HTTP_SENDING && (millis() - lastDataSend > (DATA_SEND_INTERVAL_SECONDS * 1000))) {
    sendSensorData();
    lastDataSend = millis();
  }
  
  // Handle WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected, attempting reconnection...");
    connectToWiFi();
  }
  
  // Small delay to prevent watchdog reset
  delay(100);
}

// ========================================
// INITIALIZATION FUNCTIONS
// ========================================

void initializePins() {
  Serial.println("🔧 Initializing pins...");
  
  // LED pins
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  
  // Button pin
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Sensor pins
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  
  // Set initial LED state
  setLEDColor(0, 255, 0);  // Green = Ready
  
  Serial.println("   ✅ Pins initialized");
}

void initializeSensors() {
  Serial.println("🌡️ Initializing sensors...");
  
  // Initialize DHT sensor
  dht.begin();
  delay(2000);  // Allow sensor to stabilize
  
  Serial.println("   ✅ DHT11 sensor initialized");
  Serial.println("   ✅ Moisture sensor ready");
  Serial.println("   ✅ Light sensor ready");
}

void connectToWiFi() {
  Serial.println("📡 Connecting to WiFi...");
  Serial.println("   SSID: " + String(ssid));
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n   ✅ WiFi connected successfully");
    Serial.println("   📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("   📶 Signal Strength: " + String(WiFi.RSSI()) + " dBm");
    setLEDColor(0, 255, 0);  // Green = Connected
  } else {
    Serial.println("\\n   ❌ WiFi connection failed");
    setLEDColor(255, 0, 0);  // Red = Error
  }
}

// ========================================
// SENSOR FUNCTIONS
// ========================================

void sendSensorData() {
  if (!ENABLE_HTTP_SENDING) {
    Serial.println("📊 HTTP sending disabled for testing");
    return;
  }
  
  Serial.println("\\n📊 Sending sensor data (every " + String(DATA_SEND_INTERVAL_SECONDS) + " seconds)...");
  
  // Read sensor values
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int moistureValue = analogRead(MOISTURE_PIN);
  int ldrValue = analogRead(LDR_PIN);
  
  // Validate DHT readings
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("   ⚠️ DHT sensor error, using default values");
    temperature = 25.0;
    humidity = 50.0;
  }
  
  // Calculate moisture percentage with improved calibration
  float moisturePercent = 0.0;
  if (moistureValue < 50) { moisturePercent = 0; }
  else if (moistureValue < 200) { moisturePercent = map(moistureValue, 50, 200, 5, 25); }
  else if (moistureValue < 400) { moisturePercent = map(moistureValue, 200, 400, 25, 50); }
  else if (moistureValue < 600) { moisturePercent = map(moistureValue, 400, 600, 50, 75); }
  else if (moistureValue < 800) { moisturePercent = map(moistureValue, 600, 800, 75, 90); }
  else { moisturePercent = map(moistureValue, 800, 1023, 90, 100); }
  
  // Calculate light percentage (corrected mapping)
  float lightPercent = 0.0;
  if (ldrValue >= 1020) { lightPercent = 0.0; }
  else { lightPercent = map(ldrValue, 0, 1020, 0, 100); }
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = deviceId;
  doc["deviceName"] = deviceName;
  doc["firmwareVersion"] = firmwareVersion;
  doc["timestamp"] = millis();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = moisturePercent;
  doc["lightLevel"] = lightPercent;
  doc["moistureRaw"] = moistureValue;
  doc["lightRaw"] = ldrValue;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["systemActive"] = systemActive;
  doc["uptime"] = millis();
  
  // Send data to server
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Use secure client for HTTPS, regular client for HTTP
  HTTPClient http;
  if (String(serverURL).startsWith("https://")) {
    secureClient.setInsecure(); // Skip certificate validation for ESP8266
    http.begin(secureClient, String(serverURL) + serverEndpoint);
  } else {
    http.begin(client, String(serverURL) + serverEndpoint);
  }
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "SmartGardenIoT/2.0.0");
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.setTimeout(15000); // 15 second timeout
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("   ✅ Data sent successfully (HTTP " + String(httpResponseCode) + ")");
    Serial.println("   📊 Response: " + response);
    retryCount = 0;
    setLEDColor(0, 255, 0);  // Green = Success
  } else {
    Serial.println("   ❌ HTTP Error: " + String(httpResponseCode));
    retryCount++;
    setLEDColor(255, 255, 0);  // Yellow = Warning
    
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      Serial.println("   ⚠️ Max retry attempts reached, will retry later");
      retryCount = 0;
    }
  }
  
  http.end();
  
  // Print sensor data
  if (ENABLE_SERIAL_DEBUG) {
    Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
    Serial.println("💧 Humidity: " + String(humidity) + "%");
    Serial.println("🌱 Moisture: " + String(moisturePercent) + "% (Raw: " + String(moistureValue) + ")");
    Serial.println("☀️ Light: " + String(lightPercent) + "% (Raw: " + String(ldrValue) + ")");
    Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

void handleButtonPress() {
  if (digitalRead(BUTTON_PIN) == LOW && (millis() - lastButtonPress > 1000)) {
    lastButtonPress = millis();
    systemActive = !systemActive;
    
    Serial.println("🔘 Button pressed - System " + String(systemActive ? "ACTIVATED" : "DEACTIVATED"));
    
    // Visual feedback
    if (systemActive) {
      setLEDColor(0, 255, 0);  // Green
    } else {
      setLEDColor(255, 0, 0);  // Red
    }
    
    // Save state to EEPROM
    saveDeviceState();
  }
}

void setLEDColor(int red, int green, int blue) {
  if (!ENABLE_LED_INDICATORS) return;
  
  analogWrite(RGB_RED, red);
  analogWrite(RGB_GREEN, green);
  analogWrite(RGB_BLUE, blue);
}

void testHardware() {
  Serial.println("🔧 Testing hardware components...");
  
  // Test LEDs
  Serial.println("   🔴 Testing Red LED...");
  setLEDColor(255, 0, 0);
  delay(500);
  
  Serial.println("   🟢 Testing Green LED...");
  setLEDColor(0, 255, 0);
  delay(500);
  
  // Test sensors
  Serial.println("   🌡️ Testing DHT11 sensor...");
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    Serial.println("   ✅ DHT11: " + String(temp) + "°C, " + String(hum) + "%");
  } else {
    Serial.println("   ❌ DHT11 sensor error");
  }
  
  Serial.println("   🌱 Testing Moisture Sensor (D5)...");
  int moistureRaw = analogRead(MOISTURE_PIN);
  Serial.println("   📊 Moisture Raw: " + String(moistureRaw));
  
  Serial.println("   ☀️ Testing Light Sensor (A0)...");
  int lightRaw = analogRead(LDR_PIN);
  Serial.println("   📊 Light Raw: " + String(lightRaw));
  
  // Set ready state
  setLEDColor(0, 255, 0);  // Green = Ready
  Serial.println("   ✅ Hardware test completed");
}

void loadDeviceState() {
  Serial.println("💾 Loading device state from EEPROM...");
  systemActive = EEPROM.read(SYSTEM_STATE_ADDR) == 1;
  Serial.println("   📊 System Active: " + String(systemActive ? "YES" : "NO"));
}

void saveDeviceState() {
  Serial.println("💾 Saving device state to EEPROM...");
  EEPROM.write(SYSTEM_STATE_ADDR, systemActive ? 1 : 0);
  EEPROM.commit();
  Serial.println("   ✅ State saved successfully");
}`;

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
  }, [fetchDevices, fetchGardens]); // Removed fetchDeviceStatuses from dependencies to prevent infinite loop

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
                    <div className="device-status">
                      <span 
                        className="status-indicator"
                        style={{ color: getStatusColor(getDeviceStatus(device.deviceId)) }}
                      >
                        {getStatusIcon(getDeviceStatus(device.deviceId))} {getDeviceStatus(device.deviceId).toUpperCase()}
                      </span>
                    </div>
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
                    className="btn btn-danger"
                    onClick={() => handleDeleteDevice(device)}
                    style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: '8px' }}
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
              
              {/* Success message for paired devices */}
              {discoveredDevices.some(device => device.isPaired) && (
                <div style={{
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  color: '#065f46'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                    ✅ Device paired successfully! The device is now connected and will appear in your device list.
                  </p>
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowDiscovery(false)}
                    style={{ 
                      backgroundColor: '#10b981', 
                      color: 'white',
                      fontSize: '12px',
                      padding: '6px 12px'
                    }}
                  >
                    📱 View My Devices
                  </button>
                </div>
              )}
              
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

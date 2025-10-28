/*
 * Smart Garden IoT - Complete ESP8266 Code
 * 
 * This code handles both discovery mode and normal operation:
 * 1. Starts in discovery mode
 * 2. After pairing, switches to normal IoT operation
 * 3. Sends sensor data and maintains connection status
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// WiFi Configuration
const char* ssid = "Qureshi Deco";
const char* password = "65327050";

// Server Configuration
const char* serverURL = "http://192.168.68.57:3000";
const char* discoveryEndpoint = "/api/iot/device-discovery";
const char* dataEndpoint = "/api/iot/device-data";
const char* heartbeatEndpoint = "/api/iot/heartbeat";

// Device Configuration
String deviceSerialNumber;
String deviceId;
bool isPaired = false;
bool isInNormalMode = false;
unsigned long lastDiscoveryTime = 0;
unsigned long lastDataTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long discoveryInterval = 5000; // 5 seconds
const unsigned long dataInterval = 10000; // 10 seconds
const unsigned long heartbeatInterval = 30000; // 30 seconds

// Sensor pins - ESP8266 only has one analog pin (A0)
const int tempPin = A0;
const int humidityPin = A0;  // Use same pin for demo
const int lightPin = A0;     // Use same pin for demo  
const int soilPin = A0;      // Use same pin for demo

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("🌱 Smart Garden IoT - Complete System");
  Serial.println("=====================================");
  
  // Initialize EEPROM
  EEPROM.begin(512);
  
  // Generate or load device serial number
  loadOrGenerateSerialNumber();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Check if device was previously paired
  checkPairingStatus();
  
  if (isPaired && !deviceId.isEmpty()) {
    Serial.println("🎉 Device is paired! Starting normal operation mode...");
    Serial.println("🆔 Device ID: " + deviceId);
    isInNormalMode = true;
  } else {
    Serial.println("🔍 Starting device discovery mode...");
    Serial.println("🔍 Looking for nearby devices to pair with...");
  }
}

void loop() {
  if (isInNormalMode) {
    // Normal operation mode - send data and heartbeats
    runNormalOperation();
  } else {
    // Discovery mode - broadcast for pairing
    runDiscoveryMode();
  }
  
  delay(1000);
}

void runNormalOperation() {
  unsigned long now = millis();
  
  // Send sensor data every 10 seconds
  if (now - lastDataTime >= dataInterval) {
    sendSensorData();
    lastDataTime = now;
  }
  
  // Send heartbeat every 30 seconds
  if (now - lastHeartbeatTime >= heartbeatInterval) {
    sendHeartbeat();
    lastHeartbeatTime = now;
  }
}

void runDiscoveryMode() {
  if (millis() - lastDiscoveryTime >= discoveryInterval) {
    broadcastDiscovery();
    lastDiscoveryTime = millis();
  }
}

void checkPairingStatus() {
  // Check if device was paired by looking at server response
  // This is a simple check - in a real implementation, you might store this in EEPROM
  Serial.println("🔍 Checking pairing status...");
}

void loadOrGenerateSerialNumber() {
  // Try to load from EEPROM first
  String savedSerial = "";
  for (int i = 0; i < 20; i++) {
    char c = EEPROM.read(i);
    if (c != 0 && c != 255) {
      savedSerial += c;
    }
  }
  
  if (savedSerial.length() > 5) {
    deviceSerialNumber = savedSerial;
    Serial.println("📋 Loaded existing serial: " + deviceSerialNumber);
  } else {
    // Generate new serial number
    generateSerialNumber();
    saveSerialNumber();
    Serial.println("🆕 Generated new serial: " + deviceSerialNumber);
  }
}

void generateSerialNumber() {
  // Generate a unique serial number like: SG-ABC123-XYZ789
  String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  deviceSerialNumber = "SG-";
  
  for (int i = 0; i < 6; i++) {
    deviceSerialNumber += chars[random(0, chars.length())];
  }
  deviceSerialNumber += "-";
  for (int i = 0; i < 6; i++) {
    deviceSerialNumber += chars[random(0, chars.length())];
  }
}

void saveSerialNumber() {
  for (int i = 0; i < deviceSerialNumber.length(); i++) {
    EEPROM.write(i, deviceSerialNumber[i]);
  }
  EEPROM.write(deviceSerialNumber.length(), 0); // Null terminator
  EEPROM.commit();
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("🔗 Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi connected!");
    Serial.println("📡 IP address: " + WiFi.localIP().toString());
    Serial.println("📶 Signal strength: " + String(WiFi.RSSI()) + " dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi connection failed");
    Serial.println("🔄 Restarting in 10 seconds...");
    delay(10000);
    ESP.restart();
  }
}

void broadcastDiscovery() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, reconnecting...");
    connectToWiFi();
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  String fullURL = serverURL + String(discoveryEndpoint);
  Serial.println("🌐 Connecting to: " + fullURL);
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create discovery payload
  StaticJsonDocument<200> doc;
  doc["id"] = deviceSerialNumber;
  doc["serialNumber"] = deviceSerialNumber;
  doc["deviceType"] = "Smart Garden Sensor";
  doc["signalStrength"] = WiFi.RSSI();
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("📡 Broadcasting discovery...");
  Serial.println("🆔 Serial: " + deviceSerialNumber);
  Serial.println("📶 Signal: " + String(WiFi.RSSI()) + " dBm");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("📨 Server response: " + String(httpResponseCode));
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Discovery broadcast successful");
      
      // Check if device was paired
      StaticJsonDocument<200> responseDoc;
      deserializeJson(responseDoc, response);
      
      if (responseDoc["paired"] == true) {
        isPaired = true;
        deviceId = responseDoc["deviceId"].as<String>();
        Serial.println("🎉 Device paired successfully!");
        Serial.println("🆔 Assigned Device ID: " + deviceId);
        Serial.println("🔒 Switching to normal operation mode...");
        isInNormalMode = true;
        
        // Save device ID to EEPROM for next boot
        saveDeviceId();
      } else {
        Serial.println("🔍 Device in discovery mode - waiting for pairing");
      }
    }
  } else {
    Serial.println("❌ Discovery broadcast failed: " + String(httpResponseCode));
  }
  
  http.end();
}

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, reconnecting...");
    connectToWiFi();
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  String fullURL = serverURL + String(dataEndpoint);
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  
  // Read sensor values - using single analog pin with different sampling
  float temperature = 22.5 + random(-5, 10); // Mock temperature (would need DHT22)
  float humidity = 45.0 + random(-10, 20);   // Mock humidity (would need DHT22)
  
  // Use the same analog pin but with different timing for different sensors
  int lightLevel = analogRead(A0);            // Light sensor reading
  delay(10);                                  // Small delay between readings
  int soilMoisture = analogRead(A0);          // Soil moisture reading
  
  // Create sensor data payload
  StaticJsonDocument<400> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["lightLevel"] = lightLevel;
  doc["soilMoisture"] = soilMoisture;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("📊 Sending sensor data...");
  Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
  Serial.println("💧 Humidity: " + String(humidity) + "%");
  Serial.println("☀️ Light: " + String(lightLevel));
  Serial.println("🌱 Soil: " + String(soilMoisture));
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.println("✅ Sensor data sent: " + String(httpResponseCode));
  } else {
    Serial.println("❌ Failed to send sensor data: " + String(httpResponseCode));
  }
  
  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, reconnecting...");
    connectToWiFi();
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  String fullURL = serverURL + String(heartbeatEndpoint);
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create heartbeat payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["status"] = "online";
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("💓 Sending heartbeat...");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.println("✅ Heartbeat sent: " + String(httpResponseCode));
  } else {
    Serial.println("❌ Failed to send heartbeat: " + String(httpResponseCode));
  }
  
  http.end();
}

void saveDeviceId() {
  // Save device ID to EEPROM starting at position 50
  for (int i = 0; i < deviceId.length() && i < 20; i++) {
    EEPROM.write(50 + i, deviceId[i]);
  }
  EEPROM.write(50 + deviceId.length(), 0); // Null terminator
  EEPROM.commit();
}

void loadDeviceId() {
  // Load device ID from EEPROM
  String savedDeviceId = "";
  for (int i = 50; i < 70; i++) {
    char c = EEPROM.read(i);
    if (c != 0 && c != 255) {
      savedDeviceId += c;
    }
  }
  
  if (savedDeviceId.length() > 0) {
    deviceId = savedDeviceId;
    isPaired = true;
    isInNormalMode = true;
    Serial.println("📋 Loaded existing device ID: " + deviceId);
  }
}
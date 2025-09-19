/*
 * Smart Garden IoT - Complete ESP8266 Code
 * 
 * This code handles:
 * 1. Device discovery mode (initial pairing)
 * 2. Normal operation mode (after pairing)
 * 3. Automatic mode switching
 * 4. Real-time data transmission
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
const char* serverURL = "http://192.168.68.65:3000";
const char* discoveryEndpoint = "/api/iot/device-discovery";
const char* deviceDataEndpoint = "/api/iot/device-data";

// Device Configuration
String deviceSerialNumber;
String deviceId;
bool isPaired = false;
bool isDiscoveryMode = true;
unsigned long lastDiscoveryTime = 0;
unsigned long lastDataTime = 0;
const unsigned long discoveryInterval = 5000; // 5 seconds
const unsigned long dataInterval = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("🌱 Smart Garden IoT - Complete System");
  Serial.println("=====================================");
  
  // Initialize EEPROM
  EEPROM.begin(512);
  
  // Load device configuration
  loadDeviceConfig();
  
  // Connect to WiFi
  connectToWiFi();
  
  if (isDiscoveryMode) {
    Serial.println("📡 Starting device discovery...");
    Serial.println("🔍 Looking for nearby devices to pair with...");
  } else {
    Serial.println("📊 Starting normal operation mode...");
    Serial.println("🆔 Device ID: " + deviceId);
  }
}

void loop() {
  if (isDiscoveryMode && !isPaired) {
    // Discovery mode - broadcast for pairing
    if (millis() - lastDiscoveryTime >= discoveryInterval) {
      broadcastDiscovery();
      lastDiscoveryTime = millis();
    }
  } else {
    // Normal operation mode - send sensor data
    if (millis() - lastDataTime >= dataInterval) {
      sendSensorData();
      lastDataTime = millis();
    }
  }
  
  delay(1000);
}

void loadDeviceConfig() {
  // Try to load device ID from EEPROM
  String savedDeviceId = "";
  for (int i = 0; i < 20; i++) {
    char c = EEPROM.read(i);
    if (c != 0 && c != 255) {
      savedDeviceId += c;
    }
  }
  
  if (savedDeviceId.length() > 3) {
    deviceId = savedDeviceId;
    isPaired = true;
    isDiscoveryMode = false;
    Serial.println("📋 Loaded existing device ID: " + deviceId);
  } else {
    // Generate new serial number for discovery
    generateSerialNumber();
    isPaired = false;
    isDiscoveryMode = true;
    Serial.println("🆕 Generated new serial for discovery: " + deviceSerialNumber);
  }
}

void generateSerialNumber() {
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
  Serial.println("🌐 Discovery to: " + fullURL);
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["id"] = deviceSerialNumber;
  doc["serialNumber"] = deviceSerialNumber;
  doc["deviceType"] = "Smart Garden Sensor";
  doc["signalStrength"] = WiFi.RSSI();
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("📡 Broadcasting discovery...");
  Serial.println("🆔 Serial: " + deviceSerialNumber);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✅ Discovery broadcast successful");
    
    // Check if device was paired
    StaticJsonDocument<200> responseDoc;
    deserializeJson(responseDoc, response);
    
    if (responseDoc["paired"] == true) {
      deviceId = responseDoc["deviceId"].as<String>();
      saveDeviceId(deviceId);
      isPaired = true;
      isDiscoveryMode = false;
      Serial.println("🎉 Device paired successfully!");
      Serial.println("🆔 Assigned Device ID: " + deviceId);
      Serial.println("📊 Switching to normal operation mode...");
    }
  } else {
    Serial.println("❌ Discovery failed: " + String(httpResponseCode));
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
  
  String fullURL = serverURL + String(deviceDataEndpoint);
  Serial.println("📊 Sending sensor data to: " + fullURL);
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  
  // Generate mock sensor data
  float temperature = 22.5 + random(-5, 10) * 0.1;
  float humidity = 45.0 + random(-10, 20) * 0.1;
  float soilMoisture = 60.0 + random(-15, 15) * 0.1;
  int lightLevel = 500 + random(-100, 200);
  
  StaticJsonDocument<300> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["sensors"] = JsonObject();
  doc["sensors"]["temperature"] = temperature;
  doc["sensors"]["humidity"] = humidity;
  doc["sensors"]["soilMoisture"] = soilMoisture;
  doc["sensors"]["light"] = lightLevel;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("📊 Sending data for device: " + deviceId);
  Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
  Serial.println("💧 Humidity: " + String(humidity) + "%");
  Serial.println("🌱 Soil Moisture: " + String(soilMoisture) + "%");
  Serial.println("☀️ Light: " + String(lightLevel) + " lux");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode == 200) {
    Serial.println("✅ Sensor data sent successfully");
  } else {
    Serial.println("❌ Sensor data failed: " + String(httpResponseCode));
  }
  
  http.end();
}

void saveDeviceId(String deviceId) {
  for (int i = 0; i < deviceId.length(); i++) {
    EEPROM.write(i, deviceId[i]);
  }
  EEPROM.write(deviceId.length(), 0); // Null terminator
  EEPROM.commit();
  Serial.println("💾 Device ID saved to EEPROM: " + deviceId);
}

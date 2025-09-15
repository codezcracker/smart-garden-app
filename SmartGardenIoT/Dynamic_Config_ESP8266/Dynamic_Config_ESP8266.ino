/*
 * Smart Garden IoT - DYNAMIC CONFIGURATION VERSION
 * ESP8266 that fetches configuration from server automatically
 * 
 * Features:
 * - Fetches device config from server on startup
 * - No need to re-upload code when changing settings
 * - Automatic WiFi reconnection with new settings
 * - Configurable sensors and intervals
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Default configuration (fallback if server is unavailable)
const char* DEFAULT_SSID = "Qureshi Deco";
const char* DEFAULT_PASSWORD = "65327050";
const char* DEFAULT_DEVICE_ID = "DB007";
const unsigned long DEFAULT_SEND_INTERVAL = 1000;

// Current configuration (fetched from server)
String currentSSID = "";
String currentPassword = "";
String currentDeviceID = "";
String serverURL = "";
unsigned long sendInterval = DEFAULT_SEND_INTERVAL;
bool sensors[4] = {true, true, true, true}; // temp, humidity, light, soil

// Connection status
bool configLoaded = false;
bool serverConnected = false;
unsigned long lastSend = 0;
unsigned long lastConfigFetch = 0;
const unsigned long CONFIG_FETCH_INTERVAL = 300000; // 5 minutes

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 Smart Garden IoT - Dynamic Configuration");
  Serial.println("==========================================");
  
  // Try to load configuration from server
  loadDeviceConfiguration();
  
  // Connect to WiFi with current config
  connectToWiFi();
  
  // Test server connection
  testServerConnection();
  
  Serial.println("🚀 Starting data transmission...");
  Serial.println("📡 Device will fetch config updates every 5 minutes");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check if we need to fetch new configuration
  if (currentTime - lastConfigFetch > CONFIG_FETCH_INTERVAL) {
    Serial.println("🔄 Fetching updated configuration...");
    loadDeviceConfiguration();
    lastConfigFetch = currentTime;
  }
  
  // Send data if interval has passed
  if (currentTime - lastSend > sendInterval) {
    if (serverConnected) {
      sendData();
    } else {
      Serial.println("❌ Server not connected, retrying...");
      testServerConnection();
    }
    
    lastSend = currentTime;
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, reconnecting...");
    connectToWiFi();
  }
  
  delay(100);
}

void loadDeviceConfiguration() {
  Serial.println("🔧 Loading device configuration from server...");
  
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(5000);
  
  // Try local server first
  String configURL = "http://192.168.68.58:3000/api/iot/device-config/" + String(currentDeviceID.isEmpty() ? DEFAULT_DEVICE_ID : currentDeviceID);
  http.begin(client, configURL);
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      // Update configuration
      currentDeviceID = doc["deviceId"].as<String>();
      currentSSID = doc["wifi"]["ssid"].as<String>();
      currentPassword = doc["wifi"]["password"].as<String>();
      sendInterval = doc["settings"]["sendInterval"].as<unsigned long>();
      
      // Update sensor settings
      sensors[0] = doc["sensors"]["temperature"].as<bool>();
      sensors[1] = doc["sensors"]["humidity"].as<bool>();
      sensors[2] = doc["sensors"]["lightLevel"].as<bool>();
      sensors[3] = doc["sensors"]["soilMoisture"].as<bool>();
      
      // Update server URL
      serverURL = doc["server"]["local"].as<String>();
      
      configLoaded = true;
      
      Serial.println("✅ Configuration loaded successfully!");
      Serial.println("📱 Device ID: " + currentDeviceID);
      Serial.println("📶 WiFi SSID: " + currentSSID);
      Serial.println("⏱️ Send Interval: " + String(sendInterval) + "ms");
      Serial.println("🌡️ Temperature: " + String(sensors[0] ? "ON" : "OFF"));
      Serial.println("💧 Humidity: " + String(sensors[1] ? "ON" : "OFF"));
      Serial.println("☀️ Light Level: " + String(sensors[2] ? "ON" : "OFF"));
      Serial.println("🌱 Soil Moisture: " + String(sensors[3] ? "ON" : "OFF"));
      
      // Reconnect WiFi if settings changed
      if (WiFi.SSID() != currentSSID || currentPassword != "") {
        Serial.println("🔄 WiFi settings changed, reconnecting...");
        connectToWiFi();
      }
      
    } else {
      Serial.println("❌ Failed to parse configuration JSON");
    }
  } else {
    Serial.println("❌ Failed to fetch configuration: " + String(httpCode));
    Serial.println("📡 Using default configuration...");
    
    // Use default configuration
    currentDeviceID = DEFAULT_DEVICE_ID;
    currentSSID = DEFAULT_SSID;
    currentPassword = DEFAULT_PASSWORD;
    sendInterval = DEFAULT_SEND_INTERVAL;
    serverURL = "http://192.168.68.58:3000";
    
    configLoaded = true;
  }
  
  http.end();
}

void connectToWiFi() {
  if (currentSSID.isEmpty()) {
    currentSSID = DEFAULT_SSID;
    currentPassword = DEFAULT_PASSWORD;
  }
  
  Serial.println("📶 Connecting to WiFi: " + currentSSID);
  
  WiFi.begin(currentSSID.c_str(), currentPassword.c_str());
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("✅ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📡 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("❌ WiFi Connection Failed!");
    Serial.println("🔄 Will retry in 30 seconds...");
    delay(30000);
  }
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
    serverURL = "https://smart-garden-4l28rdvnu-codezs-projects.vercel.app";
    Serial.println("✅ Using deployed server: " + serverURL);
  }
}

void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, reconnecting...");
    connectToWiFi();
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
  doc["deviceId"] = currentDeviceID;
  doc["timestamp"] = millis();
  doc["status"] = "online";
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["systemActive"] = true;
  doc["wifiConnected"] = true;
  doc["configLoaded"] = configLoaded;
  
  // System object
  JsonObject system = doc.createNestedObject("system");
  system["systemActive"] = true;
  system["wifiConnected"] = true;
  system["uptime"] = millis();
  system["errorCount"] = 0;
  system["wifiSSID"] = currentSSID;
  system["wifiIP"] = WiFi.localIP().toString();
  system["wifiRSSI"] = WiFi.RSSI();
  system["configLoaded"] = configLoaded;
  
  // Sensor data (only include enabled sensors)
  JsonObject sensors_data = doc.createNestedObject("sensors");
  
  if (sensors[0]) { // Temperature
    sensors_data["temperature"] = 22 + (millis() / 15000) % 8;
  }
  if (sensors[1]) { // Humidity
    sensors_data["humidity"] = 45 + (millis() / 12000) % 25;
  }
  if (sensors[2]) { // Light Level
    sensors_data["lightLevel"] = 60 + (millis() / 8000) % 35;
  }
  if (sensors[3]) { // Soil Moisture
    sensors_data["soilMoisture"] = 50 + (millis() / 10000) % 30;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  int httpCode = http.POST(jsonString);
  
  // Handle response
  if (httpCode > 0) {
    Serial.println("✅ " + String(httpCode));
    if (httpCode == HTTP_CODE_OK) {
      Serial.println("📊 Data transmitted successfully");
      serverConnected = true;
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpCode));
    Serial.println("❌ " + http.errorToString(httpCode));
    serverConnected = false;
  }
  
  // Clean up
  http.end();
}

/*
 * Smart Garden IoT - GARDEN-BASED CONFIGURATION VERSION
 * ESP8266 that fetches configuration from garden settings
 * 
 * Features:
 * - Device ID stored in MongoDB (not hardcoded)
 * - WiFi credentials fetched from GARDEN configuration
 * - Sensor configuration from device settings
 * - Garden-level network settings
 * - No need to re-upload code for configuration changes
 * - User-based device management with garden assignment
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Default fallback configuration (only used if server is unreachable)
const char* FALLBACK_SSID = "Qureshi Deco";
const char* FALLBACK_PASSWORD = "65327050";
const String FALLBACK_DEVICE_ID = "DB007";
const unsigned long FALLBACK_SEND_INTERVAL = 1000;

// Current configuration (fetched from MongoDB)
String deviceID = "";
String gardenID = "";
String gardenName = "";
String wifiSSID = "";
String wifiPassword = "";
String serverURL = "";
String backupServerURL = "";
unsigned long sendInterval = FALLBACK_SEND_INTERVAL;
bool sensorsEnabled[4] = {true, true, true, true}; // temp, humidity, light, soil
int configVersion = 0;
bool deepSleepEnabled = false;
unsigned long deepSleepDuration = 300000; // 5 minutes

// Garden settings
String timezone = "UTC";
String units = "metric";
int tempMin = 15, tempMax = 35;
int humidityMin = 30, humidityMax = 80;
int soilMin = 20, soilMax = 80;

// Connection status
bool configLoaded = false;
bool serverConnected = false;
unsigned long lastSend = 0;
unsigned long lastConfigFetch = 0;
const unsigned long CONFIG_FETCH_INTERVAL = 300000; // 5 minutes
const unsigned long CONFIG_RETRY_INTERVAL = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 Smart Garden IoT - Garden-Based Configuration");
  Serial.println("==============================================");
  
  // Try to load configuration from MongoDB
  if (loadDeviceConfiguration()) {
    Serial.println("✅ Configuration loaded from MongoDB");
  } else {
    Serial.println("❌ Failed to load config, using fallback settings");
    useFallbackConfiguration();
  }
  
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
    if (loadDeviceConfiguration()) {
      Serial.println("✅ Configuration updated successfully");
      // Reconnect WiFi if settings changed
      if (WiFi.SSID() != wifiSSID) {
        Serial.println("🔄 WiFi settings changed, reconnecting...");
        connectToWiFi();
      }
    } else {
      Serial.println("❌ Failed to fetch new configuration");
    }
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
  
  // Handle deep sleep if enabled
  if (deepSleepEnabled && currentTime > 60000) { // After 1 minute of operation
    Serial.println("😴 Entering deep sleep for " + String(deepSleepDuration/1000) + " seconds...");
    ESP.deepSleep(deepSleepDuration * 1000);
  }
  
  delay(100);
}

bool loadDeviceConfiguration() {
  Serial.println("🔧 Loading device configuration from MongoDB...");
  
  WiFiClient client;
  HTTPClient http;
  http.setTimeout(10000);
  
  // Try to get device ID from EEPROM first, or use fallback
  String currentDeviceId = getStoredDeviceId();
  if (currentDeviceId.isEmpty()) {
    currentDeviceId = FALLBACK_DEVICE_ID;
  }
  
  String configURL = "http://192.168.68.58:3000/api/iot/device-config?deviceId=" + currentDeviceId;
  http.begin(client, configURL);
  http.addHeader("X-Device-ID", currentDeviceId);
  
  int httpCode = http.GET();
  
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DynamicJsonDocument doc(6144); // Increased size for garden config
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error && doc["success"].as<bool>()) {
      // Update device configuration
      deviceID = doc["deviceId"].as<String>();
      gardenID = doc["gardenId"].as<String>();
      gardenName = doc["gardenName"].as<String>();
      
      // Network configuration from garden
      wifiSSID = doc["network"]["wifiSSID"].as<String>();
      wifiPassword = doc["network"]["wifiPassword"].as<String>();
      serverURL = doc["network"]["serverURL"].as<String>();
      backupServerURL = doc["network"]["backupServerURL"].as<String>();
      
      // Device settings
      sendInterval = doc["settings"]["sendInterval"].as<unsigned long>();
      deepSleepEnabled = doc["settings"]["deepSleepEnabled"].as<bool>();
      deepSleepDuration = doc["settings"]["deepSleepDuration"].as<unsigned long>();
      
      // Update sensor settings
      sensorsEnabled[0] = doc["sensors"]["temperature"]["enabled"].as<bool>();
      sensorsEnabled[1] = doc["sensors"]["humidity"]["enabled"].as<bool>();
      sensorsEnabled[2] = doc["sensors"]["lightLevel"]["enabled"].as<bool>();
      sensorsEnabled[3] = doc["sensors"]["soilMoisture"]["enabled"].as<bool>();
      
      // Garden settings
      timezone = doc["gardenSettings"]["timezone"].as<String>();
      units = doc["gardenSettings"]["units"].as<String>();
      tempMin = doc["gardenSettings"]["alertThresholds"]["temperature"]["min"].as<int>();
      tempMax = doc["gardenSettings"]["alertThresholds"]["temperature"]["max"].as<int>();
      humidityMin = doc["gardenSettings"]["alertThresholds"]["humidity"]["min"].as<int>();
      humidityMax = doc["gardenSettings"]["alertThresholds"]["humidity"]["max"].as<int>();
      soilMin = doc["gardenSettings"]["alertThresholds"]["soilMoisture"]["min"].as<int>();
      soilMax = doc["gardenSettings"]["alertThresholds"]["soilMoisture"]["max"].as<int>();
      
      configVersion = doc["configVersion"].as<int>();
      configLoaded = true;
      
      // Store device ID in EEPROM for next boot
      storeDeviceId(deviceID);
      
      Serial.println("✅ Garden-based configuration loaded successfully!");
      Serial.println("📱 Device ID: " + deviceID);
      Serial.println("🌱 Garden: " + gardenName + " (" + gardenID + ")");
      Serial.println("📶 WiFi SSID: " + wifiSSID);
      Serial.println("⏱️ Send Interval: " + String(sendInterval) + "ms");
      Serial.println("🌡️ Temperature: " + String(sensorsEnabled[0] ? "ON" : "OFF") + " (" + String(tempMin) + "°C - " + String(tempMax) + "°C)");
      Serial.println("💧 Humidity: " + String(sensorsEnabled[1] ? "ON" : "OFF") + " (" + String(humidityMin) + "% - " + String(humidityMax) + "%)");
      Serial.println("☀️ Light Level: " + String(sensorsEnabled[2] ? "ON" : "OFF"));
      Serial.println("🌱 Soil Moisture: " + String(sensorsEnabled[3] ? "ON" : "OFF") + " (" + String(soilMin) + "% - " + String(soilMax) + "%)");
      Serial.println("😴 Deep Sleep: " + String(deepSleepEnabled ? "ON" : "OFF"));
      Serial.println("📋 Config Version: " + String(configVersion));
      Serial.println("🌍 Timezone: " + timezone);
      Serial.println("📏 Units: " + units);
      
      http.end();
      return true;
    } else {
      Serial.println("❌ Failed to parse configuration JSON");
    }
  } else {
    Serial.println("❌ Failed to fetch configuration: " + String(httpCode));
  }
  
  http.end();
  return false;
}

void useFallbackConfiguration() {
  Serial.println("📋 Using fallback configuration...");
  
  deviceID = FALLBACK_DEVICE_ID;
  gardenID = "FALLBACK_GARDEN";
  gardenName = "Fallback Garden";
  wifiSSID = FALLBACK_SSID;
  wifiPassword = FALLBACK_PASSWORD;
  serverURL = "http://192.168.68.58:3000";
  backupServerURL = "https://smart-garden-app.vercel.app";
  sendInterval = FALLBACK_SEND_INTERVAL;
  sensorsEnabled[0] = true; // Temperature
  sensorsEnabled[1] = true; // Humidity
  sensorsEnabled[2] = true; // Light Level
  sensorsEnabled[3] = true; // Soil Moisture
  deepSleepEnabled = false;
  
  // Fallback garden settings
  timezone = "UTC";
  units = "metric";
  tempMin = 15; tempMax = 35;
  humidityMin = 30; humidityMax = 80;
  soilMin = 20; soilMax = 80;
  
  configLoaded = true;
}

void connectToWiFi() {
  if (wifiSSID.isEmpty()) {
    wifiSSID = FALLBACK_SSID;
    wifiPassword = FALLBACK_PASSWORD;
  }
  
  Serial.println("📶 Connecting to WiFi: " + wifiSSID);
  Serial.println("🌱 Garden: " + gardenName);
  
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
  
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
    serverURL = backupServerURL;
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
  http.addHeader("X-Device-ID", deviceID);
  
  // Create JSON data
  DynamicJsonDocument doc(2048);
  
  // Main device info
  doc["deviceId"] = deviceID;
  doc["gardenId"] = gardenID;
  doc["timestamp"] = millis();
  doc["status"] = "online";
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["systemActive"] = true;
  doc["wifiConnected"] = true;
  doc["configLoaded"] = configLoaded;
  doc["configVersion"] = configVersion;
  
  // System object
  JsonObject system = doc.createNestedObject("system");
  system["systemActive"] = true;
  system["wifiConnected"] = true;
  system["uptime"] = millis();
  system["errorCount"] = 0;
  system["wifiSSID"] = wifiSSID;
  system["wifiIP"] = WiFi.localIP().toString();
  system["wifiRSSI"] = WiFi.RSSI();
  system["configLoaded"] = configLoaded;
  system["configVersion"] = configVersion;
  system["gardenId"] = gardenID;
  system["gardenName"] = gardenName;
  
  // Garden info
  JsonObject garden_info = doc.createNestedObject("garden");
  garden_info["gardenId"] = gardenID;
  garden_info["gardenName"] = gardenName;
  garden_info["timezone"] = timezone;
  garden_info["units"] = units;
  
  // Alert thresholds
  JsonObject thresholds = garden_info.createNestedObject("thresholds");
  JsonObject temp_thresh = thresholds.createNestedObject("temperature");
  temp_thresh["min"] = tempMin;
  temp_thresh["max"] = tempMax;
  JsonObject humidity_thresh = thresholds.createNestedObject("humidity");
  humidity_thresh["min"] = humidityMin;
  humidity_thresh["max"] = humidityMax;
  JsonObject soil_thresh = thresholds.createNestedObject("soilMoisture");
  soil_thresh["min"] = soilMin;
  soil_thresh["max"] = soilMax;
  
  // Sensor data (only include enabled sensors and check thresholds)
  JsonObject sensors_data = doc.createNestedObject("sensors");
  
  if (sensorsEnabled[0]) { // Temperature
    int temp = 22 + (millis() / 15000) % 8;
    sensors_data["temperature"] = temp;
    sensors_data["temperatureStatus"] = (temp < tempMin || temp > tempMax) ? "alert" : "normal";
  }
  if (sensorsEnabled[1]) { // Humidity
    int humidity = 45 + (millis() / 12000) % 25;
    sensors_data["humidity"] = humidity;
    sensors_data["humidityStatus"] = (humidity < humidityMin || humidity > humidityMax) ? "alert" : "normal";
  }
  if (sensorsEnabled[2]) { // Light Level
    sensors_data["lightLevel"] = 60 + (millis() / 8000) % 35;
  }
  if (sensorsEnabled[3]) { // Soil Moisture
    int soil = 50 + (millis() / 10000) % 30;
    sensors_data["soilMoisture"] = soil;
    sensors_data["soilMoistureStatus"] = (soil < soilMin || soil > soilMax) ? "alert" : "normal";
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
      Serial.println("🌱 Garden: " + gardenName);
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

// EEPROM functions for storing device ID
String getStoredDeviceId() {
  String deviceId = "";
  for (int i = 0; i < 20; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    deviceId += c;
  }
  return deviceId;
}

void storeDeviceId(String deviceId) {
  for (int i = 0; i < 20; i++) {
    if (i < deviceId.length()) {
      EEPROM.write(i, deviceId[i]);
    } else {
      EEPROM.write(i, 0);
    }
  }
  EEPROM.commit();
}

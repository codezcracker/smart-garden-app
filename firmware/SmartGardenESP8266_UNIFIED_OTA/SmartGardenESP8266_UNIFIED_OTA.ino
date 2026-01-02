/*
 * Smart Garden IoT - UNIFIED VERSION with OTA Support
 * 
 * AUTO-DETECTS local or production AND includes OTA updates!
 * - Just change serverURL (HTTP/HTTPS auto-detected)
 * - OTA updates via Arduino IDE (local network)
 * - OTA updates via web dashboard (remote)
 * 
 * SETUP:
 * 1. For LOCAL:    serverURL = "http://192.168.0.X:3000"
 * 2. For PRODUCTION: serverURL = "https://smart-garden-app.vercel.app"
 * 
 * OTA USAGE:
 * - Arduino IDE OTA: Tools → Port → Select "SmartGarden-XXX at 192.168.0.X"
 * - Web Dashboard: Go to Firmware Update page, upload .bin file, trigger update
 * 
 * PIN ASSIGNMENTS:
 * - D0 = Red LED (GPIO16)
 * - D1 = Green LED (GPIO5)
 * - D2 = Blue LED (GPIO4)
 * - D3 = Button (GPIO0)
 * - D4 = DHT11 (GPIO2)
 * - D5 = Moisture Sensor (GPIO14)
 * - A0 = LDR (Light Sensor)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <EEPROM.h>
#include <ESP8266mDNS.h>
#include <ArduinoOTA.h>
#include <ESP8266httpUpdate.h>

// ========================================
// CONFIGURATION - CHANGE THESE!
// ========================================

// WiFi Configuration
const char* ssid = "Qureshi";
const char* password = "65327050";

// Server Configuration - CHANGE FOR LOCAL/PRODUCTION
// For LOCAL testing:
// const char* serverURL = "http://192.168.0.100:3000";

// For PRODUCTION:
const char* serverURL = "https://smart-garden-app.vercel.app";

const char* serverEndpoint = "/api/sensor-data";
const char* firmwareCheckEndpoint = "/api/iot/firmware";

// OTA Configuration
const char* otaHostname = "SmartGarden";  // Will show as "SmartGarden-XXXXX"
const char* otaPassword = "smartgarden123";  // Change for security

// Device Configuration
const char* deviceId = "SMART_GARDEN_001";
const char* deviceName = "Smart Garden Controller";
const char* firmwareVersion = "2.1.0-unified-ota";

// Timing
#define DATA_SEND_INTERVAL_SECONDS 10
#define FIRMWARE_CHECK_INTERVAL 3600000  // Check every hour (1 hour)
#define MAX_RETRY_ATTEMPTS 3

// Pin Definitions
#define RGB_RED 16       // D0
#define RGB_GREEN 5      // D1
#define RGB_BLUE 4       // D2
#define BUTTON_PIN 0     // D3
#define DHT_PIN 2        // D4
#define MOISTURE_PIN 14  // D5
#define LDR_PIN A0

// Sensor Configuration
#define DHT_TYPE DHT11

// System Configuration
#define ENABLE_HTTP_SENDING true
#define ENABLE_SERIAL_DEBUG true
#define ENABLE_LED_INDICATORS true
#define ENABLE_OTA true  // Enable/disable OTA

// ========================================
// GLOBAL VARIABLES
// ========================================

DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient client;
WiFiClientSecure secureClient;
unsigned long lastDataSend = 0;
unsigned long lastFirmwareCheck = 0;
unsigned long lastButtonPress = 0;
bool systemActive = true;
int retryCount = 0;
bool isHTTPS = false;
bool otaInProgress = false;

// EEPROM
#define EEPROM_SIZE 512
#define SYSTEM_STATE_ADDR 0

// ========================================
// SETUP
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Auto-detect protocol
  isHTTPS = String(serverURL).startsWith("https://");
  
  Serial.println("\n🚀 Smart Garden IoT - UNIFIED OTA VERSION v2.1.0");
  Serial.println("================================================");
  Serial.println("🌐 Server: " + String(serverURL));
  Serial.println("🔒 Protocol: " + String(isHTTPS ? "HTTPS" : "HTTP"));
  Serial.println("📍 Mode: " + String(isHTTPS ? "PRODUCTION" : "TESTING"));
  Serial.println("🔄 OTA: " + String(ENABLE_OTA ? "ENABLED" : "DISABLED"));
  Serial.println("================================================");
  
  // Initialize
  EEPROM.begin(EEPROM_SIZE);
  loadDeviceState();
  initializePins();
  initializeSensors();
  connectToWiFi();
  
  // Setup OTA
  if (ENABLE_OTA) {
    setupOTA();
  }
  
  testHardware();
  
  Serial.println("✅ System ready!");
  Serial.println("⚡ Data every " + String(DATA_SEND_INTERVAL_SECONDS) + "s");
  if (ENABLE_OTA) {
    Serial.println("🔄 OTA Hostname: " + String(otaHostname) + "-" + String(ESP.getChipId(), HEX));
  }
  Serial.println("================================================");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Handle OTA (must be called frequently)
  if (ENABLE_OTA && !otaInProgress) {
    ArduinoOTA.handle();
  }
  
  // Skip normal operations during OTA
  if (otaInProgress) {
    delay(100);
    return;
  }
  
  // Button press
  handleButtonPress();
  
  // Send sensor data
  if (ENABLE_HTTP_SENDING && (millis() - lastDataSend > (DATA_SEND_INTERVAL_SECONDS * 1000))) {
    sendSensorData();
    lastDataSend = millis();
  }
  
  // Check for firmware updates
  if (ENABLE_OTA && (millis() - lastFirmwareCheck > FIRMWARE_CHECK_INTERVAL)) {
    checkForFirmwareUpdate();
    lastFirmwareCheck = millis();
  }
  
  // WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi disconnected, reconnecting...");
    connectToWiFi();
    if (ENABLE_OTA) {
      setupOTA();
    }
  }
  
  delay(100);
}

// ========================================
// INITIALIZATION
// ========================================

void initializePins() {
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  setLEDColor(0, 255, 0);
}

void initializeSensors() {
  dht.begin();
  delay(2000);
}

void connectToWiFi() {
  Serial.println("📡 Connecting to WiFi: " + String(ssid));
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected!");
    Serial.println("📍 IP: " + WiFi.localIP().toString());
    Serial.println("📶 RSSI: " + String(WiFi.RSSI()) + " dBm");
    setLEDColor(0, 255, 0);
  } else {
    Serial.println("\n❌ Connection failed!");
    setLEDColor(255, 0, 0);
  }
}

// ========================================
// OTA SETUP
// ========================================

void setupOTA() {
  // Generate unique hostname
  String hostname = String(otaHostname) + "-" + String(ESP.getChipId(), HEX);
  ArduinoOTA.setHostname(hostname.c_str());
  ArduinoOTA.setPassword(otaPassword);
  
  ArduinoOTA.onStart([]() {
    otaInProgress = true;
    String type = (ArduinoOTA.getCommand() == U_FLASH) ? "sketch" : "filesystem";
    Serial.println("🚀 OTA Started: " + type);
    setLEDColor(255, 255, 0);  // Yellow
  });
  
  ArduinoOTA.onEnd([]() {
    Serial.println("\n✅ OTA Complete!");
    setLEDColor(0, 255, 0);  // Green
    delay(1000);
  });
  
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    float percent = (progress / (total / 100.0));
    Serial.printf("📥 Progress: %.1f%%\r", percent);
    
    // Blink blue during update
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 100) {
      static bool ledState = false;
      ledState = !ledState;
      digitalWrite(RGB_BLUE, ledState);
      lastBlink = millis();
    }
  });
  
  ArduinoOTA.onError([](ota_error_t error) {
    otaInProgress = false;
    Serial.printf("❌ OTA Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
    setLEDColor(255, 0, 0);  // Red
  });
  
  ArduinoOTA.begin();
  Serial.println("✅ OTA Ready: " + hostname);
}

// ========================================
// FIRMWARE UPDATE CHECK
// ========================================

void checkForFirmwareUpdate() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  Serial.println("🔍 Checking for updates...");
  
  HTTPClient http;
  String url = String(serverURL) + firmwareCheckEndpoint + "?deviceId=" + deviceId + "&version=" + firmwareVersion;
  
  if (isHTTPS) {
    secureClient.setInsecure();
    http.begin(secureClient, url);
  } else {
    http.begin(client, url);
  }
  
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    if (doc["updateAvailable"] == true) {
      Serial.println("🆕 Update available!");
      Serial.println("   Current: " + String(firmwareVersion));
      Serial.println("   Latest: " + String(doc["latestVersion"].as<String>()));
      
      String downloadUrl = doc["firmware"]["downloadUrl"].as<String>();
      String fullUrl = String(serverURL) + downloadUrl;
      
      Serial.println("📥 Downloading: " + fullUrl);
      performHTTPOTAUpdate(fullUrl);
    } else {
      Serial.println("✅ Firmware up to date");
    }
  } else {
    Serial.println("⚠️ Check failed: " + String(httpCode));
  }
  
  http.end();
}

void performHTTPOTAUpdate(String downloadUrl) {
  Serial.println("🔄 Starting HTTP OTA...");
  
  otaInProgress = true;
  setLEDColor(255, 255, 0);
  
  ESPhttpUpdate.onStart([]() {
    Serial.println("🚀 HTTP OTA Started");
  });
  
  ESPhttpUpdate.onEnd([]() {
    Serial.println("\n✅ Update Complete!");
    setLEDColor(0, 255, 0);
    delay(2000);
  });
  
  ESPhttpUpdate.onProgress([](int current, int total) {
    float percent = (current / (total / 100.0));
    Serial.printf("📥 Progress: %.1f%%\r", percent);
  });
  
  ESPhttpUpdate.onError([](int error) {
    otaInProgress = false;
    Serial.printf("❌ HTTP OTA Error[%d]\n", error);
    setLEDColor(255, 0, 0);
  });
  
  t_httpUpdate_return ret;
  
  if (downloadUrl.startsWith("https://")) {
    WiFiClientSecure otaSecureClient;
    otaSecureClient.setInsecure();
    otaSecureClient.setTimeout(30000);
    ret = ESPhttpUpdate.update(otaSecureClient, downloadUrl);
  } else {
    WiFiClient otaClient;
    otaClient.setTimeout(30000);
    ret = ESPhttpUpdate.update(otaClient, downloadUrl);
  }
  
  switch(ret) {
    case HTTP_UPDATE_FAILED:
      Serial.println("❌ Update failed");
      otaInProgress = false;
      setLEDColor(255, 0, 0);
      break;
    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("✅ No updates");
      otaInProgress = false;
      break;
    case HTTP_UPDATE_OK:
      Serial.println("✅ Update OK! Rebooting...");
      break;
  }
}

// ========================================
// SENSOR DATA
// ========================================

void sendSensorData() {
  if (!ENABLE_HTTP_SENDING) return;
  
  Serial.println("\n📊 Sending data...");
  
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int moistureValue = analogRead(MOISTURE_PIN);
  int ldrValue = analogRead(LDR_PIN);
  
  if (isnan(temperature) || isnan(humidity)) {
    temperature = 25.0;
    humidity = 50.0;
  }
  
  // Calculate percentages
  float moisturePercent = 0.0;
  if (moistureValue < 50) moisturePercent = 0;
  else if (moistureValue < 200) moisturePercent = map(moistureValue, 50, 200, 5, 25);
  else if (moistureValue < 400) moisturePercent = map(moistureValue, 200, 400, 25, 50);
  else if (moistureValue < 600) moisturePercent = map(moistureValue, 400, 600, 50, 75);
  else if (moistureValue < 800) moisturePercent = map(moistureValue, 600, 800, 75, 90);
  else moisturePercent = map(moistureValue, 800, 1023, 90, 100);
  
  float lightPercent = (ldrValue >= 1020) ? 0.0 : map(ldrValue, 0, 1020, 0, 100);
  
  // Create JSON
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
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send (auto-detect HTTP/HTTPS)
  HTTPClient http;
  
  if (isHTTPS) {
    secureClient.setInsecure();
    http.begin(secureClient, String(serverURL) + serverEndpoint);
  } else {
    http.begin(client, String(serverURL) + serverEndpoint);
  }
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "SmartGardenIoT/2.1.0-unified-ota");
  http.setTimeout(15000);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.println("✅ Sent: HTTP " + String(httpCode));
    retryCount = 0;
    setLEDColor(0, 255, 0);
  } else {
    Serial.println("❌ Failed: " + String(httpCode));
    retryCount++;
    setLEDColor(255, 255, 0);
  }
  
  http.end();
  
  // Debug output
  if (ENABLE_SERIAL_DEBUG) {
    Serial.println("🌡️ " + String(temperature) + "°C");
    Serial.println("💧 " + String(humidity) + "%");
    Serial.println("🌱 " + String(moisturePercent) + "%");
    Serial.println("☀️ " + String(lightPercent) + "%");
  }
}

// ========================================
// UTILITIES
// ========================================

void handleButtonPress() {
  if (digitalRead(BUTTON_PIN) == LOW && (millis() - lastButtonPress > 1000)) {
    lastButtonPress = millis();
    systemActive = !systemActive;
    Serial.println("🔘 System " + String(systemActive ? "ON" : "OFF"));
    setLEDColor(systemActive ? 0 : 255, systemActive ? 255 : 0, 0);
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
  Serial.println("🔧 Testing hardware...");
  setLEDColor(255, 0, 0);
  delay(300);
  setLEDColor(0, 255, 0);
  delay(300);
  setLEDColor(0, 0, 255);
  delay(300);
  setLEDColor(0, 255, 0);
  Serial.println("✅ Hardware OK");
}

void loadDeviceState() {
  systemActive = EEPROM.read(SYSTEM_STATE_ADDR) == 1;
}

void saveDeviceState() {
  EEPROM.write(SYSTEM_STATE_ADDR, systemActive ? 1 : 0);
  EEPROM.commit();
}


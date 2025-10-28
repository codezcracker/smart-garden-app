

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <EEPROM.h>

// ========================================
// PRODUCTION CONFIGURATION
// ========================================

// WiFi Configuration - CHANGE THESE FOR PRODUCTION
const char* ssid = "Qureshi";
const char* password = "65327050";

// Server Configuration - CHANGE TO YOUR PRODUCTION SERVER
const char* serverURL = "https://smart-garden-app.vercel.app";  // Use HTTPS for production
const char* serverEndpoint = "/api/sensor-data";

// Production Optimizations
#define DATA_SEND_INTERVAL_SECONDS 10  // 10 seconds for production (battery life)
#define MAX_RETRY_ATTEMPTS 3
#define RETRY_DELAY 5000  // 5 seconds
#define CONNECTION_TIMEOUT 10000  // 10 seconds

// Device Configuration
const char* deviceId = "SMART_GARDEN_001";
const char* deviceName = "Smart Garden Controller";
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
  
  Serial.println("\n🌱 Smart Garden IoT - Production Firmware v2.0.0");
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
  
  // Send startup notification
  sendStartupNotification();
  
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
  
  // Send heartbeat every 5 minutes
  if (millis() - lastHeartbeat > 300000) {
    sendHeartbeat();
    lastHeartbeat = millis();
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
  Serial.println("   📍 Pin Configuration:");
  Serial.println("   🔴 Red LED: D0 (GPIO16)");
  Serial.println("   🟢 Green LED: D1 (GPIO5)");
  Serial.println("   🔵 Blue LED: D2 (GPIO4)");
  Serial.println("   🔘 Button: D3 (GPIO0)");
  Serial.println("   🌡️ DHT11: D4 (GPIO2)");
  Serial.println("   🌱 Moisture: D5 (GPIO14)");
  Serial.println("   ☀️ Light: A0");
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
    Serial.println("\n   ✅ WiFi connected successfully");
    Serial.println("   📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("   📶 Signal Strength: " + String(WiFi.RSSI()) + " dBm");
    setLEDColor(0, 255, 0);  // Green = Connected
  } else {
    Serial.println("\n   ❌ WiFi connection failed");
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
  
  Serial.println("\n📊 Sending sensor data (every " + String(DATA_SEND_INTERVAL_SECONDS) + " seconds)...");
  
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
  if (ldrValue >= 1020) { lightPercent = 0.0; } // LDR might be disconnected
  else { lightPercent = map(ldrValue, 0, 1020, 0, 100); } // Corrected mapping
  
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
  
  HTTPClient http;
  http.begin(client, String(serverURL) + serverEndpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "SmartGardenIoT/2.0.0");
  
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

void sendHeartbeat() {
  Serial.println("💓 Sending heartbeat...");
  
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  doc["type"] = "heartbeat";
  doc["timestamp"] = millis();
  doc["uptime"] = millis();
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["systemActive"] = systemActive;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  HTTPClient http;
  http.begin(client, String(serverURL) + "/api/heartbeat");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.println("   ✅ Heartbeat sent successfully");
  } else {
    Serial.println("   ❌ Heartbeat failed: " + String(httpResponseCode));
  }
  
  http.end();
}

void sendStartupNotification() {
  Serial.println("🚀 Sending startup notification...");
  
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  doc["type"] = "startup";
  doc["timestamp"] = millis();
  doc["firmwareVersion"] = firmwareVersion;
  doc["wifiRSSI"] = WiFi.RSSI();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  HTTPClient http;
  http.begin(client, String(serverURL) + "/api/device-events");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.println("   ✅ Startup notification sent");
  } else {
    Serial.println("   ❌ Startup notification failed: " + String(httpResponseCode));
  }
  
  http.end();
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
  
  Serial.println("   🔵 Testing Blue LED...");
  setLEDColor(0, 0, 255);
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
  
  // Load system state
  systemActive = EEPROM.read(SYSTEM_STATE_ADDR) == 1;
  
  Serial.println("   📊 System Active: " + String(systemActive ? "YES" : "NO"));
}

void saveDeviceState() {
  Serial.println("💾 Saving device state to EEPROM...");
  
  // Save system state
  EEPROM.write(SYSTEM_STATE_ADDR, systemActive ? 1 : 0);
  EEPROM.commit();
  
  Serial.println("   ✅ State saved successfully");
}

// ========================================
// PRODUCTION FEATURES
// ========================================

void enableDeepSleep() {
  if (ENABLE_DEEP_SLEEP) {
    Serial.println("😴 Entering deep sleep mode...");
    ESP.deepSleep(300000000);  // 5 minutes
  }
}

void handleWatchdog() {
  // Prevent watchdog reset
  ESP.wdtFeed();
}

void optimizeWiFiPower() {
  // Optimize WiFi power consumption
  WiFi.setSleepMode(WIFI_LIGHT_SLEEP);
}

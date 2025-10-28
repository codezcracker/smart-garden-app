/*
 * Smart Garden IoT - Simple ESP8266 Code (No Analog Pins)
 * 
 * This code handles both discovery mode and normal operation:
 * 1. Starts in discovery mode
 * 2. After pairing, switches to normal IoT operation
 * 3. Sends mock sensor data and maintains connection status
 * 
 * Uses only digital pins - no analog pin dependencies
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

// Timing
unsigned long lastDiscoveryTime = 0;
unsigned long lastDataTime = 0;
unsigned long lastHeartbeatTime = 0;
const unsigned long discoveryInterval = 5000;   // 5 seconds
const unsigned long dataInterval = 10000;       // 10 seconds
const unsigned long heartbeatInterval = 30000;  // 30 seconds

// EEPROM addresses
const int EEPROM_DEVICE_ID_ADDR = 0;
const int EEPROM_PAIRED_FLAG_ADDR = 50;

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌱 Smart Garden IoT Device Starting...");

  // Initialize EEPROM
  EEPROM.begin(512);

  // Load saved device ID if paired
  loadDeviceState();

  // Connect to WiFi
  connectToWiFi();

  // Generate device serial number
  generateSerialNumber();

  Serial.println("🚀 Device initialized successfully!");
  Serial.println("🆔 Device Serial: " + deviceSerialNumber);

  if (isPaired) {
    Serial.println("✅ Device is already paired with ID: " + deviceId);
    isInNormalMode = true;
  } else {
    Serial.println("🔍 Starting in discovery mode...");
  }
}

void loop() {
  unsigned long now = millis();

  if (!isPaired) {
    // Discovery mode - broadcast every 5 seconds
    if (now - lastDiscoveryTime >= discoveryInterval) {
      broadcastDiscovery();
      lastDiscoveryTime = now;
    }
  } else if (isInNormalMode) {
    // Normal operation mode

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

  // Small delay to prevent overwhelming the system
  delay(100);
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("📶 Connecting to WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.println("📡 IP address: " + WiFi.localIP().toString());
    Serial.println("📶 Signal strength: " + String(WiFi.RSSI()) + " dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
  }
}

void generateSerialNumber() {
  // Generate a unique serial number based on MAC address
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  String macSuffix = mac.substring(6, 12);
  macSuffix.toUpperCase();
  deviceSerialNumber = "SG-" + macSuffix + "-" + String(random(100000, 999999));
}

void loadDeviceState() {
  // Check if device was previously paired
  String savedDeviceId = "";
  for (int i = 0; i < 50; i++) {
    char c = EEPROM.read(EEPROM_DEVICE_ID_ADDR + i);
    if (c != 0) {
      savedDeviceId += c;
    }
  }

  if (savedDeviceId.length() > 0) {
    deviceId = savedDeviceId;
    isPaired = EEPROM.read(EEPROM_PAIRED_FLAG_ADDR) == 1;
    Serial.println("📱 Loaded saved device ID: " + deviceId);
  }
}

void saveDeviceState() {
  // Save device ID to EEPROM
  for (int i = 0; i < deviceId.length() && i < 50; i++) {
    EEPROM.write(EEPROM_DEVICE_ID_ADDR + i, deviceId[i]);
  }

  // Save paired flag
  EEPROM.write(EEPROM_PAIRED_FLAG_ADDR, isPaired ? 1 : 0);
  EEPROM.commit();

  Serial.println("💾 Device state saved to EEPROM");
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

  int httpResponseCode = http.POST(payload);
  String response = http.getString();

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
      Serial.println("🔒 Stopping discovery broadcasts - device is now paired");

      // Save state and switch to normal mode
      saveDeviceState();
      isInNormalMode = true;
    } else {
      Serial.println("⏳ Device not paired yet, continuing discovery...");
    }
  } else {
    Serial.println("❌ Discovery broadcast failed: " + String(httpResponseCode));
    Serial.println("Response: " + response);
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
  http.addHeader("x-device-id", deviceId);

  // Read sensor values - using mock data (no analog pins needed)
  float temperature = 22.5 + random(-5, 10);  // Mock temperature
  float humidity = 45.0 + random(-10, 20);    // Mock humidity
  int lightLevel = random(200, 800);          // Mock light sensor
  int soilMoisture = random(300, 700);        // Mock soil moisture

  // Create sensor data payload
  StaticJsonDocument<400> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["lightLevel"] = lightLevel;
  doc["soilMoisture"] = soilMoisture;
  doc["wifiRSSI"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  Serial.println("📊 Sending sensor data...");
  Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
  Serial.println("💧 Humidity: " + String(humidity) + "%");
  Serial.println("☀️ Light: " + String(lightLevel));
  Serial.println("🌱 Soil: " + String(soilMoisture));

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    Serial.println("✅ Sensor data sent successfully");
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
  http.addHeader("x-device-id", deviceId);

  // Create heartbeat payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["status"] = "online";

  String payload;
  serializeJson(doc, payload);

  Serial.println("💓 Sending heartbeat...");

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    Serial.println("✅ Heartbeat sent successfully");
  } else {
    Serial.println("❌ Failed to send heartbeat: " + String(httpResponseCode));
  }

  http.end();
}

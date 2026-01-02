/*
 * Smart Garden ESP32 DevKit v1 - Laser Control Firmware
 * 
 * Hardware Setup:
 * - ESP32 DevKit v1
 * - Laser Module (connected to LASER_PIN)
 * 
 * Pin Connections:
 * - Laser Module: GPIO 2 (Built-in LED pin, change as needed)
 * 
 * Features:
 * - WiFi connection to your server
 * - Polls for laser control commands
 * - Controls laser ON/OFF
 * - Sends status updates
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// ========================================
// CONFIGURATION - CHANGE THESE VALUES
// ========================================

// WiFi Configuration
// IMPORTANT: Make sure these match your actual WiFi network
const char* ssid = "@s@d";  // CHANGE THIS to your WiFi SSID
const char* password = "88009900";  // CHANGE THIS to your WiFi password

// Server Configuration
// PRODUCTION: Using Vercel deployment
// For local development, change to: "http://192.168.10.15:3000"
const char* serverURL = "https://smart-garden-app.vercel.app";  // Production server
const char* controlEndpoint = "/api/devices/control";  // Command polling endpoint
const char* sensorEndpoint = "/api/sensor-data";  // Sensor data endpoint (optional)

// Device Configuration
String deviceId = "";  // Will be set from MAC address
String deviceMAC = "";
String deviceKey = "default-key";  // Device authentication key (can be changed)

// Pin Definitions
#define LASER_PIN 2  // GPIO 2 - Change this to your laser pin
#define LED_PIN 2    // Built-in LED (same as laser pin on some boards)

// Timing Configuration
const unsigned long COMMAND_CHECK_INTERVAL = 200;  // Check for commands every 200ms (ultra-fast response!)
const unsigned long WIFI_RECONNECT_INTERVAL = 30000;  // Reconnect WiFi every 30 seconds if disconnected

// ========================================
// GLOBAL VARIABLES
// ========================================

bool laserState = false;  // Current laser state (false = OFF, true = ON)
unsigned long lastCommandCheck = 0;
unsigned long lastWiFiReconnectAttempt = 0;
bool wifiConnected = false;

Preferences preferences;

// ========================================
// SETUP FUNCTION
// ========================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n🔴 Smart Garden ESP32 - Laser Control Firmware");
  Serial.println("================================================");
  
  // Initialize pins
  pinMode(LASER_PIN, OUTPUT);
  digitalWrite(LASER_PIN, LOW);  // Start with laser OFF
  laserState = false;
  
  // Initialize preferences for storing device ID
  preferences.begin("laser-device", false);
  deviceId = preferences.getString("deviceId", "");
  
  // Get MAC address
  // Get MAC address and format it (remove colons, uppercase)
  String rawMAC = WiFi.macAddress();
  deviceMAC = "";
  for (int i = 0; i < rawMAC.length(); i++) {
    char c = rawMAC.charAt(i);
    if (c != ':') {
      if (c >= 'a' && c <= 'f') {
        deviceMAC += (char)(c - 32);  // Convert lowercase to uppercase
      } else {
        deviceMAC += c;
      }
    }
  }
  Serial.println("📡 Formatted MAC Address: " + deviceMAC);
  
  // If no device ID stored, use MAC address
  if (deviceId == "") {
    deviceId = "ESP32_" + deviceMAC.substring(0, 8);
    preferences.putString("deviceId", deviceId);
    Serial.println("🆔 Generated Device ID: " + deviceId);
  } else {
    Serial.println("🆔 Using Device ID: " + deviceId);
  }
  
  Serial.println("📡 MAC Address: " + deviceMAC);
  Serial.println("🌐 Server: " + String(serverURL));
  Serial.println("================================================");
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✅ Setup complete!");
  Serial.println("🔴 Laser Status: OFF");
  Serial.println("📡 Ready to receive commands...");
  Serial.println("\n💡 TIP: If WiFi fails, check:");
  Serial.println("   1. SSID and password are correct");
  Serial.println("   2. Network is 2.4GHz or 5GHz (ESP32 supports both)");
  Serial.println("   3. Network is in range");
  Serial.println("   4. Router is powered on");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
  // Handle WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWiFiReconnectAttempt > WIFI_RECONNECT_INTERVAL) {
      Serial.println("\n⚠️ WiFi disconnected, attempting reconnection...");
      connectToWiFi();
      lastWiFiReconnectAttempt = millis();
      delay(1000);  // Give time after connection attempt
    }
    delay(1000);
    return;
  }
  
  // Update wifiConnected flag
  if (!wifiConnected) {
    wifiConnected = true;
  }
  
  // Check for commands periodically
  if (millis() - lastCommandCheck >= COMMAND_CHECK_INTERVAL) {
    checkForCommands();
    lastCommandCheck = millis();
  }
  
  // Send status update every 5 seconds to keep state synced
  static unsigned long lastStatusUpdate = 0;
  if (wifiConnected && (millis() - lastStatusUpdate >= 5000)) {
    sendStatus();
    lastStatusUpdate = millis();
  }
  
  delay(50);  // Minimal delay for ultra-fast polling
}

// ========================================
// WIFI CONNECTION
// ========================================

void connectToWiFi() {
  Serial.println("\n📶 Connecting to WiFi....................");
  Serial.println("   SSID: " + String(ssid));
  
  // Properly disconnect and reset WiFi state first
  if (WiFi.status() == WL_CONNECTED) {
    WiFi.disconnect();
    delay(200);
  }
  
  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);  // Disconnect and erase credentials
  delay(500);  // Give time for disconnect to complete
  
  // Attempt connection
  Serial.println("   🔌 Attempting connection...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  int maxAttempts = 40;  // Increased to 40 attempts (20 seconds)
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✅ WiFi connected!");
    Serial.println("   📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("   📶 Signal Strength: " + String(WiFi.RSSI()) + " dBm");
    Serial.println("   🌐 Gateway: " + WiFi.gatewayIP().toString());
    Serial.println("   🔌 Subnet: " + WiFi.subnetMask().toString());
  } else {
    wifiConnected = false;
    Serial.println("\n❌ WiFi connection failed");
    wl_status_t status = WiFi.status();
    Serial.print("   📡 WiFi Status Code: ");
    Serial.println(status);
    
    Serial.println("   ⚠️ Possible causes:");
    switch (status) {
      case WL_NO_SSID_AVAIL:
        Serial.println("   - SSID not found");
        break;
      case WL_CONNECT_FAILED:
        Serial.println("   - Wrong password");
        break;
      case WL_CONNECTION_LOST:
        Serial.println("   - Connection lost");
        break;
      case WL_DISCONNECTED:
        Serial.println("   - Disconnected");
        break;
      default:
        Serial.println("   - Unknown error (Code: " + String(status) + ")");
        break;
    }
    Serial.println("   ⚠️ Will retry in " + String(WIFI_RECONNECT_INTERVAL / 1000) + " seconds");
  }
}

// ========================================
// COMMAND HANDLING
// ========================================

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, skipping command check");
    return;
  }
  
  Serial.println("\n📤 Polling for commands...");
  Serial.println("   MAC: " + deviceMAC);
  Serial.println("   Device ID: " + deviceId);
  
  HTTPClient http;
  WiFiClientSecure client;
  
  String url = String(serverURL) + String(controlEndpoint);
  Serial.println("   URL: " + url);
  
  // Configure secure client for HTTPS
  client.setInsecure();  // Skip certificate validation
  client.setTimeout(15);  // 15 second timeout
  
  // Begin HTTPS connection
  if (!http.begin(client, url)) {
    Serial.println("❌ Failed to begin HTTPS connection");
    return;
  }
  
  // Add headers for device authentication
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", deviceKey);
  http.addHeader("x-device-mac", deviceMAC);
  http.addHeader("x-device-id", deviceId);
  http.setTimeout(15000);  // 15 second timeout
  
  // Use PATCH method to poll for commands
  Serial.println("   Sending PATCH request...");
  int httpResponseCode = http.PATCH("");
  
  Serial.println("   Response Code: " + String(httpResponseCode));
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✅ Response received:");
    Serial.println(response);
    
    // Parse JSON response
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      // Check if there are commands
      if (doc.containsKey("commands") && doc["commands"].is<JsonArray>()) {
        JsonArray commands = doc["commands"].as<JsonArray>();
        
        if (commands.size() > 0) {
          Serial.println("📋 Processing " + String(commands.size()) + " command(s)...");
          
          // Only process the first (latest) command to avoid duplicate execution
          JsonObject command = commands[0];
          String action = command["action"].as<String>();
          String cmdId = command["_id"] | "";
          Serial.println("   ⚡ Executing: " + action + " (ID: " + cmdId + ")");
          Serial.println("   📍 Current laser state before: " + String(laserState ? "ON" : "OFF"));
          
          JsonObject params = command.containsKey("parameters") ? command["parameters"] : JsonObject();
          executeCommand(action, params);
          
          Serial.println("   📍 Current laser state after: " + String(laserState ? "ON" : "OFF"));
          Serial.println("   ✅ Command executed successfully");
        } else {
          Serial.println("✅ No pending commands");
        }
      } else {
        Serial.println("⚠️ Response doesn't contain 'commands' array");
      }
    } else {
      Serial.println("❌ JSON parse error: " + String(error.c_str()));
    }
  } else if (httpResponseCode == 401) {
    Serial.println("❌ Authentication failed - check device key and MAC address");
  } else if (httpResponseCode == 404) {
    Serial.println("⚠️ Device not found - should auto-register on server");
  } else if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("⚠️ HTTP Error " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("❌ Connection failed (code: " + String(httpResponseCode) + ")");
    Serial.println("   Possible causes:");
    Serial.println("   - Server unreachable");
    Serial.println("   - DNS resolution failed");
    Serial.println("   - SSL handshake failed");
    Serial.println("   - Firewall blocking connection");
  }
  
  http.end();
}

void executeCommand(String action, JsonObject params) {
  Serial.println("\n🎯 Executing command: " + action);
  
  if (action == "laser_on") {
    turnLaserOn();
  } 
  else if (action == "laser_off") {
    turnLaserOff();
  }
  else if (action == "get_status") {
    sendStatus();
  }
  else {
    Serial.println("⚠️ Unknown command: " + action);
  }
}

// ========================================
// LASER CONTROL FUNCTIONS
// ========================================

void turnLaserOn() {
  if (laserState) {
    Serial.println("🔴 Laser is already ON");
    return;
  }
  
  digitalWrite(LASER_PIN, HIGH);
  laserState = true;
  
  Serial.println("🔴✅ Laser turned ON");
  
  // Send status update
  sendStatus();
}

void turnLaserOff() {
  Serial.println("⚫ Attempting to turn laser OFF...");
  Serial.println("   Current state: " + String(laserState ? "ON" : "OFF"));
  Serial.println("   Pin: " + String(LASER_PIN));
  
  if (!laserState) {
    Serial.println("⚠️ Laser is already OFF - skipping");
    return;
  }
  
  digitalWrite(LASER_PIN, LOW);
  delay(10); // Small delay to ensure pin state is set
  laserState = false;
  
  // Verify pin state
  int pinState = digitalRead(LASER_PIN);
  Serial.println("   Pin state after write: " + String(pinState ? "HIGH" : "LOW"));
  
  Serial.println("⚫✅ Laser turned OFF");
  
  // Send status update
  sendStatus();
}

void sendStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Cannot send status - WiFi disconnected");
    return;
  }
  
  Serial.println("📊 Sending status update...");
  
  // Create status JSON
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  doc["deviceMAC"] = deviceMAC;
  doc["laserState"] = laserState ? "on" : "off";
  doc["timestamp"] = millis();
  doc["uptime"] = millis();
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["ipAddress"] = WiFi.localIP().toString();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send to server (optional - you can use sensor-data endpoint)
  HTTPClient http;
  WiFiClientSecure client;
  String url = String(serverURL) + String(sensorEndpoint);
  
  // Skip certificate validation for HTTPS
  client.setInsecure();
  
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.println("✅ Status sent (HTTP " + String(httpCode) + ")");
  } else {
    Serial.println("⚠️ Status send failed: " + String(httpCode));
  }
  
  http.end();
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

String getDeviceStatus() {
  String status = "{";
  status += "\"deviceId\":\"" + deviceId + "\",";
  status += "\"laserState\":" + String(laserState ? "true" : "false") + ",";
  status += "\"wifiConnected\":" + String(wifiConnected ? "true" : "false") + ",";
  status += "\"uptime\":" + String(millis());
  status += "}";
  return status;
}


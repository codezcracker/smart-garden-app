/*
 * Smart Garden ESP32 DevKit v1 - Laser Control Firmware (HTTP VERSION)
 * 
 * This version uses HTTP instead of HTTPS for testing
 * Use this if HTTPS connections are failing
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// WiFi Configuration
const char* ssid = "@s@d";
const char* password = "88009900";

// Server Configuration - USING HTTP FOR TESTING
const char* serverURL = "http://smart-garden-app.vercel.app";  // HTTP instead of HTTPS
const char* controlEndpoint = "/api/devices/control";

// Device Configuration
String deviceId = "";
String deviceMAC = "";
String deviceKey = "default-key";

// Pin Definitions
#define LASER_PIN 2

// Timing
const unsigned long COMMAND_CHECK_INTERVAL = 5000;
const unsigned long WIFI_RECONNECT_INTERVAL = 30000;

// Global Variables
bool laserState = false;
unsigned long lastCommandCheck = 0;
unsigned long lastWiFiReconnectAttempt = 0;
bool wifiConnected = false;

Preferences preferences;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n🔴 Smart Garden ESP32 - Laser Control (HTTP TEST VERSION)");
  Serial.println("==========================================================");
  
  pinMode(LASER_PIN, OUTPUT);
  digitalWrite(LASER_PIN, LOW);
  laserState = false;
  
  preferences.begin("laser-device", false);
  deviceId = preferences.getString("deviceId", "");
  
  // Get MAC address and format it
  String rawMAC = WiFi.macAddress();
  deviceMAC = "";
  for (int i = 0; i < rawMAC.length(); i++) {
    char c = rawMAC.charAt(i);
    if (c != ':') {
      if (c >= 'a' && c <= 'f') {
        deviceMAC += (char)(c - 32);
      } else {
        deviceMAC += c;
      }
    }
  }
  Serial.println("📡 Formatted MAC Address: " + deviceMAC);
  
  if (deviceId == "") {
    deviceId = "ESP32_" + deviceMAC.substring(0, 8);
    preferences.putString("deviceId", deviceId);
    Serial.println("🆔 Generated Device ID: " + deviceId);
  } else {
    Serial.println("🆔 Device ID: " + deviceId);
  }
  
  Serial.println("📡 MAC Address: " + deviceMAC);
  Serial.println("🌐 Server: " + String(serverURL) + " (HTTP)");
  Serial.println("==========================================================");
  
  connectToWiFi();
  
  Serial.println("✅ Setup complete!");
  Serial.println("🔴 Laser Status: " + String(laserState ? "ON" : "OFF"));
  Serial.println("📡 Ready to receive commands...");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWiFiReconnectAttempt >= WIFI_RECONNECT_INTERVAL) {
      Serial.println("⚠️ WiFi disconnected, attempting reconnection...");
      connectToWiFi();
      lastWiFiReconnectAttempt = millis();
    }
  }
  
  // Check for commands periodically
  if (wifiConnected && (millis() - lastCommandCheck >= COMMAND_CHECK_INTERVAL)) {
    checkForCommands();
    lastCommandCheck = millis();
  }
  
  delay(100);
}

void connectToWiFi() {
  Serial.println("📶 Connecting to WiFi...");
  Serial.println("   SSID: " + String(ssid));
  
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  int maxAttempts = 40;
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✅ WiFi connected!");
    Serial.println("   📍 IP Address: " + WiFi.localIP().toString());
    Serial.println("   📶 Signal: " + String(WiFi.RSSI()) + " dBm");
  } else {
    wifiConnected = false;
    Serial.println("\n❌ WiFi connection failed");
    Serial.println("   Status Code: " + String(WiFi.status()));
  }
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected");
    return;
  }
  
  Serial.println("\n📤 Polling for commands (HTTP)...");
  Serial.println("   MAC: " + deviceMAC);
  
  HTTPClient http;
  String url = String(serverURL) + String(controlEndpoint);
  Serial.println("   URL: " + url);
  
  // Use HTTP (no WiFiClientSecure needed)
  if (!http.begin(url)) {
    Serial.println("❌ Failed to begin HTTP connection");
    return;
  }
  
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", deviceKey);
  http.addHeader("x-device-mac", deviceMAC);
  http.addHeader("x-device-id", deviceId);
  http.setTimeout(15000);
  
  Serial.println("   Sending PATCH request...");
  int httpResponseCode = http.PATCH("");
  
  Serial.println("   Response Code: " + String(httpResponseCode));
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("✅ Response received:");
    Serial.println(response);
    
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      if (doc.containsKey("commands") && doc["commands"].is<JsonArray>()) {
        JsonArray commands = doc["commands"].as<JsonArray>();
        
        if (commands.size() > 0) {
          Serial.println("📋 Processing " + String(commands.size()) + " command(s)...");
          
          for (JsonObject command : commands) {
            String action = command["action"].as<String>();
            Serial.println("   Action: " + action);
            executeCommand(action);
          }
        } else {
          Serial.println("✅ No pending commands");
        }
      }
    } else {
      Serial.println("❌ JSON parse error: " + String(error.c_str()));
    }
  } else if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("⚠️ HTTP Error " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("❌ Connection failed (code: " + String(httpResponseCode) + ")");
  }
  
  http.end();
}

void executeCommand(String action) {
  Serial.println("⚡ Executing command: " + action);
  
  if (action == "laser_on") {
    setLaserState(true);
    Serial.println("✅ Laser turned ON");
  } else if (action == "laser_off") {
    setLaserState(false);
    Serial.println("✅ Laser turned OFF");
  } else {
    Serial.println("⚠️ Unknown action: " + action);
  }
}

void setLaserState(bool state) {
  laserState = state;
  digitalWrite(LASER_PIN, state ? HIGH : LOW);
  Serial.println("🔴 Laser is now: " + String(state ? "ON" : "OFF"));
}


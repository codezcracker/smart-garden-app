/*
 * Smart Garden IoT - MINIMAL VERSION
 * ESP8266 with minimal code and real-time status
 * 
 * Features:
 * - Minimal code (under 100 lines)
 * - Real-time device status
 * - Automatic offline detection
 * - HTTP requests only
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Configuration
const char* ssid = "Qureshi Deco";
const char* password = "65327050";
const char* serverURL = "http://192.168.68.58:3000";
const char* deviceID = "DB1";

// Timing - Ultra Fast
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 1000;  // 1 second for ultra-fast detection

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("🌱 Minimal Smart Garden IoT");

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("✅ Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSend > SEND_INTERVAL) {
    sendData();
    lastSend = millis();
  }
  delay(100);
}

void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }

  Serial.println("🔄 Sending data to: " + String(serverURL) + "/api/iot/device-data");

  WiFiClient client;
  HTTPClient http;
  http.begin(client, serverURL + String("/api/iot/device-data"));
  http.addHeader("Content-Type", "application/json");

  // Create JSON with proper structure - FIXED VERSION
  DynamicJsonDocument doc(1024);

  // Main device info
  doc["deviceId"] = deviceID;
  doc["timestamp"] = millis();
  doc["status"] = "online";
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["systemActive"] = true;
  doc["wifiConnected"] = true;

  // System object - ensure all fields are properly set
  JsonObject system = doc.createNestedObject("system");
  system["systemActive"] = true;
  system["wifiConnected"] = true;
  system["uptime"] = millis();
  system["errorCount"] = 0;
  system["wifiSSID"] = ssid;
  system["wifiIP"] = WiFi.localIP().toString();
  system["wifiRSSI"] = WiFi.RSSI();

  // Sensor data with more realistic values
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperature"] = 22 + (millis() / 15000) % 8;    // 22-30°C
  sensors["humidity"] = 45 + (millis() / 12000) % 25;      // 45-70%
  sensors["lightLevel"] = 60 + (millis() / 8000) % 35;     // 60-95%
  sensors["soilMoisture"] = 50 + (millis() / 10000) % 30;  // 50-80%

  String jsonString;
  serializeJson(doc, jsonString);

  int httpCode = http.POST(jsonString);

  if (httpCode > 0) {
    Serial.println("✅ Data sent: " + String(httpCode));
    if (httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      Serial.println("📡 Response: " + response);
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpCode));
    Serial.println("❌ Error details: " + http.errorToString(httpCode));
  }

  http.end();
}

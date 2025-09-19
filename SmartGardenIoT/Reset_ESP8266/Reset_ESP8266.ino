/*
 * Smart Garden IoT - Reset ESP8266 to Discovery Mode
 * 
 * This code clears EEPROM and forces discovery mode
 * Use this when you need to reset the device
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

// Device Configuration
String deviceSerialNumber;
unsigned long lastDiscoveryTime = 0;
const unsigned long discoveryInterval = 5000;  // 5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("🔄 Smart Garden IoT - RESET MODE");
  Serial.println("================================");

  // Initialize EEPROM
  EEPROM.begin(512);

  // CLEAR ALL EEPROM DATA
  Serial.println("🗑️ Clearing EEPROM...");
  for (int i = 0; i < 512; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  Serial.println("✅ EEPROM cleared!");

  // Generate new serial number
  generateSerialNumber();
  Serial.println("🆕 Generated new serial: " + deviceSerialNumber);

  // Connect to WiFi
  connectToWiFi();

  Serial.println("📡 Starting device discovery...");
  Serial.println("🔍 Looking for nearby devices to pair with...");
}

void loop() {
  // Always stay in discovery mode
  if (millis() - lastDiscoveryTime >= discoveryInterval) {
    broadcastDiscovery();
    lastDiscoveryTime = millis();
  }

  delay(1000);
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
  Serial.println("📤 Payload: " + payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("📨 Server response: " + String(httpResponseCode));
    Serial.println("📥 Response: " + response);
    Serial.println("✅ Discovery broadcast successful");
  } else {
    Serial.println("❌ Discovery failed: " + String(httpResponseCode));
  }

  http.end();
}

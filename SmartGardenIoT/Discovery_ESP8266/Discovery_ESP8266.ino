/*
 * Smart Garden IoT - Device Discovery Mode
 * 
 * This code puts the ESP8266 in discovery mode where it:
 * 1. Generates a unique serial number
 * 2. Broadcasts its presence to the server
 * 3. Waits for pairing/configuration
 * 
 * Like Whoop/Fitbit device discovery process
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// WiFi Configuration
const char* ssid = "Qureshi Deco";
const char* password = "65327050";

// Server Configuration - Update this to your local server IP
const char* serverURL = "http://192.168.68.65:3000";  // ← Your actual computer IP
const char* discoveryEndpoint = "/api/iot/device-discovery";

// Device Configuration
String deviceSerialNumber;
String deviceId;
bool isPaired = false;
unsigned long lastDiscoveryTime = 0;
const unsigned long discoveryInterval = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println();
  Serial.println("🌱 Smart Garden IoT - Discovery Mode");
  Serial.println("=====================================");
  
  // Initialize EEPROM
  EEPROM.begin(512);
  
  // Generate or load device serial number
  loadOrGenerateSerialNumber();
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("📡 Starting device discovery...");
  Serial.println("🔍 Looking for nearby devices to pair with...");
}

void loop() {
  // Only run discovery if not paired
  if (!isPaired) {
    if (millis() - lastDiscoveryTime >= discoveryInterval) {
      broadcastDiscovery();
      lastDiscoveryTime = millis();
    }
  } else {
    // Device is paired, switch to normal operation
    Serial.println("✅ Device is paired! Switching to normal mode...");
    // Here you would load the normal IoT operation code
    delay(5000);
  }
  
  delay(1000);
}

void loadOrGenerateSerialNumber() {
  // Try to load from EEPROM first
  String savedSerial = "";
  for (int i = 0; i < 20; i++) {
    char c = EEPROM.read(i);
    if (c != 0 && c != 255) {
      savedSerial += c;
    }
  }
  
  if (savedSerial.length() > 5) {
    deviceSerialNumber = savedSerial;
    Serial.println("📋 Loaded existing serial: " + deviceSerialNumber);
  } else {
    // Generate new serial number
    generateSerialNumber();
    saveSerialNumber();
    Serial.println("🆕 Generated new serial: " + deviceSerialNumber);
  }
}

void generateSerialNumber() {
  // Generate a unique serial number like: SG-ABC123-XYZ789
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

void saveSerialNumber() {
  for (int i = 0; i < deviceSerialNumber.length(); i++) {
    EEPROM.write(i, deviceSerialNumber[i]);
  }
  EEPROM.write(deviceSerialNumber.length(), 0); // Null terminator
  EEPROM.commit();
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
  Serial.println("🆔 Serial: " + deviceSerialNumber);
  Serial.println("📶 Signal: " + String(WiFi.RSSI()) + " dBm");
  Serial.println("📤 Payload: " + payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("📨 Server response: " + String(httpResponseCode));
    Serial.println("📥 Response body: " + response);
    
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
      }
    }
  } else {
    Serial.println("❌ Discovery broadcast failed: " + String(httpResponseCode));
    
    // Provide specific error messages
    switch (httpResponseCode) {
      case -1:
        Serial.println("💡 Error -1: Connection failed. Check if server is running on " + String(serverURL));
        Serial.println("💡 Make sure your Next.js server is running with: npm run dev");
        break;
      case -2:
        Serial.println("💡 Error -2: Connection refused. Server might not be accessible");
        break;
      case -3:
        Serial.println("💡 Error -3: Connection lost during request");
        break;
      case -4:
        Serial.println("💡 Error -4: No response from server");
        break;
      case -5:
        Serial.println("💡 Error -5: Connection timeout");
        break;
      case -6:
        Serial.println("💡 Error -6: No internet connection");
        break;
      case -7:
        Serial.println("💡 Error -7: Too many redirects");
        break;
      case -8:
        Serial.println("💡 Error -8: Connection refused");
        break;
      case -9:
        Serial.println("💡 Error -9: Too many requests");
        break;
      case -10:
        Serial.println("💡 Error -10: Request too large");
        break;
      case -11:
        Serial.println("💡 Error -11: Not found");
        break;
      case -12:
        Serial.println("💡 Error -12: Not acceptable");
        break;
      default:
        Serial.println("💡 Unknown error code: " + String(httpResponseCode));
        break;
    }
  }
  
  http.end();
}

// Function to check pairing status
void checkPairingStatus() {
  // This would be called periodically to check if device was paired
  // Implementation depends on your server setup
}

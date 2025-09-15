/*
 * Smart Garden IoT - SIMPLE DYNAMIC VERSION
 * ESP8266 with smart server discovery (no mDNS required)
 * 
 * Features:
 * - Smart IP scanning for server discovery
 * - Multiple fallback methods
 * - Easy configuration
 * - Works with any server setup
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Configuration - Change these for your network
const char* ssid = "Qureshi Deco";           // ← Change this
const char* password = "65327050";   // ← Change this
const char* deviceID = "DB2";                  // ← Change this for each device

// Server discovery settings
String knownServerIPs[] = {
  "192.168.68.58",                    // ← Your current working server
  "smart-garden-app.vercel.app",      // ← Your deployed Vercel app
  "192.168.1.100",                   // ← Backup local IPs
  "192.168.0.100",                   // ← Router ranges
  "10.0.0.100",                      // ← Corporate networks
  "172.16.0.100"                     // ← More backups
};
int serverPort = 3000;

// Timing
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 1000; // 1 second
const unsigned long DISCOVERY_INTERVAL = 30000; // 30 seconds

// Server discovery
String serverURL = "";
bool serverDiscovered = false;
unsigned long lastDiscovery = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("🌱 Smart Garden IoT - Simple Dynamic Version");
  
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
  
  // Discover server
  discoverServer();
  
  Serial.println("🚀 Starting data transmission...");
}

void loop() {
  if (millis() - lastSend > SEND_INTERVAL) {
    // Try to rediscover server every 30 seconds if not found
    if (!serverDiscovered && (millis() - lastDiscovery > DISCOVERY_INTERVAL)) {
      discoverServer();
    }
    
    if (serverDiscovered) {
      sendData();
    } else {
      Serial.println("❌ Server not discovered, skipping data send");
    }
    
    lastSend = millis();
  }
  
  delay(100);
}

void discoverServer() {
  Serial.println("🔍 Discovering server...");
  lastDiscovery = millis();
  
  // Method 1: Try known IPs first
  for (int i = 0; i < sizeof(knownServerIPs) / sizeof(knownServerIPs[0]); i++) {
    if (testServer(knownServerIPs[i])) {
      serverURL = "http://" + knownServerIPs[i] + ":" + String(serverPort);
      serverDiscovered = true;
      Serial.println("✅ Server found via known IP: " + serverURL);
      return;
    }
  }
  
  // Method 2: Scan local network range
  String baseIP = WiFi.localIP().toString();
  baseIP = baseIP.substring(0, baseIP.lastIndexOf('.') + 1);
  
  Serial.println("🔍 Scanning network range: " + baseIP + "1-254");
  
  for (int i = 1; i <= 254; i++) {
    String testIP = baseIP + String(i);
    
    // Skip our own IP
    if (testIP == WiFi.localIP().toString()) {
      continue;
    }
    
    if (testServer(testIP)) {
      serverURL = "http://" + testIP + ":" + String(serverPort);
      serverDiscovered = true;
      Serial.println("✅ Server found via scan: " + serverURL);
      
      // Add this IP to known IPs for next time
      addKnownIP(testIP);
      return;
    }
    
    // Show progress every 50 IPs
    if (i % 50 == 0) {
      Serial.print("📡 Scanned ");
      Serial.print(i);
      Serial.println("/254 IPs...");
    }
    
    delay(10); // Small delay to avoid overwhelming network
  }
  
  Serial.println("❌ Server discovery failed");
  serverDiscovered = false;
}

bool testServer(String ip) {
  WiFiClient client;
  client.setTimeout(2000); // 2 second timeout
  
  if (client.connect(ip.c_str(), serverPort)) {
    // Send a simple HTTP GET request to test if it's our server
    client.print("GET /api/iot/check-status HTTP/1.1\r\n");
    client.print("Host: " + ip + "\r\n");
    client.print("Connection: close\r\n\r\n");
    
    // Wait for response
    unsigned long timeout = millis() + 3000;
    String response = "";
    
    while (client.connected() && millis() < timeout) {
      if (client.available()) {
        response += client.readString();
        break;
      }
      delay(10);
    }
    
    client.stop();
    
    // Check if response contains our API signature
    if (response.indexOf("devices") >= 0 || response.indexOf("check-status") >= 0) {
      return true;
    }
  }
  
  return false;
}

void addKnownIP(String ip) {
  // Simple method to remember successful IPs
  // In a real implementation, you might save this to EEPROM
  Serial.println("💾 Remembering IP: " + ip);
}

void sendData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, reconnecting...");
    WiFi.begin(ssid, password);
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
  doc["deviceId"] = deviceID;
  doc["timestamp"] = millis();
  doc["status"] = "online";
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis();
  doc["systemActive"] = true;
  doc["wifiConnected"] = true;
  
  // System object
  JsonObject system = doc.createNestedObject("system");
  system["systemActive"] = true;
  system["wifiConnected"] = true;
  system["uptime"] = millis();
  system["errorCount"] = 0;
  system["wifiSSID"] = ssid;
  system["wifiIP"] = WiFi.localIP().toString();
  system["wifiRSSI"] = WiFi.RSSI();
  
  // Sensor data (simulated - replace with real sensors)
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperature"] = 22 + (millis() / 15000) % 8;  // 22-30°C
  sensors["humidity"] = 45 + (millis() / 12000) % 25;    // 45-70%
  sensors["lightLevel"] = 60 + (millis() / 8000) % 35;   // 60-95%
  sensors["soilMoisture"] = 50 + (millis() / 10000) % 30; // 50-80%
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  int httpCode = http.POST(jsonString);
  
  // Handle response
  if (httpCode > 0) {
    Serial.println("✅ " + String(httpCode));
    if (httpCode == HTTP_CODE_OK) {
      Serial.println("📊 Data transmitted successfully");
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpCode));
    Serial.println("❌ " + http.errorToString(httpCode));
    // Mark server as not discovered if connection fails
    serverDiscovered = false;
  }
  
  // Clean up
  http.end();
}

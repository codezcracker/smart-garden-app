#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// WiFi Configuration
const char* ssid = "Qureshi Deco";
const char* password = "65327050";

// Server Configuration - Update this to your local server IP
const char* serverURL = "http://192.168.68.65:3000";
const char* discoveryEndpoint = "/api/iot/device-discovery";

// Device Configuration
String deviceSerialNumber;
String deviceId;
bool isPaired = false;

// EEPROM settings
#define EEPROM_SIZE 512
#define SERIAL_ADDR 0
#define PAIRED_FLAG_ADDR 64
#define DEVICE_ID_ADDR 65

// Timers
unsigned long lastDiscoveryBroadcast = 0;
const long discoveryInterval = 5000; // 5 seconds

// Function to generate a random serial number
String generateSerialNumber() {
  String serial = "SG-";
  for (int i = 0; i < 6; i++) {
    serial += String(random(0, 36), HEX);
  }
  serial += "-";
  for (int i = 0; i < 6; i++) {
    serial += String(random(0, 36), HEX);
  }
  serial.toUpperCase();
  return serial;
}

// Function to store serial number in EEPROM
void storeSerialNumber(String serial) {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < serial.length(); i++) {
    EEPROM.write(SERIAL_ADDR + i, serial[i]);
  }
  EEPROM.write(SERIAL_ADDR + serial.length(), 0); // Null terminator
  EEPROM.commit();
  EEPROM.end();
  Serial.println("✅ Stored new serial: " + serial);
}

// Function to get serial number from EEPROM
String getStoredSerialNumber() {
  EEPROM.begin(EEPROM_SIZE);
  char storedSerial[64];
  int i;
  for (i = 0; i < 63; i++) {
    storedSerial[i] = EEPROM.read(SERIAL_ADDR + i);
    if (storedSerial[i] == 0) break;
  }
  storedSerial[i] = 0; // Ensure null termination
  EEPROM.end();
  return String(storedSerial);
}

// Function to store paired status and device ID in EEPROM
void storePairedStatus(bool paired, String assignedDeviceId) {
  EEPROM.begin(EEPROM_SIZE);
  EEPROM.write(PAIRED_FLAG_ADDR, paired ? 1 : 0);
  for (int i = 0; i < assignedDeviceId.length(); i++) {
    EEPROM.write(DEVICE_ID_ADDR + i, assignedDeviceId[i]);
  }
  EEPROM.write(DEVICE_ID_ADDR + assignedDeviceId.length(), 0); // Null terminator
  EEPROM.commit();
  EEPROM.end();
  Serial.println("✅ Stored paired status: " + String(paired) + ", Device ID: " + assignedDeviceId);
}

// Function to get paired status and device ID from EEPROM
void getPairedStatus() {
  EEPROM.begin(EEPROM_SIZE);
  isPaired = (EEPROM.read(PAIRED_FLAG_ADDR) == 1);
  char storedDeviceId[64];
  int i;
  for (i = 0; i < 63; i++) {
    storedDeviceId[i] = EEPROM.read(DEVICE_ID_ADDR + i);
    if (storedDeviceId[i] == 0) break;
  }
  storedDeviceId[i] = 0; // Ensure null termination
  deviceId = String(storedDeviceId);
  EEPROM.end();
  Serial.println("📱 Loaded paired status: " + String(isPaired) + ", Device ID: " + deviceId);
}

// Function to reset to discovery mode (clear pairing status)
void resetToDiscoveryMode() {
  Serial.println("🔄 Resetting to discovery mode...");
  EEPROM.begin(EEPROM_SIZE);
  EEPROM.write(PAIRED_FLAG_ADDR, 0); // Set as not paired
  EEPROM.write(DEVICE_ID_ADDR, 0); // Clear device ID
  EEPROM.commit();
  EEPROM.end();
  isPaired = false;
  deviceId = "";
  Serial.println("✅ Reset to discovery mode complete!");
}

void connectToWiFi() {
  Serial.print("🔗 Connecting to WiFi");
  WiFi.begin(ssid, password);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ WiFi connection failed!");
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
        storePairedStatus(true, deviceId);
        Serial.println("🎉 Device paired successfully!");
        Serial.println("🆔 Assigned Device ID: " + deviceId);
        Serial.println("🔄 Device will restart in 3 seconds to switch to normal mode...");
        delay(3000);
        ESP.restart();
      }
    }
  } else {
    Serial.println("❌ Discovery broadcast failed: " + String(httpResponseCode));
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n🌱 Smart Garden IoT - Reset Discovery Mode");
  Serial.println("==========================================");
  Serial.println("🔄 This code will reset device to discovery mode");
  Serial.println("📱 Press RESET button on ESP8266 to restart discovery");

  EEPROM.begin(EEPROM_SIZE);
  
  // Get or generate serial number
  deviceSerialNumber = getStoredSerialNumber();
  if (deviceSerialNumber.length() == 0) {
    deviceSerialNumber = generateSerialNumber();
    storeSerialNumber(deviceSerialNumber);
  } else {
    Serial.println("📱 Loaded existing serial: " + deviceSerialNumber);
  }
  
  // Load paired status
  getPairedStatus();
  
  // Force reset to discovery mode
  resetToDiscoveryMode();
  
  EEPROM.end();

  connectToWiFi();
  
  Serial.println("\n🔍 Starting discovery mode...");
  Serial.println("📡 Device will broadcast every 5 seconds");
  Serial.println("🌐 Web app: http://192.168.68.65:3000/my-devices");
}

void loop() {
  if (!isPaired) {
    unsigned long currentTime = millis();
    
    if (currentTime - lastDiscoveryBroadcast >= discoveryInterval) {
      broadcastDiscovery();
      lastDiscoveryBroadcast = currentTime;
    }
    
    delay(100); // Small delay to prevent watchdog reset
  } else {
    Serial.println("🎉 Device is paired! Restarting to switch to normal operation mode...");
    delay(2000);
    ESP.restart(); // Restart to run the normal operation code
  }
}

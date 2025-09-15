/*
 * ESP8266 Real Sensor Data - Web App Integration
 * Sends live sensor data to your web application
 * Safe sensor testing to avoid hardware conflicts
 */

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================================================
// CONFIGURATION
// ============================================================================

const char* ssid = "Lutera";
const char* password = "Arshad@786";

// Your web app URL
const char* webAppURL = "http://192.168.68.52:3000";
const char* deviceID = "SG001";

// ============================================================================
// PIN DEFINITIONS
// ============================================================================

#define DHT_PIN 4           // DHT22 Data
#define LDR_PIN A0          // Light Sensor
#define SOIL_PIN A0         // Soil Moisture (shares A0 with LDR)
#define RGB_RED 5           // RGB Red
#define RGB_GREEN 6         // RGB Green
#define RGB_BLUE 3          // RGB Blue
#define STATUS_LED 7        // Status LED
#define BUZZER 8            // Buzzer
#define BUTTON 2            // Manual Button

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

DHT dht(DHT_PIN, DHT22);

// Sensor Data
struct SensorData {
  float temperature;
  float humidity;
  int lightLevel;
  int soilMoisture;
  bool buttonPressed;
  unsigned long timestamp;
  bool sensorsConnected;
};

SensorData currentData;

// System State
bool systemActive = true;
bool wifiConnected = false;
int errorCount = 0;
unsigned long lastDataSend = 0;
unsigned long lastHeartbeat = 0;
unsigned long startTime = 0;

// Sensor testing flags
bool dhtWorking = false;
bool analogWorking = false;

// ============================================================================
// SETUP FUNCTION
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("\n🌱 Real Sensor Data - Web App Integration");
  Serial.println("==========================================");
  Serial.print("Target URL: ");
  Serial.println(webAppURL);

  startTime = millis();

  // Initialize pins safely
  initializePinsSafely();

  // Test DHT sensor
  testDHTSensor();

  // Test analog sensors
  testAnalogSensors();

  // Connect to WiFi
  connectToWiFi();

  // Send initial data
  readAllSensors();
  sendDataToWebApp();

  Serial.println("✅ System Ready - Sending real sensor data!");
}

// ============================================================================
// MAIN LOOP
// ============================================================================

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    if (wifiConnected) {
      Serial.println("❌ WiFi disconnected, attempting reconnection...");
      wifiConnected = false;
    }
    connectToWiFi();
  } else {
    if (!wifiConnected) {
      Serial.println("✅ WiFi reconnected!");
      wifiConnected = true;
    }
  }

  // Read sensors every 30 seconds
  if (millis() - lastDataSend >= 30000) {
    readAllSensors();
    sendDataToWebApp();
    lastDataSend = millis();
  }

  // Send heartbeat every 5 minutes
  if (millis() - lastHeartbeat >= 300000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }

  // Handle button press
  handleButtonPress();

  // Update status LED
  updateStatusLED();

  // Print status every 60 seconds
  static unsigned long lastStatus = 0;
  if (millis() - lastStatus >= 60000) {
    printStatus();
    lastStatus = millis();
  }

  delay(100);
}

// ============================================================================
// SAFE PIN INITIALIZATION
// ============================================================================

void initializePinsSafely() {
  Serial.println("🔧 Initializing pins safely...");
  
  // Initialize only essential pins first
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(STATUS_LED, OUTPUT);
  
  // Initialize outputs to safe state
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("✅ Basic pins initialized");
  
  // Test RGB LED pins one by one
  Serial.println("🔍 Testing RGB LED pins...");
  testRGBPins();
  
  Serial.println("✅ Pin initialization completed");
}

void testRGBPins() {
  // Test each RGB pin individually
  pinMode(RGB_RED, OUTPUT);
  digitalWrite(RGB_RED, LOW);
  delay(100);
  
  pinMode(RGB_GREEN, OUTPUT);
  digitalWrite(RGB_GREEN, LOW);
  delay(100);
  
  pinMode(RGB_BLUE, OUTPUT);
  digitalWrite(RGB_BLUE, LOW);
  delay(100);
  
  // Test buzzer pin
  pinMode(BUZZER, OUTPUT);
  digitalWrite(BUZZER, LOW);
  delay(100);
  
  Serial.println("✅ RGB and buzzer pins tested");
}

// ============================================================================
// SENSOR TESTING
// ============================================================================

void testDHTSensor() {
  Serial.println("🔍 Testing DHT22 sensor...");
  
  dht.begin();
  delay(2000); // Give sensor time to initialize
  
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    dhtWorking = true;
    Serial.println("✅ DHT22 sensor working");
    Serial.printf("   Temperature: %.1f°C\n", temp);
    Serial.printf("   Humidity: %.1f%%\n", hum);
  } else {
    dhtWorking = false;
    Serial.println("❌ DHT22 sensor not working - check wiring");
  }
}

void testAnalogSensors() {
  Serial.println("🔍 Testing analog sensors...");
  
  // Test LDR
  int ldrValue = analogRead(LDR_PIN);
  Serial.printf("   LDR reading: %d\n", ldrValue);
  
  // Test soil sensor (same pin)
  int soilValue = analogRead(SOIL_PIN);
  Serial.printf("   Soil sensor reading: %d\n", soilValue);
  
  if (ldrValue > 0 && soilValue > 0) {
    analogWorking = true;
    Serial.println("✅ Analog sensors working");
  } else {
    analogWorking = false;
    Serial.println("❌ Analog sensors not working - check wiring");
  }
}

// ============================================================================
// WIFI CONNECTION
// ============================================================================

void connectToWiFi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("");
    Serial.println("WiFi connected.");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    wifiConnected = false;
    Serial.println("\n❌ WiFi Connection Failed");
    errorCount++;
  }
}

// ============================================================================
// SENSOR READING
// ============================================================================

void readAllSensors() {
  Serial.println("📊 Reading sensors...");
  
  // Read DHT22 if working
  if (dhtWorking) {
    currentData.temperature = dht.readTemperature();
    currentData.humidity = dht.readHumidity();
    
    if (isnan(currentData.temperature) || isnan(currentData.humidity)) {
      Serial.println("⚠️ DHT22 reading failed");
      currentData.temperature = 0.0;
      currentData.humidity = 0.0;
    }
  } else {
    currentData.temperature = 0.0;
    currentData.humidity = 0.0;
  }
  
  // Read analog sensors if working
  if (analogWorking) {
    currentData.lightLevel = analogRead(LDR_PIN);
    currentData.soilMoisture = analogRead(SOIL_PIN);
  } else {
    currentData.lightLevel = 0;
    currentData.soilMoisture = 0;
  }
  
  // Read button
  currentData.buttonPressed = !digitalRead(BUTTON);
  
  // Timestamp
  currentData.timestamp = millis();
  
  // Check if any sensors are connected
  currentData.sensorsConnected = dhtWorking || analogWorking;
  
  // Print sensor data
  printSensorData();
}

void printSensorData() {
  Serial.println("📊 Real Sensor Data:");
  if (dhtWorking) {
    Serial.printf("🌡️  Temperature: %.1f°C\n", currentData.temperature);
    Serial.printf("💧 Humidity: %.1f%%\n", currentData.humidity);
  } else {
    Serial.println("🌡️  Temperature: DHT22 not connected");
    Serial.println("💧 Humidity: DHT22 not connected");
  }
  
  if (analogWorking) {
    Serial.printf("☀️  Light Level: %d\n", currentData.lightLevel);
    Serial.printf("🌱 Soil Moisture: %d\n", currentData.soilMoisture);
  } else {
    Serial.println("☀️  Light Level: Analog sensors not connected");
    Serial.println("🌱 Soil Moisture: Analog sensors not connected");
  }
  
  Serial.printf("🔘 Button: %s\n", currentData.buttonPressed ? "Pressed" : "Released");
  Serial.println("---");
}

// ============================================================================
// DATA TRANSMISSION
// ============================================================================

void sendDataToWebApp() {
  if (!wifiConnected) {
    Serial.println("❌ No WiFi connection, skipping data send");
    return;
  }
  
  Serial.println("📤 Sending real sensor data to web app...");
  
  WiFiClient client;
  HTTPClient http;
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = deviceID;
  doc["timestamp"] = currentData.timestamp;
  doc["systemActive"] = systemActive;
  doc["wifiConnected"] = wifiConnected;
  doc["wifiSSID"] = WiFi.SSID();
  doc["wifiIP"] = WiFi.localIP().toString();
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["uptime"] = millis() - startTime;
  doc["errorCount"] = errorCount;
  doc["sensorsConnected"] = currentData.sensorsConnected;
  doc["dhtWorking"] = dhtWorking;
  doc["analogWorking"] = analogWorking;
  
  // Real sensor data
  if (dhtWorking) {
    doc["sensors"]["temperature"] = currentData.temperature;
    doc["sensors"]["humidity"] = currentData.humidity;
  } else {
    // Don't include temperature and humidity if DHT not working
  }
  
  if (analogWorking) {
    doc["sensors"]["lightLevel"] = currentData.lightLevel;
    doc["sensors"]["soilMoisture"] = currentData.soilMoisture;
  } else {
    // Don't include light and soil if analog not working
  }
  
  doc["sensors"]["buttonPressed"] = currentData.buttonPressed;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Sending JSON: ");
  Serial.println(jsonString);
  
  // Send to web app
  http.begin(client, webAppURL + String("/api/iot/device-data"));
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Real data sent successfully - Response: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == HTTP_CODE_OK) {
      String response = http.getString();
      Serial.print("Response: ");
      Serial.println(response);
    }
    errorCount = 0;
  } else {
    Serial.print("❌ Data send failed - Error: ");
    Serial.println(httpResponseCode);
    errorCount++;
  }
  
  http.end();
}

void sendHeartbeat() {
  if (!wifiConnected) {
    Serial.println("❌ No WiFi connection, skipping heartbeat");
    return;
  }
  
  Serial.println("💓 Sending heartbeat...");
  
  WiFiClient client;
  HTTPClient http;
  
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceID;
  doc["status"] = "online";
  doc["uptime"] = millis() - startTime;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["errorCount"] = errorCount;
  doc["sensorsConnected"] = currentData.sensorsConnected;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  http.begin(client, webAppURL + String("/api/iot/heartbeat"));
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.println("✅ Heartbeat sent");
  } else {
    Serial.println("❌ Heartbeat failed");
  }
  
  http.end();
}

// ============================================================================
// LED CONTROL
// ============================================================================

void setRGBColor(int red, int green, int blue) {
  analogWrite(RGB_RED, red);
  analogWrite(RGB_GREEN, green);
  analogWrite(RGB_BLUE, blue);
}

void updateStatusLED() {
  if (wifiConnected && systemActive) {
    // Green - System OK
    digitalWrite(STATUS_LED, HIGH);
  } else if (!wifiConnected) {
    // Blink - WiFi issues
    digitalWrite(STATUS_LED, (millis() / 500) % 2);
  } else {
    // Off - System inactive
    digitalWrite(STATUS_LED, LOW);
  }
}

// ============================================================================
// BUTTON HANDLING
// ============================================================================

void handleButtonPress() {
  static bool lastButtonState = false;
  bool currentButtonState = !digitalRead(BUTTON);
  
  // Detect button press (rising edge)
  if (currentButtonState && !lastButtonState) {
    Serial.println("🔘 Button pressed!");
    
    // Toggle system active state
    systemActive = !systemActive;
    
    // Visual feedback
    if (systemActive) {
      setRGBColor(0, 255, 0);  // Green
      Serial.println("✅ System activated");
    } else {
      setRGBColor(255, 255, 0);  // Yellow
      Serial.println("⏸️ System paused");
    }
    
    delay(1000);
    updateStatusLED();
  }
  
  lastButtonState = currentButtonState;
}

// ============================================================================
// STATUS FUNCTIONS
// ============================================================================

void printStatus() {
  Serial.println("\n📊 Device Status:");
  Serial.print("  Device ID: ");
  Serial.println(deviceID);
  Serial.print("  WiFi: ");
  Serial.println(wifiConnected ? "Connected" : "Disconnected");
  if (wifiConnected) {
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  }
  Serial.print("  DHT22: ");
  Serial.println(dhtWorking ? "Working" : "Not connected");
  Serial.print("  Analog: ");
  Serial.println(analogWorking ? "Working" : "Not connected");
  Serial.print("  Uptime: ");
  Serial.print((millis() - startTime) / 1000);
  Serial.println(" seconds");
  Serial.print("  Errors: ");
  Serial.println(errorCount);
  Serial.println("---");
}

// ============================================================================
// END OF CODE
// ============================================================================

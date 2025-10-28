/*
 * Smart Garden IoT - ESP8266 with Real-Time Data Transmission
 * 
 * UPDATED PIN ASSIGNMENTS:
 * - D0 = Red LED
 * - D1 = Green LED  
 * - D2 = Blue LED
 * - D3 = Button
 * - D6 = Moisture Sensor
 * - D8 = DHT11 (Temperature/Humidity)
 * - A0 = LDR (Light Sensor)
 * 
 * Button Functions:
 * 1. Long Press (5s): Power ON/OFF toggle
 * 2. Medium Press (2s): Discovery mode (blue LED)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <DHT.h>

// Pin definitions - UPDATED PIN ASSIGNMENTS
#define RGB_RED 16       // D0 = GPIO16 = Red LED
#define RGB_GREEN 5      // D1 = GPIO5 = Green LED
#define RGB_BLUE 4       // D2 = GPIO4 = Blue LED
#define BUTTON_PIN 0     // D3 = GPIO0 = Button
#define DHT_PIN 2        // D4 = GPIO2 = DHT11
#define MOISTURE_PIN 14  // D5 = GPIO14 = Moisture Sensor
#define LDR_PIN A0       // A0 = LDR (Light Sensor)
#define DHT_TYPE DHT11   // DHT11 sensor type

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// WiFi credentials
const char* ssid = "Qureshi";
const char* password = "65327050";

// Server Configuration - PRODUCTION (HTTPS with SSL support)
const char* serverURL = "https://smart-garden-app.vercel.app";
const char* discoveryEndpoint = "/api/iot/device-discovery";
const char* dataEndpoint = "/api/sensor-data";  // Updated to match production endpoint

// Set to false to disable HTTP sending (for testing)
const bool ENABLE_HTTP_SENDING = true;
const char* heartbeatEndpoint = "/api/iot/heartbeat";

// Device state
bool deviceOn = false;
bool discoveryMode = false;
unsigned long buttonPressStart = 0;
unsigned long lastHeartbeat = 0;
unsigned long discoveryStartTime = 0;
String deviceId = "DB" + String(random(1000, 9999));

// EEPROM addresses
#define DEVICE_STATE_ADDR 0
#define DEVICE_ID_ADDR 1

// CONFIGURABLE DATA SEND INTERVAL
#define DATA_SEND_INTERVAL_SECONDS 1  // Change this value to adjust send frequency
#define DATA_SEND_INTERVAL (DATA_SEND_INTERVAL_SECONDS * 1000)  // Convert to milliseconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌱 Smart Garden IoT - UPDATED PIN ASSIGNMENTS");
  Serial.println("🔧 D0=Red, D1=Green, D2=Blue, D3=Button");
  Serial.println("🔧 D5=Moisture, D4=DHT11, A0=LDR");
  Serial.println("⚡ Data send interval: " + String(DATA_SEND_INTERVAL_SECONDS) + " seconds");

  // Initialize pins
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  pinMode(2, OUTPUT);  // Built-in LED

  // Initialize sensors
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);

  // Initialize DHT sensor
  dht.begin();
  Serial.println("✅ DHT11 sensor initialized on D8");

  // Initialize EEPROM
  EEPROM.begin(512);

  // Test hardware
  testHardware();

  // Load device state
  loadDeviceState();

  // Connect to WiFi
  connectToWiFi();

  // Power on sequence if device is ON
  if (deviceOn) {
    powerOnSequence();
  }

  Serial.println("🚀 Device initialized successfully!");
  Serial.println("🆔 Device ID: " + deviceId);
  Serial.println("📡 Sending data every " + String(DATA_SEND_INTERVAL_SECONDS) + " seconds via HTTP");
  Serial.println("🔘 Button on D3");
  Serial.println("🌡️ DHT11 on D4");
  Serial.println("☀️ LDR on A0");
  Serial.println("🌱 Moisture on D5");
}

void loop() {
  handleButtonPress();

  if (deviceOn) {
    if (discoveryMode) {
      handleDiscoveryMode();
    } else {
      // Send sensor data every 5 seconds (much faster than 30 seconds!)
      if (millis() - lastHeartbeat > DATA_SEND_INTERVAL) {
        sendSensorData();
        lastHeartbeat = millis();
      }
    }
  }

  delay(50);  // Small delay for button debouncing
}

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, skipping data send");
    return;
  }
  
  if (!ENABLE_HTTP_SENDING) {
    Serial.println("📡 HTTP sending disabled (for testing)");
    return;
  }

  WiFiClientSecure client;
  HTTPClient http;
  String fullURL = String(serverURL) + String(dataEndpoint);
  
  Serial.println("📡 Connecting to: " + fullURL);
  
  // Skip SSL certificate verification for ESP8266 compatibility
  client.setInsecure();
  
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);
  http.setTimeout(15000); // 15 second timeout for HTTPS

  // Read DHT11 sensor (NOW WORKING!)
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Check if DHT reading failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("⚠️ Failed to read from DHT sensor - check wiring!");
    temperature = 0.0;
    humidity = 0.0;
  }

  // Read moisture sensor with better diagnostics
  int moistureValue = analogRead(MOISTURE_PIN);
  float moisturePercent;

  // IMPROVED moisture mapping for better granular readings
  if (moistureValue < 50) {
    // Completely dry (sensor in air)
    moisturePercent = 0;
  } else if (moistureValue < 200) {
    // Very dry soil
    moisturePercent = map(moistureValue, 50, 200, 5, 25);
  } else if (moistureValue < 400) {
    // Dry to normal soil
    moisturePercent = map(moistureValue, 200, 400, 25, 50);
  } else if (moistureValue < 600) {
    // Normal to moist soil
    moisturePercent = map(moistureValue, 400, 600, 50, 75);
  } else if (moistureValue < 800) {
    // Moist to wet soil
    moisturePercent = map(moistureValue, 600, 800, 75, 90);
  } else {
    // Very wet soil (sensor in water)
    moisturePercent = map(moistureValue, 800, 1023, 90, 100);
  }

  // Read light sensor with better diagnostics
  int ldrValue = analogRead(LDR_PIN);
  float lightPercent;

  // Check if LDR is working (should vary, not stuck at 1023)
  if (ldrValue >= 1020) {
    // LDR might be disconnected or not working
    lightPercent = 0.0;  // Set to 0 if sensor not working
  } else {
    // FIXED: LDR logic - higher values = brighter light (corrected)
    lightPercent = map(ldrValue, 0, 1020, 0, 100);
  }

  // Update built-in LED based on moisture level
  updateMoistureLED(moisturePercent);

  // Create sensor data payload
  StaticJsonDocument<500> doc;
  doc["deviceId"] = deviceId;
  doc["timestamp"] = millis();
  doc["temperature"] = temperature;  // ✅ REAL VALUE NOW!
  doc["humidity"] = humidity;        // ✅ REAL VALUE NOW!
  doc["soilMoisture"] = moisturePercent;
  doc["lightLevel"] = lightPercent;
  doc["wifiRSSI"] = WiFi.RSSI();
  doc["status"] = "online";

  // Add system information
  doc["systemActive"] = deviceOn;
  doc["wifiConnected"] = (WiFi.status() == WL_CONNECTED);

  // Add sensors object with detailed readings
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperature"] = temperature;
  sensors["humidity"] = humidity;
  sensors["soilMoisture"] = moisturePercent;
  sensors["lightLevel"] = lightPercent;
  sensors["rawMoisture"] = moistureValue;
  sensors["rawLight"] = ldrValue;
  sensors["wifiRSSI"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  // SIMPLE RAW VALUES ONLY
  Serial.println("\n📊 RAW SENSOR VALUES:");
  Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
  Serial.println("💧 Humidity: " + String(humidity) + "%");
  Serial.println("🌱 Moisture Raw: " + String(moistureValue));
  Serial.println("☀️ Light Raw: " + String(ldrValue));
  Serial.println("📶 WiFi RSSI: " + String(WiFi.RSSI()) + " dBm");

  // Update status based on light level during data transmission
  updateLightStatus(lightPercent);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    Serial.println("✅ Sensor data sent successfully (HTTP)");
    String response = http.getString();
    Serial.println("📨 Server response: " + response);
  } else {
    Serial.println("❌ Failed to send sensor data: " + String(httpResponseCode));
    String errorResponse = http.getString();
    Serial.println("📨 Error response: " + errorResponse);
    
    // Handle specific error codes
    if (httpResponseCode == 308) {
      Serial.println("⚠️ Redirect error - server may be redirecting HTTP to HTTPS");
    } else if (httpResponseCode == -1) {
      Serial.println("⚠️ Connection failed - check WiFi and server URL");
    } else if (httpResponseCode == -11) {
      Serial.println("⚠️ SSL connection failed - check HTTPS certificate");
    } else if (httpResponseCode == -2) {
      Serial.println("⚠️ Connection timeout - server may be slow");
    }
  }
  
  http.end();
}

void testHardware() {
  Serial.println("🔧 Testing Hardware Components...");

  // Test LEDs
  Serial.println("🔴 Testing Red LED on D0...");
  setLED(255, 0, 0);
  delay(500);

  Serial.println("🟢 Testing Green LED on D1...");
  setLED(0, 255, 0);
  delay(500);

  Serial.println("🔵 Testing Blue LED on D5...");
  setLED(0, 0, 255);
  delay(500);

  setLED(0, 0, 0);

  // Test DHT11
  Serial.println("🌡️ Testing DHT11 Sensor on D4...");
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("⚠️ DHT11 not responding - check wiring and pull-up resistor");
    Serial.println("   Expected: DHT11 data pin on D4 with 10kΩ pull-up");
    setLED(255, 0, 0);
    // buzzerLongBeep(); // Buzzer removed from pin assignments
  } else {
    Serial.println("✅ DHT11 working! Temp: " + String(temp) + "°C, Humidity: " + String(hum) + "%");
    setLED(0, 255, 0);
  }

  // Test Moisture Sensor - RAW VALUES ONLY
  Serial.println("🌱 Moisture Sensor (D5) Raw: " + String(analogRead(MOISTURE_PIN)));

  // Test Light Sensor - RAW VALUES ONLY
  Serial.println("☀️ Light Sensor (A0) Raw: " + String(analogRead(LDR_PIN)));

  delay(1000);
  Serial.println("✅ Hardware testing complete!");
}

void handleButtonPress() {
  if (digitalRead(BUTTON_PIN) == LOW) {
    if (buttonPressStart == 0) {
      buttonPressStart = millis();
    }
  } else {
    if (buttonPressStart > 0) {
      unsigned long pressDuration = millis() - buttonPressStart;

      if (pressDuration >= 5000) {
        // Long press - Power toggle
        togglePower();
      } else if (pressDuration >= 2000) {
        // Medium press - Discovery mode
        if (deviceOn) {
          startDiscoveryMode();
        }
      }
      buttonPressStart = 0;
    }
  }
}

void togglePower() {
  deviceOn = !deviceOn;
  saveDeviceState();

  if (deviceOn) {
    setLED(0, 255, 0);
    buzzerBeep(200);
    powerOnSequence();
    Serial.println("🔋 Device turned ON");
  } else {
    setLED(0, 0, 0);
    buzzerDoubleBeep();
    discoveryMode = false;
    Serial.println("🔋 Device turned OFF");
  }
}

void startDiscoveryMode() {
  discoveryMode = true;
  discoveryStartTime = millis();
  setLED(0, 0, 255);
  buzzerBeep(1000);
  Serial.println("🔍 Discovery mode started");

  // Send discovery request via HTTP (for compatibility)
  sendDiscoveryRequest();

  // Auto-exit after 10 seconds
  delay(10000);
  discoveryMode = false;
  if (deviceOn) {
    setLED(0, 255, 0);
  }
}

void sendDiscoveryRequest() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClient client;
  HTTPClient http;
  String fullURL = String(serverURL) + String(discoveryEndpoint);
  http.begin(client, fullURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-id", deviceId);

  StaticJsonDocument<200> doc;
  doc["deviceId"] = deviceId;
  doc["status"] = "discovery";
  doc["timestamp"] = millis();
  doc["wifiRSSI"] = WiFi.RSSI();

  String payload;
  serializeJson(doc, payload);

  Serial.println("🔍 Sending discovery request...");

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    setLED(0, 255, 0);
    buzzerBeep(1000);
    Serial.println("✅ Discovery request sent successfully");
  } else {
    setLED(255, 0, 0);
    // buzzerLongBeep(); // Buzzer removed from pin assignments
    Serial.println("❌ Failed to send discovery request: " + String(httpResponseCode));
  }

  http.end();
}

void handleDiscoveryMode() {
  // Discovery handled in startDiscoveryMode()
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
    Serial.print("📡 IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed");
  }
}

void powerOnSequence() {
  for (int i = 0; i < 3; i++) {
    setLED(0, 255, 0);
    delay(200);
    setLED(0, 0, 0);
    delay(200);
  }
  setLED(0, 255, 0);
}

void setLED(int red, int green, int blue) {
  analogWrite(RGB_RED, red);
  analogWrite(RGB_GREEN, green);
  analogWrite(RGB_BLUE, blue);
}

void updateMoistureLED(float moisturePercent) {
  if (moisturePercent > 50) {
    digitalWrite(2, LOW);  // Turn on built-in LED
  } else {
    digitalWrite(2, HIGH);
  }
}

void buzzerBeep(int duration) {
  // tone(BUZZER_PIN, 1000, duration); // Buzzer removed from pin assignments
}

void buzzerDoubleBeep() {
  buzzerBeep(200);
  delay(100);
  buzzerBeep(200);
}

void buzzerLongBeep() {
  // Buzzer removed from pin assignments
  // for (int i = 0; i < 4; i++) {
  //   buzzerBeep(300);
  //   delay(200);
  // }
}

void saveDeviceState() {
  EEPROM.write(DEVICE_STATE_ADDR, deviceOn ? 1 : 0);
  EEPROM.commit();
}

void loadDeviceState() {
  deviceOn = EEPROM.read(DEVICE_STATE_ADDR) == 1;
  if (deviceOn) {
    setLED(0, 255, 0);
  }
}

void updateLightStatus(float lightPercent) {
  if (lightPercent > 80) {
    setLED(0, 255, 0);
    Serial.println("🟢 Very bright light");
  } else if (lightPercent > 60) {
    setLED(0, 255, 0);
    Serial.println("🟢 Bright light");
  } else if (lightPercent > 40) {
    setLED(0, 0, 255);
    Serial.println("🔵 Normal light");
  } else if (lightPercent > 20) {
    setLED(255, 255, 0);
    Serial.println("🟡 Dim light");
  } else {
    setLED(255, 0, 0);
    // tone(BUZZER_PIN, 500, 300); // Buzzer removed from pin assignments
    Serial.println("🔴 Very dim light");
  }
}

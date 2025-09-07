/*
 * Smart Garden ESP32 Controller
 * Community IoT System for 30K Homes
 * 
 * Hardware Setup:
 * - ESP32 DevKit
 * - TP4056 18650 Battery Charger
 * - Soil Moisture Sensor (Analog)
 * - DHT22 Temperature & Humidity Sensor
 * - LDR Light Sensor
 * - Water Pump/Valve (Relay)
 * - LED Grow Lights (PWM)
 * 
 * Pin Connections (based on your diagram):
 * - Soil Moisture: A0 (GPIO36)
 * - DHT22: GPIO21
 * - LDR: A3 (GPIO39)
 * - Water Pump: GPIO5
 * - LED Lights: GPIO18 (PWM)
 * - Battery Monitor: A6 (GPIO34)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ArduinoOTA.h>
#include <Preferences.h>

// Pin Definitions
#define SOIL_MOISTURE_PIN A0      // GPIO36
#define DHT_PIN 21
#define LDR_PIN A3               // GPIO39
#define WATER_PUMP_PIN 5
#define LED_LIGHTS_PIN 18
#define BATTERY_PIN A6           // GPIO34

// Sensor Setup
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// Network Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://your-domain.com/api";

// Device Configuration
String deviceMAC;
String deviceKey = "your-device-secret-key";
unsigned long lastSensorRead = 0;
unsigned long lastCommandCheck = 0;
const unsigned long SENSOR_INTERVAL = 30000;    // 30 seconds
const unsigned long COMMAND_INTERVAL = 10000;   // 10 seconds

// Preferences for configuration storage
Preferences preferences;

// Sensor calibration values
struct SensorCalibration {
  int soilMoistureMin = 0;
  int soilMoistureMax = 1024;
  float temperatureOffset = 0.0;
  float humidityOffset = 0.0;
  int lightLevelMin = 0;
  int lightLevelMax = 1024;
} calibration;

// Current sensor readings
struct SensorData {
  float soilMoisture = 0;
  float temperature = 0;
  float humidity = 0;
  float lightLevel = 0;
  float batteryLevel = 0;
  bool isValid = false;
} currentData;

void setup() {
  Serial.begin(115200);
  Serial.println("Smart Garden ESP32 Controller Starting...");
  
  // Initialize pins
  pinMode(WATER_PUMP_PIN, OUTPUT);
  pinMode(LED_LIGHTS_PIN, OUTPUT);
  digitalWrite(WATER_PUMP_PIN, LOW);
  analogWrite(LED_LIGHTS_PIN, 0);
  
  // Initialize sensors
  dht.begin();
  
  // Get device MAC address
  deviceMAC = WiFi.macAddress();
  deviceMAC.replace(":", "");
  Serial.println("Device MAC: " + deviceMAC);
  
  // Initialize preferences
  preferences.begin("garden-config", false);
  loadConfiguration();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize OTA updates
  setupOTA();
  
  Serial.println("Setup complete!");
}

void loop() {
  // Handle OTA updates
  ArduinoOTA.handle();
  
  // Read sensors periodically
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    sendSensorData();
    lastSensorRead = millis();
  }
  
  // Check for control commands
  if (millis() - lastCommandCheck >= COMMAND_INTERVAL) {
    checkForCommands();
    lastCommandCheck = millis();
  }
  
  // Handle WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    connectToWiFi();
  }
  
  delay(1000);
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
  }
}

void setupOTA() {
  ArduinoOTA.setHostname(("SmartGarden-" + deviceMAC).c_str());
  ArduinoOTA.setPassword("your-ota-password");
  
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) {
      type = "sketch";
    } else {
      type = "filesystem";
    }
    Serial.println("Start updating " + type);
  });
  
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) {
      Serial.println("Auth Failed");
    } else if (error == OTA_BEGIN_ERROR) {
      Serial.println("Begin Failed");
    } else if (error == OTA_CONNECT_ERROR) {
      Serial.println("Connect Failed");
    } else if (error == OTA_RECEIVE_ERROR) {
      Serial.println("Receive Failed");
    } else if (error == OTA_END_ERROR) {
      Serial.println("End Failed");
    }
  });
  
  ArduinoOTA.begin();
}

void readSensors() {
  Serial.println("Reading sensors...");
  
  // Read soil moisture (analog, inverted for moisture percentage)
  int soilRaw = analogRead(SOIL_MOISTURE_PIN);
  currentData.soilMoisture = map(soilRaw, calibration.soilMoistureMin, calibration.soilMoistureMax, 0, 100);
  currentData.soilMoisture = constrain(currentData.soilMoisture, 0, 100);
  
  // Read DHT22 (temperature and humidity)
  currentData.temperature = dht.readTemperature() + calibration.temperatureOffset;
  currentData.humidity = dht.readHumidity() + calibration.humidityOffset;
  
  // Read light level
  int lightRaw = analogRead(LDR_PIN);
  currentData.lightLevel = map(lightRaw, calibration.lightLevelMin, calibration.lightLevelMax, 0, 100);
  currentData.lightLevel = constrain(currentData.lightLevel, 0, 100);
  
  // Read battery level
  int batteryRaw = analogRead(BATTERY_PIN);
  float batteryVoltage = (batteryRaw / 1024.0) * 3.3 * 2; // Voltage divider
  currentData.batteryLevel = map(batteryVoltage * 100, 320, 420, 0, 100); // 3.2V to 4.2V
  currentData.batteryLevel = constrain(currentData.batteryLevel, 0, 100);
  
  // Validate readings
  currentData.isValid = !isnan(currentData.temperature) && !isnan(currentData.humidity);
  
  // Print readings
  Serial.println("Sensor Readings:");
  Serial.println("  Soil Moisture: " + String(currentData.soilMoisture) + "%");
  Serial.println("  Temperature: " + String(currentData.temperature) + "°C");
  Serial.println("  Humidity: " + String(currentData.humidity) + "%");
  Serial.println("  Light Level: " + String(currentData.lightLevel) + "%");
  Serial.println("  Battery: " + String(currentData.batteryLevel) + "%");
}

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED || !currentData.isValid) {
    Serial.println("Cannot send data - WiFi disconnected or invalid readings");
    return;
  }
  
  HTTPClient http;
  http.begin(String(serverURL) + "/sensors/data");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", deviceKey);
  http.addHeader("X-Device-MAC", deviceMAC);
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["timestamp"] = millis();
  
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["soilMoisture"] = currentData.soilMoisture;
  sensors["temperature"] = currentData.temperature;
  sensors["humidity"] = currentData.humidity;
  sensors["lightLevel"] = currentData.lightLevel;
  sensors["batteryLevel"] = currentData.batteryLevel;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending sensor data: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error sending data: " + String(httpResponseCode));
  }
  
  http.end();
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  
  HTTPClient http;
  http.begin(String(serverURL) + "/devices/control");
  http.addHeader("X-Device-Key", deviceKey);
  http.addHeader("X-Device-MAC", deviceMAC);
  
  int httpResponseCode = http.sendRequest("PATCH");
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("Commands received: " + response);
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    JsonArray commands = doc["commands"];
    for (JsonObject command : commands) {
      String action = command["action"];
      JsonObject params = command["parameters"];
      
      executeCommand(action, params);
    }
  }
  
  http.end();
}

void executeCommand(String action, JsonObject params) {
  Serial.println("Executing command: " + action);
  
  if (action == "water") {
    int duration = params["duration"] | 30; // Default 30 seconds
    waterPlants(duration);
  } 
  else if (action == "light_on") {
    int brightness = params["brightness"] | 80; // Default 80%
    setLightBrightness(brightness);
  }
  else if (action == "light_off") {
    setLightBrightness(0);
  }
  else if (action == "set_light_brightness") {
    int brightness = params["brightness"] | 50;
    setLightBrightness(brightness);
  }
  else if (action == "get_status") {
    // Status is sent with sensor data
    sendSensorData();
  }
  else {
    Serial.println("Unknown command: " + action);
  }
}

void waterPlants(int duration) {
  Serial.println("Watering plants for " + String(duration) + " seconds");
  
  digitalWrite(WATER_PUMP_PIN, HIGH);
  delay(duration * 1000);
  digitalWrite(WATER_PUMP_PIN, LOW);
  
  Serial.println("Watering complete");
}

void setLightBrightness(int brightness) {
  brightness = constrain(brightness, 0, 100);
  int pwmValue = map(brightness, 0, 100, 0, 255);
  
  Serial.println("Setting light brightness to " + String(brightness) + "%");
  analogWrite(LED_LIGHTS_PIN, pwmValue);
}

void loadConfiguration() {
  calibration.soilMoistureMin = preferences.getInt("soil_min", 0);
  calibration.soilMoistureMax = preferences.getInt("soil_max", 1024);
  calibration.temperatureOffset = preferences.getFloat("temp_offset", 0.0);
  calibration.humidityOffset = preferences.getFloat("hum_offset", 0.0);
  calibration.lightLevelMin = preferences.getInt("light_min", 0);
  calibration.lightLevelMax = preferences.getInt("light_max", 1024);
  
  Serial.println("Configuration loaded");
}

void saveConfiguration() {
  preferences.putInt("soil_min", calibration.soilMoistureMin);
  preferences.putInt("soil_max", calibration.soilMoistureMax);
  preferences.putFloat("temp_offset", calibration.temperatureOffset);
  preferences.putFloat("hum_offset", calibration.humidityOffset);
  preferences.putInt("light_min", calibration.lightLevelMin);
  preferences.putInt("light_max", calibration.lightLevelMax);
  
  Serial.println("Configuration saved");
}

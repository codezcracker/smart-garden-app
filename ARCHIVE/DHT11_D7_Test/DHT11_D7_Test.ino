#include <DHT.h>

// DHT11 sensor configuration - D7 (GPIO13)
#define DHT_PIN 13     // D7 = GPIO13
#define DHT_TYPE DHT11

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for serial to initialize
  
  Serial.println("🌡️ DHT11 Sensor Test - D7 (GPIO13)");
  Serial.println("🔌 Wiring: S→D7, Middle→3.3V, Minus→GND");
  Serial.println("----------------------------------------");
  
  // Initialize DHT sensor
  dht.begin();
  delay(2000); // Wait for DHT11 to stabilize
  
  Serial.println("✅ DHT11 initialized on D7!");
  Serial.println("🔄 Starting readings...");
  Serial.println("");
}

void loop() {
  // Read temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ DHT11 sensor failed to read on D7!");
    Serial.println("🔧 Check wiring:");
    Serial.println("   - S wire → D7 (GPIO13)");
    Serial.println("   - Middle wire → 3.3V");
    Serial.println("   - Minus wire → GND");
    Serial.println("");
  } else {
    Serial.println("✅ DHT11 sensor working on D7!");
    Serial.println("🌡️ Temperature: " + String(temperature) + "°C");
    Serial.println("💧 Humidity: " + String(humidity) + "%");
    Serial.println("⏰ Time: " + String(millis()) + "ms");
    Serial.println("");
  }
  
  // Wait 3 seconds between readings
  delay(3000);
}

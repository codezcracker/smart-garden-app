// 2-Pin Soil Moisture Sensor Test with Built-in LED
// Pin: GPIO4 (D2)

#define MOISTURE_PIN 4  // GPIO4 (D2)

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("2-Pin Soil Moisture Sensor Test with Built-in LED");
  Serial.println("Pin: GPIO4 (D2)");
  Serial.println("Wiring:");
  Serial.println("  Pin 1 (Signal) → GPIO4 (D2)");
  Serial.println("  Pin 2 (Ground) → GND");
  Serial.println("----------------------------------------");
  
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(2, OUTPUT);  // Built-in LED (GPIO2)
  
  Serial.println("2-pin sensor and built-in LED initialized!");
  Serial.println("Starting readings...");
  Serial.println("");
}

void loop() {
  int rawValue = analogRead(MOISTURE_PIN);
  
  // Convert to percentage (2-pin sensor calibration)
  float moisturePercent = map(rawValue, 0, 1023, 100, 0);
  
  Serial.print("Raw Value: ");
  Serial.print(rawValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Control built-in LED based on moisture
  if (moisturePercent > 50) {
    digitalWrite(2, LOW);  // Turn on built-in LED (inverted logic)
    Serial.println("💧 Moisture detected - Built-in LED ON");
  } else {
    digitalWrite(2, HIGH); // Turn off built-in LED
    Serial.println("🏜️ Dry soil - Built-in LED OFF");
  }
  
  Serial.println("");
  delay(2000);
}

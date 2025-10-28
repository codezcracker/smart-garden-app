// Moisture Sensor Calibration Test
// Test in different conditions to find the range

#define MOISTURE_PIN A0

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("Moisture Sensor Calibration Test");
  Serial.println("Pin: GPIO4 (D2)");
  Serial.println("Wiring: S->GPIO4, +->3.3V, -->GND");
  Serial.println("----------------------------------------");
  
  pinMode(MOISTURE_PIN, INPUT);
  
  Serial.println("Sensor is working! Now let's calibrate...");
  Serial.println("");
  Serial.println("Test Instructions:");
  Serial.println("1. Keep sensor in AIR - Note values");
  Serial.println("2. Put sensor in WATER - Note values");
  Serial.println("3. Put sensor in DRY SOIL - Note values");
  Serial.println("4. Put sensor in WET SOIL - Note values");
  Serial.println("");
  Serial.println("Starting readings...");
  Serial.println("");
}

void loop() {
  int rawValue = analogRead(MOISTURE_PIN);
  
  // Convert to percentage (inverted: higher value = lower moisture)
  float moisturePercent = map(rawValue, 0, 1023, 100, 0);
  
  Serial.print("Raw Value: ");
  Serial.print(rawValue);
  Serial.print(" | Moisture: ");
  Serial.print(moisturePercent);
  Serial.println("%");
  
  // Status based on raw value
  if (rawValue > 900) {
    Serial.println("Status: VERY DRY (in air?)");
  } else if (rawValue > 600) {
    Serial.println("Status: DRY");
  } else if (rawValue > 300) {
    Serial.println("Status: MOIST");
  } else {
    Serial.println("Status: VERY WET (in water?)");
  }
  
  Serial.println("");
  delay(2000);
}

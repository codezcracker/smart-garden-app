/*
 * LDR + LED + Buzzer Test Program for ESP8266
 * Tests LDR, RGB LED, and Buzzer together
 * 
 * Hardware:
 * - LDR Wire 1 to 3.3V, LDR Wire 2 to A0, LDR Wire 2 to 10KΩ Resistor to GND
 * - RGB LED: Red=D2(GPIO4), Green=D1(GPIO5), Blue=D5(GPIO14), Common Anode to 3.3V
 * - Buzzer: + to D8(GPIO15), - to GND
 */

#define LDR_PIN A0
#define RGB_RED 4
#define RGB_GREEN 5
#define RGB_BLUE 14
#define BUZZER_PIN 15

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize pins
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("\n🌱 LDR + LED + Buzzer Test Starting...");
  Serial.println("Watch for light level changes and LED colors");
}

void loop() {
  // Read LDR value
  int ldrValue = analogRead(LDR_PIN);
  float lightPercent = map(ldrValue, 0, 1023, 0, 100);
  
  // Display readings
  Serial.println("☀️ Light: " + String(lightPercent) + "%");
  
  // LED colors based on light level
  if (lightPercent > 70) {
    // Bright light - Green LED
    setLED(0, 255, 0);
    Serial.println("🟢 Bright light - Green LED");
  } else if (lightPercent > 30) {
    // Normal light - Blue LED
    setLED(0, 0, 255);
    Serial.println("🔵 Normal light - Blue LED");
  } else {
    // Dim light - Red LED
    setLED(255, 0, 0);
    Serial.println("🔴 Dim light - Red LED");
  }
  
  // Buzzer beep based on light level
  if (lightPercent > 80) {
    // Very bright - High pitch beep
    tone(BUZZER_PIN, 2000, 200);
    Serial.println("🔊 Very bright - High pitch beep");
  } else if (lightPercent < 20) {
    // Very dim - Low pitch beep
    tone(BUZZER_PIN, 500, 200);
    Serial.println("🔊 Very dim - Low pitch beep");
  } else {
    // Normal - Medium pitch beep
    tone(BUZZER_PIN, 1000, 200);
    Serial.println("🔊 Normal light - Medium pitch beep");
  }
  
  // Wait 2 seconds
  delay(2000);
}

void setLED(int red, int green, int blue) {
  analogWrite(RGB_RED, red);
  analogWrite(RGB_GREEN, green);
  analogWrite(RGB_BLUE, blue);
}

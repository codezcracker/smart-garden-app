// Basic ESP8266MOD ESP-12E Communication Test
// Super simple test to verify Serial communication

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("ESP8266MOD ESP-12E Basic Test");
  Serial.println("If you see this, communication is working!");
  Serial.println("Board: ESP8266MOD ESP-12E");
  Serial.println("Baud Rate: 115200");
  Serial.println("================================");
}

void loop() {
  Serial.println("ESP8266MOD ESP-12E is alive!");
  Serial.print("Uptime: ");
  Serial.print(millis());
  Serial.println(" ms");
  Serial.println("================================");
  delay(2000);
}

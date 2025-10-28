#include <EEPROM.h>

int dryValue = 0;
int wetValue = 0;
int moisture = 0;
int percentage = 0;

void setup() {
  Serial.begin(9600);
  pinMode(A0, INPUT);
  EEPROM.begin(512);

  Serial.println("Soil Sensor Auto Calibration System");
  delay(1000);

  // Check if calibration values are already saved
  EEPROM.get(0, dryValue);
  EEPROM.get(4, wetValue);

  if (dryValue == 0 && wetValue == 0) {
    Serial.println("⚙️  No calibration data found. Starting calibration...");
    calibrateSensor();
  } else {
    Serial.print("✅ Using saved calibration: Dry=");
    Serial.print(dryValue);
    Serial.print(" Wet=");
    Serial.println(wetValue);
  }
}

void loop() {
  moisture = analogRead(A0);

  // Convert to percentage using saved calibration
  percentage = map(moisture, dryValue, wetValue, 0, 100);
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  Serial.print(moisture);
  Serial.print(" = Moisture = ");
  Serial.print(percentage);
  Serial.println("%");

  delay(1000);
}

void calibrateSensor() {
  Serial.println("Step 1: Keep sensor in AIR (dry) and type 'air' then press Enter");
  waitForCommand("air");
  dryValue = analogRead(A0);
  Serial.print("Dry value saved: ");
  Serial.println(dryValue);

  delay(2000);

  Serial.println("Step 2: Place sensor in WATER and type 'water' then press Enter");
  waitForCommand("water");
  wetValue = analogRead(A0);
  Serial.print("Wet value saved: ");
  Serial.println(wetValue);

  // Save to EEPROM
  EEPROM.put(0, dryValue);
  EEPROM.put(4, wetValue);
  EEPROM.commit();

  Serial.println("✅ Calibration complete and saved to EEPROM!");
}

void waitForCommand(String expected) {
  while (true) {
    if (Serial.available()) {
      String cmd = Serial.readStringUntil('\n');
      cmd.trim();
      if (cmd.equalsIgnoreCase(expected)) {
        break;
      } else {
        Serial.println("Invalid input, try again.");
      }
    }
  }
}

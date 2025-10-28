#include <EEPROM.h>

// Pin definitions
#define BUTTON_PIN 2   // D4 = GPIO2
#define RGB_RED 4      // D2 = GPIO4
#define RGB_GREEN 14   // D5 = GPIO14
#define RGB_BLUE 5     // D1 = GPIO5
#define BUZZER_PIN 15  // D8 = GPIO15

// Button variables
bool buttonPressed = false;
bool buttonReleased = false;
unsigned long buttonPressTime = 0;
unsigned long lastButtonPress = 0;
int buttonPressCount = 0;
unsigned long lastClickTime = 0;

// Device state
bool deviceOn = true;
bool discoveryMode = false;

// EEPROM addresses
#define EEPROM_DEVICE_ON 0
#define EEPROM_PAIRED 1

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("🔘 Button Test Starting...");
  Serial.println("📌 Button Pin: D4 (GPIO2)");
  Serial.println("🔌 Wiring: One side → D4, Other side → GND");
  Serial.println("----------------------------------------");
  
  // Initialize pins
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initialize EEPROM
  EEPROM.begin(512);
  
  // Load device state
  deviceOn = EEPROM.read(EEPROM_DEVICE_ON) == 1;
  
  Serial.println("✅ Button initialized!");
  Serial.println("🔘 Device Status: " + String(deviceOn ? "ON" : "OFF"));
  Serial.println("");
  Serial.println("🎯 Button Functions:");
  Serial.println("1. Long Press (5s): Toggle ON/OFF");
  Serial.println("2. Double Click: Discovery Mode");
  Serial.println("");
  Serial.println("🔄 Starting button monitoring...");
  Serial.println("");
}

void loop() {
  handleButtonPress();
  
  // Show status every 5 seconds
  static unsigned long lastStatus = 0;
  if (millis() - lastStatus > 5000) {
    showStatus();
    lastStatus = millis();
  }
  
  delay(50); // Small delay for button debouncing
}

void handleButtonPress() {
  bool currentButtonState = digitalRead(BUTTON_PIN) == LOW; // LOW when pressed (pullup)
  
  if (currentButtonState && !buttonPressed) {
    // Button just pressed
    buttonPressed = true;
    buttonReleased = false;
    buttonPressTime = millis();
    Serial.println("🔘 Button PRESSED!");
  }
  
  if (!currentButtonState && buttonPressed) {
    // Button just released
    buttonPressed = false;
    buttonReleased = true;
    unsigned long pressDuration = millis() - buttonPressTime;
    
    Serial.println("🔘 Button RELEASED!");
    Serial.println("⏱️ Press Duration: " + String(pressDuration) + "ms");
    
    if (pressDuration > 5000) {
      // Long press - Toggle power
      Serial.println("🔘 LONG PRESS DETECTED - Toggling power...");
      togglePower();
    } else if (pressDuration > 50) {
      // Short press - Check for double click
      handleShortPress();
    }
  }
}

void handleShortPress() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastClickTime < 500) {
    // Double click detected
    buttonPressCount++;
    if (buttonPressCount >= 2) {
      Serial.println("🔘 DOUBLE CLICK DETECTED!");
      startDiscoveryMode();
      buttonPressCount = 0;
    }
  } else {
    // Single click
    buttonPressCount = 1;
    Serial.println("🔘 Single click detected");
  }
  
  lastClickTime = currentTime;
}

void togglePower() {
  deviceOn = !deviceOn;
  saveDeviceState();
  
  if (deviceOn) {
    Serial.println("✅ Device turned ON!");
    setLED(0, 255, 0); // Green LED
    buzzerBeep(1000, 300); // Single beep
  } else {
    Serial.println("❌ Device turned OFF!");
    setLED(0, 0, 0); // LED off
    buzzerDoubleBeep(); // Double beep
  }
  
  delay(1000);
  setLED(0, 0, 0); // Turn off LED
}

void startDiscoveryMode() {
  if (!deviceOn) {
    Serial.println("❌ Cannot start discovery - Device is OFF!");
    return;
  }
  
  discoveryMode = true;
  Serial.println("🔵 Starting discovery mode...");
  
  // Check if connected (simulate)
  bool connected = true; // You can modify this logic
  
  if (connected) {
    Serial.println("✅ Connected - Blue LED + Short beep");
    setLED(0, 0, 255); // Blue LED
    buzzerBeep(1500, 1000); // 1-second beep
  } else {
    Serial.println("❌ Disconnected - Red LED + Long beep");
    setLED(255, 0, 0); // Red LED
    buzzerLongBeep(); // Long beep
  }
  
  delay(2000);
  discoveryMode = false;
  setLED(0, 0, 0); // Turn off LED
  Serial.println("🔵 Discovery mode ended");
}

void setLED(int red, int green, int blue) {
  analogWrite(RGB_RED, red);
  analogWrite(RGB_GREEN, green);
  analogWrite(RGB_BLUE, blue);
}

void buzzerBeep(int frequency, int duration) {
  tone(BUZZER_PIN, frequency, duration);
}

void buzzerDoubleBeep() {
  tone(BUZZER_PIN, 1000, 200);
  delay(300);
  tone(BUZZER_PIN, 1000, 200);
}

void buzzerLongBeep() {
  tone(BUZZER_PIN, 500, 3000); // 3-second long beep
}

void saveDeviceState() {
  EEPROM.write(EEPROM_DEVICE_ON, deviceOn ? 1 : 0);
  EEPROM.commit();
}

void showStatus() {
  Serial.println("📊 Current Status:");
  Serial.println("   Device: " + String(deviceOn ? "ON" : "OFF"));
  Serial.println("   Discovery: " + String(discoveryMode ? "Active" : "Inactive"));
  Serial.println("   Button Ready: ✅");
  Serial.println("");
}

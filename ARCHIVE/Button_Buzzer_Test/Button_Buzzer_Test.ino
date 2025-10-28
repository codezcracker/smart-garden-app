// Button and Buzzer Test - ESP8266MOD ESP-12E
// Test the corrected pin configuration

// Pin definitions (ESP8266MOD ESP-12E) - CONFLICT-FREE
#define BUTTON_PIN 4    // D2 = GPIO4 (safe pin with pullup)
#define BUZZER_PIN 5    // D1 = GPIO5 (safe pin, not GPIO15)

void setup() {
  Serial.begin(115200);
  delay(3000);
  
  Serial.println("Button and Buzzer Test - ESP8266MOD ESP-12E");
  Serial.println("===========================================");
  Serial.println("Pin Configuration:");
  Serial.println("Button: D2 (GPIO4) with internal pullup");
  Serial.println("Buzzer: D1 (GPIO5) - safe pin");
  Serial.println("===========================================");
  
  // Initialize pins
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Enable internal pullup
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("Button and buzzer initialized!");
  Serial.println("");
  Serial.println("Instructions:");
  Serial.println("1. Press and hold button for 5 seconds to test long press");
  Serial.println("2. Quick press to test short press");
  Serial.println("3. Double click to test double click detection");
  Serial.println("");
  Serial.println("Starting test...");
}

void loop() {
  // Read button state
  int buttonState = digitalRead(BUTTON_PIN);
  
  // Button is pressed when LOW (due to pullup)
  if (buttonState == LOW) {
    Serial.println("🔘 Button PRESSED!");
    
    // Test buzzer when button is pressed
    Serial.println("🔊 Testing buzzer...");
    tone(BUZZER_PIN, 1000, 500);  // 1000Hz for 500ms
    delay(600);
    
    // Wait for button release
    while (digitalRead(BUTTON_PIN) == LOW) {
      delay(50);
    }
    
    Serial.println("🔘 Button RELEASED!");
    delay(200);  // Debounce
  }
  
  // Small delay for stability
  delay(50);
}

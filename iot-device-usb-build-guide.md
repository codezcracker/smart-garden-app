# 🔧 Smart Garden IoT Device V1 - USB Build Guide

## 📋 Components Checklist (USB Powered)

### 🔌 Main Controller
- [ ] ESP8266 ESP-12 D1 Mini NodeMCU
- [ ] USB Cable (for power and programming)

### 🌡️ Sensors
- [ ] DHT22 (or DHT11) - Temperature & Humidity
- [ ] LDR + 10kΩ resistor - Light Sensor
- [ ] Soil moisture sensor (analog) - Soil Wet/Dry

### 💡 Actuators
- [ ] RGB LED - Multi-color Indicator
- [ ] LED + 220Ω resistor - Status Light
- [ ] Buzzer (active type) - Alerts

### 🔘 Input
- [ ] Push button + 10kΩ pull-up resistor

### 🔧 Misc
- [ ] Breadboard
- [ ] Jumper wires
- [ ] 220Ω resistor
- [ ] 10kΩ resistors (2x)

---

## 🔌 Circuit Diagram (USB Powered)

```
                    ┌─────────────────┐
                    │   USB Power     │
                    │   5V from PC    │
                    └─────────┬───────┘
                              │ 5V
                    ┌─────────▼───────┐
                    │   ESP8266 D1    │
                    │     Mini        │
                    └─────────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌───────────┐         ┌─────────────┐
   │  DHT22  │         │    LDR    │         │Soil Moisture│
   │   D4    │         │  A0 + 10k │         │     A0      │
   └─────────┘         └───────────┘         └─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────┐         ┌───────────┐         ┌─────────────┐
   │  RGB    │         │   LED     │         │   Buzzer    │
   │D5,D6,D3 │         │ D7 + 220Ω │         │     D8      │
   └─────────┘         └───────────┘         └─────────────┘
        │
        ▼
   ┌─────────┐
   │  Button │
   │  D2 +   │
   │ 10k pull│
   └─────────┘
```

---

## 🔧 Step-by-Step Assembly (USB Version)

### Step 1: ESP8266 Setup
1. **Mount ESP8266 on breadboard**
2. **Connect USB cable** to your computer
3. **Power connections:**
   - VIN → 5V from USB
   - GND → Ground rail on breadboard
   - 3.3V → 3.3V rail on breadboard

### Step 2: Temperature & Humidity Sensor (DHT22)
1. **Connect DHT22:**
   - VCC → 3.3V rail
   - GND → Ground rail
   - Data → D4 (GPIO4)

### Step 3: Light Sensor (LDR)
1. **Create voltage divider:**
   - LDR one leg → 3.3V rail
   - LDR other leg → 10kΩ resistor → Ground rail
   - Junction point → A0 (analog input)

### Step 4: Soil Moisture Sensor
1. **Connect soil sensor:**
   - VCC → 3.3V rail
   - GND → Ground rail
   - A0 → A0 (analog input) - **Note: Shares A0 with LDR**

### Step 5: RGB LED
1. **Connect RGB LED:**
   - Red → D5 (GPIO14)
   - Green → D6 (GPIO12)
   - Blue → D3 (GPIO0)
   - Common Cathode → Ground rail

### Step 6: Status LED
1. **Connect LED:**
   - Anode → D7 (GPIO13)
   - Cathode → 220Ω resistor → Ground rail

### Step 7: Buzzer
1. **Connect buzzer:**
   - Positive → D8 (GPIO15)
   - Negative → Ground rail

### Step 8: Push Button
1. **Connect button:**
   - One leg → D2 (GPIO4)
   - Other leg → 10kΩ pull-up resistor → 3.3V rail
   - Same leg → Ground rail (for pull-down)

---

## 📌 Pin Assignments Summary

```
D2  - Button (with 10kΩ pull-up)
D3  - RGB Blue
D4  - DHT22 Data
D5  - RGB Red
D6  - RGB Green
D7  - Status LED (with 220Ω resistor)
D8  - Buzzer
A0  - LDR + Soil Moisture (multiplexed)
3.3V - Power rail for sensors
GND  - Ground rail
```

---

## 🧪 Testing Sequence

### 1. Power Test
- Connect USB cable
- Check ESP8266 power LED is on
- Verify 3.3V rail has correct voltage

### 2. ESP8266 Boot Test
- Open Serial Monitor (115200 baud)
- Look for boot messages
- Should see "Ready" message

### 3. DHT22 Test
- Upload test code to read temperature/humidity
- Should get reasonable values (20-30°C, 30-80% humidity)

### 4. LDR Test
- Cover/uncover LDR with hand
- Analog reading should change (0-1023)
- Higher value = more light

### 5. Soil Sensor Test
- Test in dry soil (should read low)
- Test in wet soil (should read high)
- Values should be opposite to LDR

### 6. RGB LED Test
- Test each color individually
- Red: D5 HIGH, others LOW
- Green: D6 HIGH, others LOW
- Blue: D3 HIGH, others LOW

### 7. Status LED Test
- D7 HIGH should turn on LED
- D7 LOW should turn off LED

### 8. Buzzer Test
- D8 HIGH should make sound
- D8 LOW should be silent

### 9. Button Test
- Press button, D2 should read LOW
- Release button, D2 should read HIGH

---

## 💻 Basic Test Code

```cpp
// Basic component test code
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT22
#define LDR_PIN A0
#define SOIL_PIN A0
#define RGB_RED 5
#define RGB_GREEN 6
#define RGB_BLUE 3
#define STATUS_LED 7
#define BUZZER 8
#define BUTTON 2

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(RGB_RED, OUTPUT);
  pinMode(RGB_GREEN, OUTPUT);
  pinMode(RGB_BLUE, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  
  Serial.println("Smart Garden IoT V1 - Component Test");
}

void loop() {
  // Test DHT22
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temp); Serial.print("°C, ");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println("%");
  
  // Test LDR
  int ldrValue = analogRead(LDR_PIN);
  Serial.print("LDR: "); Serial.println(ldrValue);
  
  // Test Soil (same pin as LDR - you'll need to switch)
  int soilValue = analogRead(SOIL_PIN);
  Serial.print("Soil: "); Serial.println(soilValue);
  
  // Test Button
  int buttonState = digitalRead(BUTTON);
  Serial.print("Button: "); Serial.println(buttonState ? "Released" : "Pressed");
  
  // Test RGB LED (cycle through colors)
  digitalWrite(RGB_RED, HIGH);
  digitalWrite(RGB_GREEN, LOW);
  digitalWrite(RGB_BLUE, LOW);
  delay(1000);
  
  digitalWrite(RGB_RED, LOW);
  digitalWrite(RGB_GREEN, HIGH);
  digitalWrite(RGB_BLUE, LOW);
  delay(1000);
  
  digitalWrite(RGB_RED, LOW);
  digitalWrite(RGB_GREEN, LOW);
  digitalWrite(RGB_BLUE, HIGH);
  delay(1000);
  
  // Test Status LED
  digitalWrite(STATUS_LED, HIGH);
  delay(500);
  digitalWrite(STATUS_LED, LOW);
  delay(500);
  
  // Test Buzzer
  digitalWrite(BUZZER, HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);
  
  Serial.println("---");
  delay(2000);
}
```

---

## ⚠️ Important Notes

### Power Management
- **USB Power:** 5V from computer USB port
- **Current Draw:** ~200-300mA total
- **No Battery:** Device only works when USB connected

### Pin Sharing
- **A0 Pin:** Both LDR and Soil sensor share A0
- **Solution:** Use a switch or test one at a time
- **Alternative:** Use different analog pins if available

### Safety Tips
- Double-check all connections before powering on
- Use multimeter to verify voltages
- Start with one component at a time
- Keep wiring neat and organized

---

## 🚀 Next Steps

After successful testing:
1. **Add WiFi functionality** to connect to your dashboard
2. **Implement sensor data logging**
3. **Add control logic** for watering/lighting
4. **Integrate with your web app**
5. **Add battery system** for standalone operation

Ready to start building? Let me know if you need clarification on any step!

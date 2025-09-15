# 🔧 Smart Garden IoT Device V1 - Build Guide

## 📋 Components Checklist

### ✅ Power System (Already Connected)
- [x] 18650 Li-ion battery
- [x] BMS 1S protection board
- [ ] Techtonics 1.5V to 5V DC-DC Boost Converter

### 🔌 Main Controller
- [ ] ESP8266 ESP-12 D1 Mini NodeMCU

### 🌡️ Sensors
- [ ] DHT22 (or DHT11) - Temperature & Humidity
- [ ] LDR + 10kΩ resistor - Light Sensor
- [ ] Soil moisture sensor (analog) - Soil Wet/Dry

### 💡 Actuators
- [ ] LED + 220Ω resistor - Status Light
- [ ] RGB LED - Multi-color Indicator
- [ ] Buzzer (active type) - Alerts

### 🔘 Input
- [ ] Push button + 10kΩ pull-up resistor

### 🔧 Misc
- [ ] Breadboard/PCB
- [ ] Jumper wires
- [ ] 220Ω resistors (2x)
- [ ] 10kΩ resistors (2x)

---

## 🔌 Circuit Diagram

```
                    ┌─────────────────┐
                    │  18650 Battery  │
                    │   + BMS Board   │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │  DC-DC Boost    │
                    │  1.5V → 5V      │
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
   │  D5,D6  │         │ D7 + 220Ω │         │     D8      │
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

## 🔧 Step-by-Step Assembly

### Step 1: Power Connection
1. **Connect DC-DC Boost Converter**
   - Input: Battery + BMS output (1.5V-4.2V)
   - Output: 5V to ESP8266 VIN pin
   - Ground: Connect all grounds together

### Step 2: ESP8266 Setup
1. **Mount ESP8266 on breadboard/PCB**
2. **Power connections:**
   - VIN → 5V from boost converter
   - GND → Common ground
   - 3.3V → For sensors (if needed)

### Step 3: Temperature & Humidity Sensor (DHT22)
1. **Connect DHT22:**
   - VCC → 3.3V (or 5V)
   - GND → Ground
   - Data → D4 (GPIO4)

### Step 4: Light Sensor (LDR)
1. **Create voltage divider:**
   - LDR one leg → 3.3V
   - LDR other leg → 10kΩ resistor → Ground
   - Junction point → A0 (analog input)

### Step 5: Soil Moisture Sensor
1. **Connect soil sensor:**
   - VCC → 3.3V
   - GND → Ground
   - A0 → A0 (analog input)

### Step 6: Status LED
1. **Connect LED:**
   - Anode → D7 (GPIO13)
   - Cathode → 220Ω resistor → Ground

### Step 7: RGB LED
1. **Connect RGB LED:**
   - Red → D5 (GPIO14)
   - Green → D6 (GPIO12)
   - Blue → D3 (GPIO0)
   - Common Cathode → Ground

### Step 8: Buzzer
1. **Connect buzzer:**
   - Positive → D8 (GPIO15)
   - Negative → Ground

### Step 9: Push Button
1. **Connect button:**
   - One leg → D2 (GPIO4)
   - Other leg → 10kΩ pull-up resistor → 3.3V
   - Same leg → Ground (for pull-down)

---

## ⚠️ Important Notes

### Power Management
- **Battery Life:** ~2-3 days continuous operation
- **Sleep Mode:** Implement deep sleep for longer battery life
- **Voltage Monitoring:** Monitor battery level via ADC

### Pin Assignments
```
D2  - Button (with pull-up)
D3  - RGB Blue
D4  - DHT22 Data
D5  - RGB Red
D6  - RGB Green
D7  - Status LED
D8  - Buzzer
A0  - LDR + Soil Moisture (multiplexed)
```

### Safety Tips
- Double-check all connections before powering on
- Use multimeter to verify voltages
- Start with low power, test each component
- Keep wiring neat and organized

---

## 🧪 Testing Sequence

1. **Power Test:** Verify 5V and 3.3V outputs
2. **ESP8266 Boot:** Check serial output
3. **DHT22:** Read temperature/humidity
4. **LDR:** Check light readings
5. **Soil Sensor:** Test in dry/wet soil
6. **LEDs:** Test each color
7. **Buzzer:** Test sound output
8. **Button:** Test input detection

---

## 📱 Next Steps

After assembly, you'll need:
1. **Arduino IDE setup** for ESP8266
2. **WiFi credentials** configuration
3. **Sensor calibration** and testing
4. **Code upload** and testing
5. **Integration** with your web dashboard

Ready to proceed with the assembly? Let me know if you need clarification on any step!

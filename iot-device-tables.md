# 🔧 Smart Garden IoT Device Components

## 📋 **Table 1: Current Implementation**

| Category | Component | Purpose / Notes |
|----------|-----------|-----------------|
| **Power** | 18650 Li-ion battery | Main power source (3.0–4.2V) |
| **Power** | BMS 1S protection board | Battery protection (overcharge/discharge) |
| **Power** | Techtonics 1.5V to 5V DC-DC Boost Converter | Step-up voltage for ESP or other modules |
| **MCU / Main** | 2B4 ESP8266 ESP-12 D1 Mini NodeMCU | Microcontroller + WiFi |
| **Sensors** | DHT22 (or DHT11) | Temperature & humidity |
| **Sensors** | LDR + 10kΩ resistor | Light intensity measurement |
| **Sensors** | Soil moisture sensor (analog) | Soil wet/dry monitoring |
| **Actuators** | LED + 220Ω resistor | Status / indicator light |
| **Actuators** | RGB LED | Multi-color indicator |
| **Actuators** | Buzzer (active type) | Alerts / notifications |
| **Input** | Push button (with pull-up resistor) | Manual reset / trigger input |
| **Misc.** | Wires, resistors (220Ω, 10kΩ), breadboard / PCB | Basic wiring and prototyping |

---

## 🚀 **Table 2: Future Enhancements**

| Category | Component | Purpose / Notes |
|----------|-----------|-----------------|
| **MCU / Main** | ADS1115 ADC module | High-resolution analog readings (for pH/EC/etc.) |
| **Sensors** | pH sensor | Soil acidity/alkalinity monitoring |
| **Sensors** | EC sensor | Soil nutrient measurement |
| **Sensors** | MH-Z19 CO₂ sensor | Air CO₂ measurement |
| **Actuators** | Additional RGB or status LEDs | Visual multi-state indicators |

---

## 📊 **Summary**

- **Current Components**: 12 items
- **Future Components**: 5 items
- **Total Components**: 17 items
- **Categories**: Power, MCU/Main, Sensors, Actuators, Input, Misc.

## 💡 **Implementation Notes**

### **Current Device (V1)**
- **Cost**: ~$25-35
- **Build Time**: 2-4 hours
- **Difficulty**: Beginner
- **Power**: Battery powered
- **Sensors**: Basic environmental monitoring

### **Future Device (V2)**
- **Cost**: ~$75-100
- **Build Time**: 4-6 hours
- **Difficulty**: Intermediate
- **Power**: May need external power
- **Sensors**: Advanced soil analysis + environmental monitoring

